/**
 * @file app/api/likes/[postId]/route.ts
 * @description 특정 게시물의 좋아요 상태 조회 API
 *
 * GET: 현재 사용자가 해당 게시물에 좋아요를 눌렀는지 확인
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      // 로그인하지 않은 경우 false 반환
      return NextResponse.json({ liked: false });
    }

    // Supabase에서 사용자 ID 찾기
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ liked: false });
    }

    const userId = userData.id;

    // 좋아요 상태 확인
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (좋아요 없음)
      console.error("Error checking like status:", error);
      return NextResponse.json({ liked: false });
    }

    return NextResponse.json({
      liked: !!data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ liked: false });
  }
}




