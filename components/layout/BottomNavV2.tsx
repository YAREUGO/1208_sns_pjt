/**
 * @file components/layout/BottomNavV2.tsx
 * @description 2025년형 Mobile 하단 네비게이션 (FAB 버튼 포함)
 *
 * 새로운 특징:
 * - 가운데 FAB (Floating Action Button) 버튼
 * - Pill progress bar (선택된 탭 표시)
 * - Glassmorphism 스타일
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/post/CreatePostModal";

interface BottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
  onClick?: () => void;
}

export function BottomNavV2() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems: BottomNavItem[] = [
    {
      icon: Home,
      href: "/",
      label: "홈",
    },
    {
      icon: Search,
      href: "/search",
      label: "검색",
    },
    {
      icon: Heart,
      href: "/activity",
      label: "좋아요",
    },
    {
      icon: User,
      href: user?.id ? `/profile/${user.id}` : "/profile",
      label: "프로필",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] z-50"
        style={{
          background: 'var(--color-bg-surface)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-soft-up)'
        }}
      >
        <div className="h-full flex items-center justify-around px-4 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full relative",
                  "transition-colors duration-150"
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    active
                      ? "scale-110"
                      : "scale-100"
                  )}
                  style={{
                    color: active ? 'var(--color-brand-500)' : 'var(--color-text-secondary)'
                  }}
                />
                {/* Pill progress bar */}
                {active && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full transition-all duration-300"
                    style={{
                      background: 'var(--color-brand-gradient)',
                      boxShadow: '0 0 8px rgba(138, 77, 255, 0.5)'
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB 버튼 (가운데) */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--color-brand-gradient)',
          boxShadow: '0 8px 24px rgba(138, 77, 255, 0.4)'
        }}
        aria-label="게시물 작성"
      >
        <Plus className="w-6 h-6 text-white mx-auto" />
      </button>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />
    </>
  );
}

