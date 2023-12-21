import { ClientRequest } from "http";
import crypto from "crypto";

export async function sign(
	req: ClientRequest,
	key: crypto.KeyObject,
	headers: string[]
) {
	const signer = crypto.createSign("sha256");

	const created = [`(created)`, `${Math.floor(Date.now() / 1000)}`];
	const requestTarget = [
		`(request-target)`,
		`${req.method.toLowerCase()} ${req.path}`,
	];

	const encodedHeaders = [
		created,
		requestTarget,
		...headers
			.filter((e) => req.getHeader(e))
			.map((header) => {
				const value = req.getHeader(header);
				return [
					`${header.toLowerCase()}`,
					`${Array.isArray(value) ? value.join(", ") : value}`,
				];
			}),
	];

	signer.update(encodedHeaders.map((params) => params.join(": ")).join("\n"));

	const signature = signer.sign(key);

	const signatureHex = Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	req.setHeader(
		"Signature",
		`keyId="${
			process.env.SERVER_HOST
		}#main-key",algorithm="hs2019",headers="${encodedHeaders.map(
			([left]) => left
		)}",signature="${signatureHex}"`
	);
}
