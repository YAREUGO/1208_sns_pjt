/**
 * @file components/profile/ProfilePageClient.tsx
 * @description 프로필 페이지 클라이언트 컴포넌트
 *
 * 팔로우 상태를 클라이언트에서 관리하여 실시간 업데이트
 */

"use client";

import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileHeaderV2 } from "./ProfileHeaderV2";
import { PostGrid } from "./PostGrid";
import { PostGridV2 } from "./PostGridV2";
import { UserWithStats, PostWithUser } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

interface ProfilePageClientProps {
  initialUser: UserWithStats;
  initialPosts: PostWithUser[];
  initialIsFollowing: boolean;
  useV2?: boolean; // V2 컴포넌트 사용 여부 (기본값: true)
}

export function ProfilePageClient({
  initialUser,
  initialPosts,
  initialIsFollowing,
  useV2 = true,
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
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)' }}>
      {useV2 ? (
        <ProfileHeaderV2
          user={user}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowChange={handleFollowChange}
        />
      ) : (
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowChange={handleFollowChange}
        />
      )}
      <div className="mt-4 px-4 md:px-6" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        {useV2 ? (
          <PostGridV2 posts={initialPosts} userId={user.id} />
        ) : (
          <PostGrid posts={initialPosts} userId={user.id} />
        )}
      </div>
    </div>
  );
}

