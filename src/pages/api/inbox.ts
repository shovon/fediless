import type { NextApiRequest, NextApiResponse } from "next";
import * as jsonld from "jsonld";
import { origin, actor as actorIRI } from "@/lib/constants";
import { acceptFollow } from "@/lib/accept-follow";
import { lookupActor } from "@/lib/lookup-actor";
import {
	arrayOf,
	object,
	string,
	InferType,
	unknown,
} from "@/lib/type-guardian";
import { objectMap } from "@/lib/object-map";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const idNodeSchema = object({
	"@id": string(),
});

const activityStreamsPrefix = "https://www.w3.org/ns/activitystreams#";

const followActivitySchema = objectMap(
	{
		[`${activityStreamsPrefix}actor`]: "actor",
		[`${activityStreamsPrefix}object`]: "object",
	},
	{
		"@id": string(),
		actor: arrayOf(idNodeSchema),
		object: arrayOf(idNodeSchema),
	}
);

const undoActivitySchema = objectMap(
	{
		[`${activityStreamsPrefix}actor`]: "actor",
		[`${activityStreamsPrefix}object`]: "object",
	},
	{
		["@id"]: string(),
		actor: arrayOf(idNodeSchema),
		object: arrayOf(unknown()),
	}
);

type FollowActivity = InferType<typeof followActivitySchema>;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// TODO: check the digest and signature. Otherwise, people can troll us badly.
	const document = await JSON.parse(req.body);
	console.log(JSON.stringify(document, null, 2));

	const nodes = await jsonld.expand(document);

	if (nodes.length !== 1) {
		res.status(400).json({
			[`${origin}/ns#error`]: [
				{
					["@value"]: "Invalid activity",
				},
			],
		});
		return false;
	}

	const [activity] = nodes;

	switch (true) {
		case activity["@type"]?.includes(`${activityStreamsPrefix}Follow`):
			{
				const validation = followActivitySchema.validate(activity);
				if (!validation.isValid) {
					// Respond by telling the sender that they screwed up.
					console.error("Validation error. Value", validation.error.value);
					res.status(400);
					res.setHeader("Content-Type", "application/ld+json");
					res.write(
						JSON.stringify({
							[`${origin}/ns#error`]: [
								{
									["@value"]: "Invalid activity",
								},
							],
						})
					);
					return;
				}
				for (const recipient of validation.value.object) {
					if (recipient["@id"] !== actorIRI) {
						// TODO: maybe we should just reject the activity?

						continue;
					}

					for (const actor of validation.value.actor) {
						const actorObject = await lookupActor(actor["@id"]);
						for (const inbox of actorObject.inbox) {
							// TODO: add to database.
							console.log("Adding follower");
							await acceptFollow(inbox["@id"], document);
						}
						const result = await prisma.followers.upsert({
							where: {
								actorId: actor["@id"],
							},
							update: {
								followId: validation.value["@id"],
								acceptId: `${actorIRI}#accept/follow/${Date.now()}`,
							},
							create: {
								actorId: actor["@id"],
								followId: validation.value["@id"],
								acceptId: `${actorIRI}#accept/follow/${Date.now()}`,
							},
						});
						console.log(result);
					}
					break;
				}
			}
			break;
		case activity["@type"]?.includes(`${activityStreamsPrefix}Undo`):
			{
				// {
				//   "@context":"https://www.w3.org/ns/activitystreams",
				//   "id":"https://techhub.social/users/manlycoffee#follows/1196224/undo",
				//   "type":"Undo",
				//   "actor":"https://techhub.social/users/manlycoffee",
				//   "object":{
				//     "id":"https://techhub.social/4e82a642-3472-46fe-a28d-abb8dd709fc6",
				//     "type":"Follow",
				//     "actor":"https://techhub.social/users/manlycoffee",
				//     "object":"https://feditest.salrahman.com/activity/actors/john13"
				//   }
				// }

				console.log("Got request to undo a previous activity");

				const validation = undoActivitySchema.validate(activity);
				if (!validation.isValid) {
					// Respond by telling the sender that they screwed up.
					console.log("The validation failed");
					res.status(400);
					res.setHeader("Content-Type", "application/json");
					res.write(
						JSON.stringify({
							[`${origin}/ns#error`]: [
								{
									["@value"]: "Invalid activity",
								},
							],
						})
					);
					return;
				}
				if (Array.isArray(validation.value.object)) {
					for (const obj of validation.value.object) {
						const validation = object({ "@type": arrayOf(unknown()) }).validate(
							obj
						);
						if (!validation.isValid) {
							continue;
						}

						switch (true) {
							case validation.value["@type"]?.includes(
								`${activityStreamsPrefix}Follow`
							):
								{
									console.log("The activity to undo is a follow");
									const validation = followActivitySchema.validate(obj);
									if (!validation.isValid) {
										// Respond by telling the sender that they screwed up.
										continue;
									}

									// TODO: starting to feel lazy. Try to match the actors list
									// to the parent undo activity. But for now, this follow and
									// undo should be fine.
									for (const recipient of validation.value.object) {
										if (recipient["@id"] !== actorIRI) {
											continue;
										}
										try {
											await prisma.followers.delete({
												where: {
													actorId: validation.value.actor[0]["@id"],
												},
											});

											console.log("Deleted follower");
										} catch {
											console.log("The actor to delete was not found");
										}
									}
								}
								break;
						}
					}
				}
			}
			break;
	}

	res.status(200);
	res.setHeader("Content-Type", "application/ld+json");
	res.write("{}");
}
