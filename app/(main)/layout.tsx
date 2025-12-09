/**
 * @file app/(main)/layout.tsx
 * @description 메인 레이아웃 컴포넌트
 *
 * 2025 스타일 레이아웃 (V2):
 * - Desktop: Sidebar (280px) + Main Content (최대 630px 중앙 정렬)
 * - Mobile: Header (60px) + Main Content + BottomNav (60px)
 *
 * 배경색: var(--color-bg-app)
 */

import { SidebarV2 } from "@/components/layout/SidebarV2";
import { Header } from "@/components/layout/Header";
import { BottomNavV2 } from "@/components/layout/BottomNavV2";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)' }}>
      {/* Sidebar (Desktop/Tablet) */}
      <SidebarV2 />

      {/* Header (Mobile only) */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200",
          // Desktop: Sidebar 너비만큼 왼쪽 여백 (V2: 280px)
          "md:ml-[280px]",
          // Mobile: Header 높이만큼 상단 여백
          "pt-[60px] md:pt-0",
          // Mobile: BottomNav 높이만큼 하단 여백 (V2: 60px)
          "pb-[60px] md:pb-0"
        )}
      >
        <div className="max-w-[630px] mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* BottomNav (Mobile only) */}
      <BottomNavV2 />
    </div>
  );
}

