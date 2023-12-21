import { string, InferType, arrayOf, object } from "./type-guardian";
import { objectMap } from "./object-map";

const activityStreamsPrefix = "https://www.w3.org/ns/activitystreams";

const actorSchema = objectMap(
	{
		[`${activityStreamsPrefix}#preferredUsername`]: "preferredUsername",
		[`${activityStreamsPrefix}#inbox`]: "inbox",
		// [`${activityStreamsPrefix}#outbox`]: "outbox",
		// [`${activityStreamsPrefix}#followers`]: "followers",
		// [`${activityStreamsPrefix}#following`]: "following",
	},
	{
		"@id": string(),
		inbox: arrayOf(object({ "@id": string() })),
	}
);

type Actor = InferType<typeof actorSchema>;

export async function lookupActor(id: string): Promise<Actor> {
	const response = await fetch(id);
	const json = await response.json();
	const validation = actorSchema.validate(json);
	if (!validation.isValid) {
		throw new Error("Invalid actor");
	}
	return validation.value;
}
