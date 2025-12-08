/**
 * @file app/api/posts/[postId]/route.ts
 * @description 특정 게시물 조회 API
 *
 * GET: 특정 postId로 게시물 조회 (사용자 정보 및 통계 포함)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostWithUser } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = await createClient();

    // posts 테이블에서 특정 게시물 조회
    const { data: postData, error } = await supabase
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
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!postData) {
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 통계 조회 (post_stats 뷰 사용)
    const { data: statsData, error: statsError } = await supabase
      .from("post_stats")
      .select("post_id, likes_count, comments_count")
      .eq("post_id", postId)
      .single();

    if (statsError) {
      console.error("Error fetching post stats:", statsError);
    }

    const stats = statsData || {
      likes_count: 0,
      comments_count: 0,
    };

    // 데이터 변환: PostWithUser 타입으로 변환
    const post: PostWithUser = {
      id: postData.id,
      user_id: postData.user_id,
      image_url: postData.image_url,
      caption: postData.caption,
      created_at: postData.created_at,
      updated_at: postData.updated_at,
      likes_count: stats.likes_count || 0,
      comments_count: stats.comments_count || 0,
      user: {
        id: postData.users.id,
        clerk_id: postData.users.clerk_id,
        name: postData.users.name,
        created_at: postData.users.created_at,
      },
    };

    return NextResponse.json({
      data: post,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

