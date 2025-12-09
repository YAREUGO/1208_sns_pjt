import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Supabase Storage 도메인 (동적 추가)
      { hostname: "*.supabase.co" },
      { hostname: "supabase.co" },
    ],
  },
};

export default nextConfig;
