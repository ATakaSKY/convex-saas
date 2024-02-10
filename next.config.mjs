/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "fleet-firefly-566.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
