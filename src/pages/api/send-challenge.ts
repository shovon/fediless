import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function SendChallenge(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const privateKey = crypto.createPrivateKey({
		key: atob(process.env.SIGNING_KEY!),
		format: "pem",
	});

	console.log(
		privateKey.export({
			format: "jwk",
		})
	);

	const payload = `${Date.now() + 1000 * 60 * 3}`;

	const sign = crypto.createSign("sha256");
	sign.update(payload);
	const signature = sign.sign(privateKey).toString("base64");

	res.status(200).json({
		payload,
		signature,
	});
}
