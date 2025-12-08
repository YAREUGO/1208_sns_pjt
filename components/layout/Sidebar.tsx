/**
 * @file components/layout/Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 레이아웃:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px ~ 1023px): 72px 너비, 아이콘만
 * - Mobile (< 768px): 숨김
 *
 * 메뉴 항목:
 * - 홈 (/)
 * - 검색 (향후 구현)
 * - 만들기 (게시물 작성 모달)
 * - 프로필 (/profile)
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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/post/CreatePostModal";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  onClick?: () => void;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 메뉴 항목 정의
  const menuItems: SidebarItem[] = [
    {
      icon: Home,
      label: "홈",
      href: "/",
    },
    {
      icon: Search,
      label: "검색",
      href: "/search", // 향후 구현
    },
    {
      icon: PlusSquare,
      label: "만들기",
      href: "#",
      onClick: () => {
        setIsCreateModalOpen(true);
      },
    },
    {
      icon: User,
      label: "프로필",
      href: user?.id ? `/profile/${user.id}` : "/profile",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-instagram-border",
        "hidden md:flex flex-col",
        "transition-all duration-200",
        // Desktop: 244px, Tablet: 72px
        "w-[244px] lg:w-[244px] md:w-[72px]"
      )}
    >
      <div className="flex flex-col p-4 gap-1">
        {/* 로고 영역 (Desktop만 표시) */}
        <div className="hidden lg:block mb-8 px-2">
          <h1 className="text-2xl font-instagram-bold text-instagram-text-primary">
            Instagram
          </h1>
        </div>

        {/* 메뉴 항목 */}
        {menuItems.map((item) => {
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
                "flex items-center gap-4 px-3 py-2 rounded-lg",
                "transition-colors duration-150",
                "hover:bg-gray-50",
                active && "font-instagram-semibold",
                // Tablet에서는 텍스트 숨김
                "md:justify-center lg:justify-start"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 flex-shrink-0",
                  active
                    ? "text-instagram-text-primary"
                    : "text-instagram-text-secondary"
                )}
              />
              <span
                className={cn(
                  "text-base",
                  active
                    ? "text-instagram-text-primary"
                    : "text-instagram-text-secondary",
                  // Tablet에서는 숨김
                  "hidden lg:inline"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // 게시물 작성 성공 시 피드 새로고침 (페이지 리로드)
          window.location.reload();
        }}
      />
    </aside>
  );
}

