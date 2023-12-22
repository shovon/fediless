import { string, InferType, arrayOf, object } from "./type-guardian";
import { objectMap } from "./object-map";
import * as jsonld from "jsonld";
import { optional } from "./optional";

const activityStreamsPrefix = "https://www.w3.org/ns/activitystreams#";

const actorSchema = objectMap(
	{
		[`${activityStreamsPrefix}preferredUsername`]: "preferredUsername",
		"http://www.w3.org/ns/ldp#inbox": "inbox",
		[`${activityStreamsPrefix}endpoints`]: "endpoints",
		// [`${activityStreamsPrefix}#outbox`]: "outbox",
		// [`${activityStreamsPrefix}#followers`]: "followers",
		// [`${activityStreamsPrefix}#following`]: "following",
	},
	{
		"@id": string(),
		inbox: arrayOf(object({ "@id": string() })),
		endpoints: optional(
			arrayOf(
				objectMap(
					{
						[`${activityStreamsPrefix}sharedInbox`]: "sharedInbox",
					},
					{
						sharedInbox: optional(arrayOf(object({ "@id": string() }))),
					}
				)
			)
		),
	}
);

type Actor = InferType<typeof actorSchema>;

export async function lookupActor(id: string): Promise<Actor> {
	const response = await fetch(id, {
		headers: {
			Accept: "application/activity+json",
		},
	});
	const json = await response.json();
	const obj = await jsonld.expand(json);
	if (obj.length !== 1) {
		throw new Error("Invalid actor");
	}
	const validation = actorSchema.validate(obj[0]);
	if (!validation.isValid) {
		console.log(validation.error.value);
		throw new Error("Invalid actor");
	}
	return validation.value;
}
