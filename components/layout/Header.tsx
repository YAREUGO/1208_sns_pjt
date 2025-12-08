/**
 * @file components/layout/Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * 특징:
 * - Mobile (< 768px) 전용
 * - 높이: 60px
 * - 로고 + 알림/DM/프로필 아이콘
 */

"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, Send, User } from "lucide-react";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-md border-b border-instagram-border z-50 shadow-sm">
      <div className="h-full flex items-center justify-between px-4">
        {/* 로고 */}
        <h1 className="text-xl font-instagram-bold text-instagram-text-primary">
          Instagram
        </h1>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {/* 알림 (좋아요) - 향후 구현 */}
          <button
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label="알림"
          >
            <Heart className="w-6 h-6" />
          </button>

          {/* DM (메시지) - 향후 구현 */}
          <button
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label="메시지"
          >
            <Send className="w-6 h-6" />
          </button>

          {/* 프로필 */}
          <Link
            href={user?.id ? `/profile/${user.id}` : "/profile"}
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label="프로필"
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}

