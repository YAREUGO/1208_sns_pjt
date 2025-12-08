/**
 * @file app/api/posts/route.ts
 * @description 게시물 API 라우트
 *
 * GET: 게시물 목록 조회
 * - 시간 역순 정렬
 * - 페이지네이션 지원 (limit, offset)
 * - userId 파라미터 지원 (프로필 페이지용)
 * - post_stats 뷰를 사용하여 좋아요/댓글 수 포함
 * - 사용자 정보 조인
 *
 * POST: 게시물 생성 (향후 구현)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostWithUser } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // 쿼리 파라미터 파싱
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId"); // 특정 사용자의 게시물만 조회

    // posts 테이블에서 조회하고 users 조인
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId가 있으면 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postsData, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "게시물을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!postsData || postsData.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
        hasMore: false,
      });
    }

    // 각 게시물의 통계 조회 (post_stats 뷰 사용)
    const postIds = postsData.map((post: any) => post.id);
    const { data: statsData, error: statsError } = await supabase
      .from("post_stats")
      .select("post_id, likes_count, comments_count")
      .in("post_id", postIds);

    if (statsError) {
      console.error("Error fetching post stats:", statsError);
    }

    // 통계 데이터를 맵으로 변환
    const statsMap = new Map(
      (statsData || []).map((stat: any) => [
        stat.post_id,
        {
          likes_count: stat.likes_count || 0,
          comments_count: stat.comments_count || 0,
        },
      ])
    );

    // 데이터 변환: PostWithUser 타입으로 변환
    const posts: PostWithUser[] = postsData.map((item: any) => {
      const stats = statsMap.get(item.id) || {
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
        likes_count: stats.likes_count,
        comments_count: stats.comments_count,
        user: {
          id: item.users.id,
          clerk_id: item.users.clerk_id,
          name: item.users.name,
          created_at: item.users.created_at,
        },
      };
    });

    return NextResponse.json({
      data: posts,
      count: posts.length,
      hasMore: posts.length === limit, // 더 있는지 여부 (간단한 체크)
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

