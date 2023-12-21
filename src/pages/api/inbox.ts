import type { NextApiRequest, NextApiResponse } from "next";
import * as jsonld from "jsonld";
import { origin } from "@/lib/constants";
import { acceptFollow } from "../../lib/accept-follow";
import { lookupActor } from "@/lib/lookup-actor";

function forceArray<T>(value: T | T[]): T[] {
	if (Array.isArray(value)) {
		return value;
	}
	return [value];
}

const activityStreamsPrefix = "https://www.w3.org/ns/activitystreams";

function extractID(value: string | { "@id": string }) {
	if (typeof value === "string") {
		return value;
	}
	return value[`@id`];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const nodes = await jsonld.expand(JSON.parse(req.body));
	if (nodes.length !== 1) {
		res.status(400).json({
			[`${origin}/ns#error`]: [
				{
					"@value": "Invalid activity",
				},
			],
		});
	}
	const [activity] = nodes;
	if (activity["@type"]?.includes(`${activityStreamsPrefix}#Follow`)) {
		for (const actor of forceArray(
			activity[`${activityStreamsPrefix}#actor`]
		)) {
			await lookupActor((actor as jsonld.NodeObject)["@id"] as string);
		}
	}
}
