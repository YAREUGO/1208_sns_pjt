/**
 * @file app/page.tsx
 * @description 홈 피드 페이지
 *
 * 모든 사용자의 게시물을 시간 역순으로 표시합니다.
 * PostFeed 컴포넌트를 사용하여 무한 스크롤로 게시물을 로드합니다.
 */

import { PostFeed } from "@/components/post/PostFeed";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarV2 } from "@/components/layout/SidebarV2";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomNavV2 } from "@/components/layout/BottomNavV2";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const useV2Design = true; // V2 디자인 사용 여부

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)' }}>
      {/* Sidebar (Desktop/Tablet) */}
      {useV2Design ? <SidebarV2 /> : <Sidebar />}

      {/* Header (Mobile only) */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200",
          // Desktop: Sidebar 너비만큼 왼쪽 여백
          useV2Design ? "md:ml-[280px]" : "md:ml-[72px] lg:ml-[244px]",
          // Mobile: Header 높이만큼 상단 여백
          "pt-[60px] md:pt-0",
          // Mobile: BottomNav 높이만큼 하단 여백
          useV2Design ? "pb-[60px] md:pb-0" : "pb-[50px] md:pb-0"
        )}
      >
        <div className="max-w-[630px] mx-auto px-4 py-8">
          <PostFeed useV2={useV2Design} />
        </div>
      </main>

      {/* BottomNav (Mobile only) */}
      {useV2Design ? <BottomNavV2 /> : <BottomNav />}
    </div>
  );
}
