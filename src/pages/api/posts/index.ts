import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { followers } from "@/lib/constants";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	res
		.setHeader("Content-Type", "application/activity+json")
		.status(200)
		.send("{}");
}
