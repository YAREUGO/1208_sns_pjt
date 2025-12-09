/**
 * @file components/profile/ProfileHeaderV2.tsx
 * @description 2025년형 프로필 헤더 (Hero 영역)
 *
 * 새로운 특징:
 * - Hero 커버 (블러 배경)
 * - 프로필 이미지 Overlay (Spotify 스타일)
 * - Pill 버튼 그룹 (팔로우/메시지/더보기)
 * - 통계 hover 시 미니 지표 툴팁 슬롯
 */

"use client";

import { UserWithStats } from "@/lib/types";
import { FollowButton } from "./FollowButton";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileHeaderV2Props {
  user: UserWithStats;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function ProfileHeaderV2({
  user,
  isOwnProfile = false,
  isFollowing = false,
  onFollowChange,
}: ProfileHeaderV2Props) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="relative">
      {/* Hero 커버 (블러 배경) */}
      <div
        className="absolute inset-0 h-64 rounded-b-3xl overflow-hidden"
        style={{
          background: 'var(--color-brand-gradient)',
          opacity: 0.2,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)'
        }}
      />

      {/* 프로필 이미지 Overlay */}
      <div className="relative px-6 py-8 flex items-end gap-6">
        {/* 프로필 이미지 (그라데이션 테두리) */}
        <div className="relative -mb-12 z-10">
          <div
            className="w-32 h-32 rounded-full p-1"
            style={{
              background: 'var(--color-brand-gradient)'
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--color-bg-surface)'
              }}
            >
              <span
                className="text-5xl font-bold"
                style={{
                  color: 'var(--color-text-primary)'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 통계 + 버튼 */}
        <div className="flex-1 flex items-end justify-between pb-4">
          <div className="flex gap-8">
            {/* 게시물 */}
            <div className="text-center group relative">
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formatNumber(user.posts_count)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                게시물
              </div>
              {/* Hover 툴팁 슬롯 (향후 구현) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                +7 this week
              </div>
            </div>

            {/* 팔로워 */}
            <div className="text-center group relative">
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formatNumber(user.followers_count)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                팔로워
              </div>
            </div>

            {/* 팔로잉 */}
            <div className="text-center group relative">
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formatNumber(user.following_count)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                팔로잉
              </div>
            </div>
          </div>

          {/* Pill 버튼 그룹 */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)'
                }}
              >
                프로필 편집
              </Button>
            ) : (
              <>
                <FollowButton
                  userId={user.clerk_id}
                  initialFollowing={isFollowing}
                  onFollowChange={(following) => {
                    onFollowChange?.(following);
                    if (following) {
                      user.followers_count += 1;
                    } else {
                      user.followers_count = Math.max(0, user.followers_count - 1);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="px-4 py-2 rounded-full"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  메시지
                </Button>
                <Button
                  variant="outline"
                  className="px-4 py-2 rounded-full"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 사용자명 및 Bio (Hero 아래) */}
      <div className="relative px-6 pt-16 pb-6">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {user.name}
        </h1>
        {/* Bio 영역 (향후 추가) */}
      </div>
    </div>
  );
}

