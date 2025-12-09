/**
 * @file components/layout/SidebarV2.tsx
 * @description 2025년형 Desktop 사이드바
 *
 * 새로운 특징:
 * - 상단: 로고 + 테마 토글
 * - 중단: 핵심 탭 (Pill 버튼 스타일)
 * - 하단: Create 버튼 (강조)
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
  PlusSquare,
  User,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  onClick?: () => void;
}

export function SidebarV2() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems: SidebarItem[] = [
    {
      icon: Home,
      label: "Feed",
      href: "/",
    },
    {
      icon: Search,
      label: "Explore",
      href: "/search",
    },
    {
      icon: PlusSquare,
      label: "Reels",
      href: "/reels",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/messages",
    },
    {
      icon: User,
      label: "Profile",
      href: user?.id ? `/profile/${user.id}` : "/sign-in",
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
        "fixed left-0 top-0 h-screen hidden md:flex flex-col",
        "transition-all duration-200",
        "w-[280px]",
        "glass-card",
        "border-r",
        "z-40"
      )}
      style={{
        borderColor: 'var(--color-border-subtle)',
        borderRadius: 0
      }}
    >
      {/* 상단: 로고 + 테마 토글 */}
      <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1
          className="text-2xl font-bold"
          style={{
            background: 'var(--color-brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          SNS
        </h1>
        <ThemeToggle />
      </div>

      {/* 중단: 핵심 탭 (Pill 버튼) */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:scale-[1.02]"
              )}
              style={{
                background: active ? 'var(--color-brand-soft)' : 'transparent',
                color: active ? 'var(--color-brand-500)' : 'var(--color-text-secondary)'
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--color-brand-500)',
                    boxShadow: '0 0 8px rgba(138, 77, 255, 0.6)'
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 하단: Create 버튼 (강조) */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full btn-cta"
        >
          Create
        </button>
      </div>

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
    </aside>
  );
}

