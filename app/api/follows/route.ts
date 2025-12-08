/**
 * @file app/api/follows/route.ts
 * @description 팔로우 API 라우트
 *
 * POST: 팔로우 추가
 * DELETE: 팔로우 제거
 * - 인증 검증 (Clerk)
 * - 자기 자신 팔로우 방지
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "팔로우할 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 현재 사용자 정보 조회
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserError || !currentUserData) {
      console.error("User not found in Supabase:", currentUserError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const followerId = currentUserData.id;

    // 팔로우할 사용자 정보 조회
    const { data: followingUserData, error: followingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", followingId)
      .single();

    if (followingUserError || !followingUserData) {
      // UUID로 찾지 못하면 clerk_id로 시도
      const { data: followingUserByClerk, error: clerkError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", followingId)
        .single();

      if (clerkError || !followingUserByClerk) {
        console.error("Following user not found:", clerkError);
        return NextResponse.json(
          { error: "팔로우할 사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 자기 자신 팔로우 방지
      if (followerId === followingUserByClerk.id) {
        return NextResponse.json(
          { error: "자기 자신을 팔로우할 수 없습니다." },
          { status: 400 }
        );
      }

      // 팔로우 추가
      const { data, error } = await supabase
        .from("follows")
        .insert({
          follower_id: followerId,
          following_id: followingUserByClerk.id,
        })
        .select()
        .single();

      if (error) {
        // 중복 팔로우 에러 처리
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "이미 팔로우 중입니다." },
            { status: 409 }
          );
        }
        console.error("Error adding follow:", error);
        return NextResponse.json(
          { error: "팔로우 추가에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, follow: data });
    }

    // 자기 자신 팔로우 방지
    if (followerId === followingUserData.id) {
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 }
      );
    }

    // 팔로우 추가
    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingUserData.id,
      })
      .select()
      .single();

    if (error) {
      // 중복 팔로우 에러 처리
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 팔로우 중입니다." },
          { status: 409 }
        );
      }
      console.error("Error adding follow:", error);
      return NextResponse.json(
        { error: "팔로우 추가에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, follow: data });
  } catch (error) {
    console.error("Unexpected error in POST /api/follows:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "언팔로우할 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 현재 사용자 정보 조회
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserError || !currentUserData) {
      console.error("User not found in Supabase:", currentUserError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const followerId = currentUserData.id;

    // 팔로우할 사용자 정보 조회
    const { data: followingUserData, error: followingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", followingId)
      .single();

    if (followingUserError || !followingUserData) {
      // UUID로 찾지 못하면 clerk_id로 시도
      const { data: followingUserByClerk, error: clerkError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", followingId)
        .single();

      if (clerkError || !followingUserByClerk) {
        console.error("Following user not found:", clerkError);
        return NextResponse.json(
          { error: "언팔로우할 사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 팔로우 제거
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingUserByClerk.id);

      if (error) {
        console.error("Error removing follow:", error);
        return NextResponse.json(
          { error: "팔로우 제거에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 팔로우 제거
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingUserData.id);

    if (error) {
      console.error("Error removing follow:", error);
      return NextResponse.json(
        { error: "팔로우 제거에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/follows:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

