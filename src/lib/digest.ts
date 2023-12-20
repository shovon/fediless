import type { NextApiResponse } from "next";

export async function digest(res: NextApiResponse, body: ArrayBufferLike) {
	const digest = await crypto.subtle.digest("SHA-256", body);
	const digestHex = Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	res.setHeader("Digest", `sha-256=${digestHex}`);
}
