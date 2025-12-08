/**
 * @file app/api/likes/route.ts
 * @description 좋아요 API 라우트
 *
 * POST: 좋아요 추가
 * DELETE: 좋아요 제거
 * - Clerk 인증 검증
 * - 중복 좋아요 방지 (UNIQUE 제약조건)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * POST: 좋아요 추가
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

    // 요청 본문 파싱
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase에서 사용자 ID 찾기 (clerk_id로 조회)
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

    // 좋아요 추가 (중복 방지는 UNIQUE 제약조건으로 처리)
    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      // 중복 좋아요인 경우 (UNIQUE 제약조건 위반)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 좋아요를 누른 게시물입니다." },
          { status: 409 }
        );
      }

      console.error("Error adding like:", error);
      return NextResponse.json(
        { error: "좋아요 추가 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      like: data,
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
 * DELETE: 좋아요 제거
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

    // 요청 본문 파싱
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
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

    // 좋아요 제거
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing like:", error);
      return NextResponse.json(
        { error: "좋아요 제거 중 오류가 발생했습니다." },
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

