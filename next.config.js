/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: "/.well-known/webfinger",
				destination: "/api/webfinger",
			},
		];
	},
};

module.exports = nextConfig;
