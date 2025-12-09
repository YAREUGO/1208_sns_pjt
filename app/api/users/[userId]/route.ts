/**
 * @file app/api/users/[userId]/route.ts
 * @description 사용자 정보 조회 및 업데이트 API
 *
 * GET: 특정 사용자 정보 조회
 * - user_stats 뷰를 사용하여 통계 정보 포함
 * - 게시물 수, 팔로워 수, 팔로잉 수 포함
 *
 * PUT: 사용자 정보 업데이트
 * - 본인 프로필만 수정 가능
 * - 이름(name) 필드 수정
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { UserWithStats } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();

    // userId가 clerk_id인지 UUID인지 확인
    // 먼저 UUID로 조회 시도
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, profile_image_url, created_at")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      // UUID로 찾지 못하면 clerk_id로 조회 시도
      const { data: userDataByClerk, error: clerkError } = await supabase
        .from("users")
        .select("id, clerk_id, name, profile_image_url, created_at")
        .eq("clerk_id", userId)
        .single();

      if (clerkError || !userDataByClerk) {
        console.error("Error fetching user:", clerkError);
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // user_stats 뷰에서 통계 조회
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("posts_count, followers_count, following_count")
        .eq("user_id", userDataByClerk.id)
        .single();

      if (statsError) {
        console.error("Error fetching user stats:", statsError);
      }

      const stats = statsData || {
        posts_count: 0,
        followers_count: 0,
        following_count: 0,
      };

      const user: UserWithStats = {
        id: userDataByClerk.id,
        clerk_id: userDataByClerk.clerk_id,
        name: userDataByClerk.name,
        profile_image_url: userDataByClerk.profile_image_url || null,
        created_at: userDataByClerk.created_at,
        posts_count: stats.posts_count || 0,
        followers_count: stats.followers_count || 0,
        following_count: stats.following_count || 0,
      };

      return NextResponse.json({ user });
    }

    // user_stats 뷰에서 통계 조회
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("posts_count, followers_count, following_count")
      .eq("user_id", userData.id)
      .single();

    if (statsError) {
      console.error("Error fetching user stats:", statsError);
    }

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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PUT: 사용자 정보 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "이름은 필수입니다." },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "이름은 50자 이하여야 합니다." },
        { status: 400 }
      );
    }

    // Service Role 클라이언트로 사용자 조회
    const serviceClient = getServiceRoleClient();
    const { data: userData, error: userError } = await serviceClient
      .from("users")
      .select("id, clerk_id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // userId가 본인의 clerk_id인지 확인
    if (userId !== clerkUserId && userId !== userData.id) {
      return NextResponse.json(
        { error: "본인의 프로필만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 이름 업데이트
    const { data: updatedUser, error: updateError } = await serviceClient
      .from("users")
      .update({ name: name.trim() })
      .eq("id", userData.id)
      .select("id, clerk_id, name, created_at")
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { error: "프로필 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




