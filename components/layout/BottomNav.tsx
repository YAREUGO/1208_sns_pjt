/**
 * @file components/layout/BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * 특징:
 * - Mobile (< 768px) 전용
 * - 높이: 50px
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  PlusSquare,
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

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems: BottomNavItem[] = [
    {
      icon: Home,
      href: "/",
      label: "홈",
    },
    {
      icon: Search,
      href: "/search", // 향후 구현
      label: "검색",
    },
    {
      icon: PlusSquare,
      href: "#",
      label: "만들기",
      onClick: () => {
        setIsCreateModalOpen(true);
      },
    },
    {
      icon: Heart,
      href: "/activity", // 향후 구현
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-instagram-border z-50">
      <div className="h-full flex items-center justify-around">
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
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "transition-colors duration-150",
                active
                  ? "text-instagram-text-primary"
                  : "text-instagram-text-secondary"
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  active && "fill-current"
                )}
              />
            </Link>
          );
        })}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // 게시물 작성 성공 시 홈으로 이동하여 새 게시물 확인
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />
    </nav>
  );
}

