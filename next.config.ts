import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 — imágenes de productos y contenido
      {
        protocol: "https",
        hostname: "pub-0a284815d98e404791f210d7bd0fb1f6.r2.dev",
      },
      // Google profile photos (NextAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // 4.5MB is the real Vercel limit for server action payloads.
      // Images now upload directly to R2 via presigned URLs, so 4MB is sufficient.
      bodySizeLimit: "4mb",
    },
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
