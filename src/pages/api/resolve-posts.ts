import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { lookupActor } from "@/lib/lookup-actor";
import {
	actor as mainActorIri,
	post as postsUrlTemplate,
} from "@/lib/constants";
import { send as sendActivity } from "@/lib/send-activity";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const domainsSent = new Set<string>();

	const posts = await prisma.posts.findMany({
		where: {
			sent: false,
		},
	});

	const followers = await prisma.followers.findMany({});

	for (const post of posts) {
		const activity = {
			"@context": "https://www.w3.org/ns/activitystreams",

			id: `${mainActorIri}#/${Date.now()}/create-post/${post.id}}`,
			type: "Create",
			actor: mainActorIri,

			object: {
				id: postsUrlTemplate.replace(":id", post.id.toString()),
				type: "Note",
				published: post.createdAt.toISOString(),
				attributedTo: mainActorIri,
				content: post.content,
				to: "https://www.w3.org/ns/activitystreams#Public",
			},
		};

		console.log(JSON.stringify(activity, null, 2));

		for (const follower of followers) {
			const u = new URL(follower.actorId);
			if (domainsSent.has(u.host)) {
				continue;
			}
			const actor = await lookupActor(follower.actorId);

			// TODO: if sending to a shared inbox failed, then we should just fallback
			//   to sending to the inbox.
			if (actor.endpoints && actor.endpoints.some((e) => !!e.sharedInbox)) {
				for (const endpoint of actor.endpoints) {
					if (endpoint.sharedInbox) {
						for (const sharedInbox of endpoint.sharedInbox) {
							sendActivity(sharedInbox["@id"], activity);
						}
					}
				}

				domainsSent.add(u.host);
			} else {
				for (const inbox of actor.inbox) {
					sendActivity(inbox["@id"], activity);
				}
			}
		}

		await prisma.posts.update({
			where: {
				id: post.id,
			},
			data: {
				sent: true,
			},
		});
	}

	res.status(200);
	res.send(JSON.stringify({}));
}
