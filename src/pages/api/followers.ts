import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { followers } from "@/lib/constants";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const total = await prisma.followers.count({});

	if (new URL(`https://a${req.url}`!).searchParams.get("page") === "1") {
		res
			.setHeader("Content-Type", "application/activity+json")
			.status(200)
			.send(
				JSON.stringify({
					"@context": "https://www.w3.org/ns/activitystreams",
					id: followers,
					type: "OrderedCollectionPage",
					partOf: followers,
					orderedItems: (await prisma.followers.findMany({})).map(
						(e) => e.actorId
					),
				})
			);
		return;
	}
	res
		.setHeader("Content-Type", "application/activity+json")
		.status(200)
		.send(
			JSON.stringify({
				"@context": "https://www.w3.org/ns/activitystreams",
				id: followers,
				type: "OrderedCollection",
				totalItems: total,
				first: total ? `${followers}?page=1` : undefined,
			})
		);
}
