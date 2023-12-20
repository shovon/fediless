import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.setHeader("Content-Type", "application/activity+json").status(400).json({
		"https://fediless.salrahman.com/ns#message": "Unauthorized",
	});
}
