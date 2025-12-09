/**
 * @file components/profile/ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * 기능:
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명
 * - 통계 (게시물 수, 팔로워 수, 팔로잉 수)
 * - "팔로우" / "팔로잉" 버튼 (다른 사람 프로필)
 * - "프로필 편집" 버튼 (본인 프로필, 1차 제외)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserWithStats } from "@/lib/types";
// useUser는 향후 사용 예정
import { Button } from "@/components/ui/button";
import { FollowButton } from "./FollowButton";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileHeaderProps {
  user: UserWithStats;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function ProfileHeader({
  user,
  isOwnProfile = false,
  isFollowing = false,
  onFollowChange,
}: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  // 통계 포맷팅
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 px-4 py-6 md:py-8">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <div className="relative w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center overflow-hidden border-2 border-border">
          {user.profile_image_url ? (
            <Image
              src={user.profile_image_url}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-3xl md:text-5xl text-white font-instagram-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="flex-1 flex flex-col gap-4">
        {/* 사용자명 및 버튼 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-instagram-semibold text-instagram-text-primary">
            {user.name}
          </h1>

          {/* 버튼 영역 */}
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full md:w-auto border-2 border-foreground/20 bg-background text-foreground hover:bg-foreground/10 hover:border-foreground/30 font-semibold"
              >
                프로필 편집
              </Button>
              <EditProfileModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                currentName={user.name}
                currentProfileImage={user.profile_image_url}
                onSuccess={() => {
                  // Next.js router를 사용하여 서버 컴포넌트 데이터 새로고침
                  router.refresh();
                }}
              />
            </>
          ) : (
            <FollowButton
              userId={user.clerk_id}
              initialFollowing={isFollowing}
              onFollowChange={(following) => {
                onFollowChange?.(following);
                // 통계 업데이트 (낙관적 업데이트)
                if (following) {
                  user.followers_count += 1;
                } else {
                  user.followers_count = Math.max(0, user.followers_count - 1);
                }
              }}
            />
          )}
        </div>

        {/* 통계 */}
        <div className="flex gap-6 md:gap-8">
          <div className="flex items-center gap-1">
            <span className="font-instagram-semibold text-instagram-text-primary">
              {formatNumber(user.posts_count)}
            </span>
            <span className="text-instagram-text-secondary">게시물</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-instagram-semibold text-instagram-text-primary">
              {formatNumber(user.followers_count)}
            </span>
            <span className="text-instagram-text-secondary">팔로워</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-instagram-semibold text-instagram-text-primary">
              {formatNumber(user.following_count)}
            </span>
            <span className="text-instagram-text-secondary">팔로잉</span>
          </div>
        </div>
      </div>
    </div>
  );
}

