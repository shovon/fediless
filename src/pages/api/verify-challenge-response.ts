import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

/**
 * The whole point of this function is to be able to verify a signature, given
 * a payload.
 *
 * The signature verification will happen against the public key that's on
 * file.
 */
export default function VerifyTest(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		res.status(405).send("Method not allowed.");
		return;
	}

	const publicKey = crypto.createPublicKey({
		key: atob(process.env.VERIFICATION_KEY!),
		format: "pem",
	});

	const payload = JSON.parse(req.body) as {
		signature: string;
		data: string;
	};

	const signature = Buffer.from(payload.signature, "base64");
	const data = Buffer.from(payload.data, "base64");

	const verifier = crypto.createVerify("sha256");
	verifier.update(data);

	if (!verifier.verify(publicKey, signature)) {
		res.status(400).send("Invalid signature.");
		return;
	}

	res.status(200).send("OK");
}
