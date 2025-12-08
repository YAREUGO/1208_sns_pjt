/**
 * @file components/profile/ProfilePageClient.tsx
 * @description 프로필 페이지 클라이언트 컴포넌트
 *
 * 팔로우 상태를 클라이언트에서 관리하여 실시간 업데이트
 */

"use client";

import { useState, useEffect } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { PostGrid } from "./PostGrid";
import { UserWithStats, PostWithUser } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

interface ProfilePageClientProps {
  initialUser: UserWithStats;
  initialPosts: PostWithUser[];
  initialIsFollowing: boolean;
}

export function ProfilePageClient({
  initialUser,
  initialPosts,
  initialIsFollowing,
}: ProfilePageClientProps) {
  const [user, setUser] = useState<UserWithStats>(initialUser);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { user: clerkUser } = useUser();

  const isOwnProfile = user.clerk_id === clerkUser?.id;

  const handleFollowChange = (following: boolean) => {
    setIsFollowing(following);
    // 통계 업데이트 (낙관적 업데이트)
    setUser((prev) => ({
      ...prev,
      followers_count: following
        ? prev.followers_count + 1
        : Math.max(0, prev.followers_count - 1),
    }));
  };

  return (
    <div className="bg-modern-gradient min-h-screen">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowChange={handleFollowChange}
      />
      <div className="border-t border-instagram-border mt-4">
        <PostGrid posts={initialPosts} userId={user.id} />
      </div>
    </div>
  );
}

