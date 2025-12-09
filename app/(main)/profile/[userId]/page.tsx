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
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
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
  // userId가 "user_"로 시작하면 clerk_id로 간주, 그렇지 않으면 UUID로 간주
  let userData: any = null;
  
  // userId가 "user_"로 시작하면 clerk_id로 조회 (Clerk user ID 형식)
  // 그렇지 않으면 UUID로 조회
  // 참고: profile_image_url 컬럼이 아직 추가되지 않은 경우를 위해 기본 필드만 조회
  const selectFields = "id, clerk_id, name, created_at";
  
  if (userId.startsWith("user_") || userId.startsWith("demo_")) {
    // Clerk user ID 또는 demo user ID 형식인 경우 clerk_id로 직접 조회
    const { data: userByClerk, error: clerkError } = await serviceClient
      .from("users")
      .select(selectFields)
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userByClerk) {
      // 사용자를 찾은 경우
      userData = { ...userByClerk, profile_image_url: null };
    } else if (clerkError && clerkError.message) {
      // 실제 에러가 있는 경우에만 에러 로깅
      console.warn("⚠️ clerk_id 조회 중 문제 발생:", userId, "-", clerkError.message);
    }
    // 사용자를 찾지 못한 경우 (에러 없이 null 반환)는 아래에서 처리됨
  } else {
    // UUID 형식인 경우 UUID로 조회 시도
    const { data: userByUuid, error: uuidError } = await serviceClient
      .from("users")
      .select(selectFields)
      .eq("id", userId)
      .maybeSingle();

    if (userByUuid) {
      userData = { ...userByUuid, profile_image_url: null };
    } else if (uuidError && uuidError.message) {
      // 실제 에러가 있는 경우에만 경고 로깅
      console.warn("⚠️ UUID 조회 중 문제 발생:", userId, "-", uuidError.message);
    }
    // UUID로 찾지 못했고, clerk_id 형식일 수도 있는 경우 시도
    if (!userData) {
      const { data: userByClerk } = await serviceClient
        .from("users")
        .select(selectFields)
        .eq("clerk_id", userId)
        .maybeSingle();

      if (userByClerk) {
        userData = { ...userByClerk, profile_image_url: null };
      }
    }
  }

  if (!userData) {
    // 디버깅: 현재 로그인한 사용자 정보 확인
    const currentUserInfo = clerkUserId
      ? `현재 로그인한 사용자: ${clerkUserId}`
      : "로그인하지 않음";

    return (
      <div className="text-center py-16 text-instagram-text-secondary">
        <p className="text-lg font-semibold mb-4">사용자를 찾을 수 없습니다.</p>
        <div className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
          <p>검색한 ID: {userId}</p>
          <p>{currentUserInfo}</p>
          <p className="mt-4 text-xs">
            💡 팁: 사용자가 데이터베이스에 동기화되지 않았을 수 있습니다.
            <br />
            홈 페이지로 이동한 후 다시 시도해보세요.
          </p>
        </div>
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
    profile_image_url: userData.profile_image_url || null,
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
    <ProfilePageClient
      initialUser={user}
      initialPosts={posts}
      initialIsFollowing={isFollowing}
    />
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

