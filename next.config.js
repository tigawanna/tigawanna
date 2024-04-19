/** @type {import('next').NextConfig} */
const nextConfig = {
	//   experimental: {
	//     serverActions: true,
	//   },
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "127.0.0.1",
			},
			{
				protocol: "https",
				hostname: "tigawanna-pocketbase.fly.dev",
			},
			{
				protocol: "https",
				hostname: "opengraph.githubassets.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},

			{
				protocol: "https",
				hostname: "media.dev.to",
			},

			{
				protocol: "https",
				hostname: "repository-images.githubusercontent.com",
			},
		],
	},

	eslint: {
		ignoreDuringBuilds: true,
	},
};

module.exports = nextConfig;
