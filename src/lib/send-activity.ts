import http from "http";
import { sign } from "@/lib/sign";
import crypto from "crypto";

export async function send(inbox: string, activity: unknown) {
	const body = JSON.stringify(activity);

	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(body)
	);

	const request = new Request(inbox, {
		method: "POST",
		body,
	});
	request.headers.set(
		"Digest",
		`sha-256=${Buffer.from(digest).toString("base64")}`
	);
	request.headers.set("Content-Type", "application/activity+json");

	const privateKeyPem = atob(process.env.FEDI_SIGNING_KEY!);

	sign(
		request,
		crypto.createPrivateKey({
			key: privateKeyPem,
			format: "pem",
			type: "pkcs1",
		}),
		["Digest"]
	);

	return fetch(request);
}
