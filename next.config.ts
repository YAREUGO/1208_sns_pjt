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
  // Vercel 배포 시 클라이언트 참조 매니페스트 문제 해결
  experimental: {
    // Next.js 15에서 클라이언트 컴포넌트 참조 안정화
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog"],
  },
  // 빌드 출력 최적화
  output: undefined, // Vercel이 자동으로 처리
};

export default nextConfig;
