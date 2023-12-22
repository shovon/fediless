import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { followers } from "@/lib/constants";
import { origin, actor } from "@/lib/constants";
import { postObject } from "../../../lib/post-object";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (typeof req.query.id !== "string") {
		return res
			.setHeader("Content-Type", "application/ld+json")
			.status(500)
			.send(
				JSON.stringify({
					[`${origin}/ns#error`]: [
						{
							"@value": "No idea how we're here",
						},
					],
				})
			);
	}
	const id = parseInt(req.query.id);
	const post = await prisma.posts.findFirst({
		where: {
			id,
		},
	});

	if (!post) {
		return res
			.setHeader("Content-Type", "application/ld+json")
			.status(404)
			.send(
				JSON.stringify({
					[`${origin}/ns#error`]: [
						{
							"@value": "Post not found",
						},
					],
				})
			);
	}

	res
		.setHeader("Content-Type", "application/activity+json")
		.status(200)
		.json(
			postObject({
				id,
				published: post.createdAt,
				senderID: actor,
				content: post.content,
				recipientId: "https://www.w3.org/ns/activitystreams#Public",
			})
		);
}
