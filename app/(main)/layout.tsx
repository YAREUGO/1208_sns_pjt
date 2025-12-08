/**
 * @file app/(main)/layout.tsx
 * @description 메인 레이아웃 컴포넌트
 *
 * Instagram 스타일 레이아웃:
 * - Desktop: Sidebar (244px) + Main Content (최대 630px 중앙 정렬)
 * - Tablet: Sidebar (72px 아이콘만) + Main Content
 * - Mobile: Header (60px) + Main Content + BottomNav (50px)
 *
 * 배경색: #FAFAFA
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-modern-gradient">
      {/* Sidebar (Desktop/Tablet) */}
      <Sidebar />

      {/* Header (Mobile only) */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200",
          // Desktop: Sidebar 너비만큼 왼쪽 여백
          "md:ml-[72px] lg:ml-[244px]",
          // Mobile: Header 높이만큼 상단 여백
          "pt-[60px] md:pt-0",
          // Mobile: BottomNav 높이만큼 하단 여백
          "pb-[50px] md:pb-0"
        )}
      >
        <div className="max-w-[630px] mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* BottomNav (Mobile only) */}
      <BottomNav />
    </div>
  );
}

