import type { NextApiRequest, NextApiResponse } from "next";
import { origin, actor } from "@/lib/constants";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	// TODO: properly filter things out.

	res
		.setHeader("Content-Type", "application/jrd+json")
		.status(200)
		.send(
			JSON.stringify({
				subject: "acct:main@fediless.salrahman.com",
				aliases: [origin, actor],
				links: [
					{
						rel: "https://webfinger.net/rel/profile-page",
						type: "text/html",
						href: actor,
					},
					{
						rel: "self",
						type: "application/activity+json",
						href: actor,
					},
					// TODO: add profile picture here.
				],
			})
		);
}
