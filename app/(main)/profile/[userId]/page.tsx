/**
 * @file app/(main)/profile/[userId]/page.tsx
 * @description 프로필 페이지
 *
 * 기능:
 * - 동적 라우트로 특정 사용자 프로필 표시
 * - ProfileHeader로 사용자 정보 및 통계 표시
 * - PostGrid로 사용자 게시물 그리드 표시
 * - 본인 프로필인지 확인하여 버튼 분기
 */

import { Suspense } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { UserWithStats, PostWithUser } from "@/lib/types";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

async function ProfileData({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { userId: clerkUserId } = await auth();
  const serviceClient = getServiceRoleClient();

  // 사용자 정보 조회 (UUID 또는 clerk_id로 조회)
  let userData: any = null;
  const { data: userByUuid } = await serviceClient
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("id", userId)
    .single();

  if (userByUuid) {
    userData = userByUuid;
  } else {
    const { data: userByClerk } = await serviceClient
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("clerk_id", userId)
      .single();

    if (userByClerk) {
      userData = userByClerk;
    }
  }

  if (!userData) {
    return (
      <div className="text-center py-16 text-instagram-text-secondary">
        <p>사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // user_stats 뷰에서 통계 조회
  const { data: statsData } = await serviceClient
    .from("user_stats")
    .select("posts_count, followers_count, following_count")
    .eq("user_id", userData.id)
    .single();

  const stats = statsData || {
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
  };

  const user: UserWithStats = {
    id: userData.id,
    clerk_id: userData.clerk_id,
    name: userData.name,
    created_at: userData.created_at,
    posts_count: stats.posts_count || 0,
    followers_count: stats.followers_count || 0,
    following_count: stats.following_count || 0,
  };

  // 본인 프로필인지 확인
  const isOwnProfile = user.clerk_id === clerkUserId;

  // 사용자 게시물 조회
  const { data: postsData } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      image_url,
      caption,
      created_at,
      updated_at,
      users!posts_user_id_fkey (
        id,
        clerk_id,
        name,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // 게시물 통계 조회
  const postIds = (postsData || []).map((post: any) => post.id);
  let posts: PostWithUser[] = [];

  if (postIds.length > 0) {
    const { data: statsData } = await supabase
      .from("post_stats")
      .select("post_id, likes_count, comments_count")
      .in("post_id", postIds);

    const statsMap = new Map(
      (statsData || []).map((stat: any) => [
        stat.post_id,
        {
          likes_count: stat.likes_count || 0,
          comments_count: stat.comments_count || 0,
        },
      ])
    );

    posts = (postsData || []).map((item: any) => {
      const postStats = statsMap.get(item.id) || {
        likes_count: 0,
        comments_count: 0,
      };

      return {
        id: item.id,
        user_id: item.user_id,
        image_url: item.image_url,
        caption: item.caption,
        created_at: item.created_at,
        updated_at: item.updated_at,
        likes_count: postStats.likes_count,
        comments_count: postStats.comments_count,
        user: {
          id: item.users.id,
          clerk_id: item.users.clerk_id,
          name: item.users.name,
          created_at: item.users.created_at,
        },
      };
    });
  }

  // 팔로우 상태 확인 (본인 프로필이 아닐 경우)
  let isFollowing = false;
  if (!isOwnProfile && clerkUserId) {
    const { data: currentUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUser) {
      const { data: followData } = await serviceClient
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", user.id)
        .single();

      isFollowing = !!followData;
    }
  }

  return (
    <div className="bg-instagram-background min-h-screen">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
      />
      <div className="border-t border-instagram-border mt-4">
        <PostGrid posts={posts} userId={user.id} />
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <p className="text-instagram-text-secondary">로딩 중...</p>
        </div>
      }
    >
      <ProfileData userId={userId} />
    </Suspense>
  );
}

