import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { followers } from "@/lib/constants";

const prisma = new PrismaClient();

export async function getPosts() {
	return (await prisma.posts.findMany()).map(
		(post) =>
			JSON.parse(JSON.stringify(post)) as {
				id: number;
				content: string;
				createdAt: string;
				sent: boolean;
			}
	);
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	res
		.setHeader("Content-Type", "application/activity+json")
		.status(200)
		.send(await getPosts());
}
