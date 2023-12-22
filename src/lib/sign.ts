import { ClientRequest } from "http";
import crypto from "crypto";
import { actor } from "./constants";

export function sign(req: Request, key: crypto.KeyObject, headers: string[]) {
	const signer = crypto.createSign("sha256");

	const url = new URL(req.url);

	const creationDate = Math.floor(Date.now() / 1000);

	const created = [`(created)`, `${creationDate}`];
	const requestTarget = [
		`(request-target)`,
		`${req.method.toLowerCase()} ${url.pathname}`,
	];

	const encodedHeaders = [
		created,
		requestTarget,
		...headers
			.filter((e) => req.headers.get(e))
			.map((header) => {
				const value = req.headers.get(header);
				return [
					`${header.toLowerCase()}`,
					`${Array.isArray(value) ? value.join(", ") : value}`,
				];
			}),
	];

	signer.update(encodedHeaders.map((params) => params.join(": ")).join("\n"));

	const signature = signer.sign(key);

	req.headers.set(
		"Signature",
		`created=${creationDate},keyId="${actor}#main-key",algorithm="hs2019",headers="${encodedHeaders
			.map(([left]) => left)
			.join(" ")}",signature="${signature.toString("base64")}"`
	);
}
