/**
 * @file app/api/comments/[postId]/route.ts
 * @description 특정 게시물의 댓글 목록 조회 API
 *
 * GET: 게시물의 댓글 목록 조회 (시간 역순)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const supabase = getServiceRoleClient();

    // 댓글 목록 조회 (사용자 정보 포함)
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at,
        users!comments_user_id_fkey (
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "댓글을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 데이터 변환
    const comments = (data || []).map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: {
        id: item.users.id,
        clerk_id: item.users.clerk_id,
        name: item.users.name,
        created_at: item.users.created_at,
      },
    }));

    return NextResponse.json({
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

