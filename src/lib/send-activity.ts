import http from "http";
import { sign } from "@/lib/sign";
import crypto from "crypto";

export async function send(inbox: string, activity: any) {
	return new Promise(async (resolve, reject) => {
		const privateKeyPem = atob(process.env.FEDI_SIGNING_KEY!);

		const u = new URL(inbox);
		const options: http.RequestOptions = {
			hostname: u.hostname,
			port: u.port || u.protocol === "https:" ? 443 : 80,
			path: u.pathname,
			method: "POST",
			headers: {
				"Content-Type": "application/activity+json",
			},
		};

		const req = http.request(options);
		req.write(JSON.stringify(activity));

		const body = JSON.stringify(activity);

		const digest = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(body)
		);

		req.setHeader(
			"Digest",
			"sha-256=" + Buffer.from(digest).toString("base64")
		);

		sign(
			req,
			crypto.createPrivateKey({
				key: privateKeyPem,
				format: "pem",
				type: "pkcs1",
			}),
			["Digest"]
		);

		req.write(body);

		req.end();
	});
}
