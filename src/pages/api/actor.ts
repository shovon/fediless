import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import {
	actor,
	inbox,
	outbox,
	following,
	followers,
	liked,
} from "@/lib/constants";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const publicKey = crypto.createPublicKey({
		key: atob(process.env.FEDI_SIGNING_KEY!),
		format: "pem",
		type: "pkcs1",
	});

	const publicKeyPem = publicKey.export({
		format: "pem",
		type: "spki",
	});

	res
		.setHeader("Content-Type", "application/activity+json")
		.status(200)
		.send(
			JSON.stringify({
				"@context": [
					"https://www.w3.org/ns/activitystreams",
					"https://w3id.org/security/v1",
				],
				id: actor,
				type: "Person",
				inbox,
				outbox,
				following,
				followers,
				liked,
				preferredUsername: "actor",
				publicKey: {
					id: `${actor}#main-key`,
					owner: actor,
					publicKeyPem,
				},
			})
		);
}
