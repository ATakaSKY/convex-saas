/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "fleet-firefly-566.convex.cloud",
      },
      {
        hostname: "ceaseless-reindeer-375.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
