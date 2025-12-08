/**
 * @file app/api/comments/route.ts
 * @description 댓글 API 라우트
 *
 * POST: 댓글 작성
 * DELETE: 댓글 삭제 (본인만)
 * - Clerk 인증 검증
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * POST: 댓글 작성
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId와 content가 필요합니다." },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // Supabase에서 사용자 ID 찾기
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User not found in Supabase:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // 댓글 작성
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select(`
        *,
        users!comments_user_id_fkey (
          id,
          clerk_id,
          name,
          created_at
        )
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user: {
          id: data.users.id,
          clerk_id: data.users.clerk_id,
          name: data.users.name,
          created_at: data.users.created_at,
        },
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 댓글 삭제 (본인만)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase에서 사용자 ID 찾기
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User not found in Supabase:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // 댓글 소유자 확인
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !commentData) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 댓글인지 확인
    if (commentData.user_id !== userId) {
      return NextResponse.json(
        { error: "본인의 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

