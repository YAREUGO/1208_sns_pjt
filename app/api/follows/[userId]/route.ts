/**
 * @file app/api/follows/[userId]/route.ts
 * @description 팔로우 상태 조회 API
 *
 * GET: 현재 사용자가 특정 사용자를 팔로우하고 있는지 확인
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ following: false });
    }

    const supabase = getServiceRoleClient();

    // 현재 사용자 정보 조회
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json({ following: false });
    }

    const followerId = currentUserData.id;

    // 팔로우할 사용자 정보 조회
    const { data: followingUserData, error: followingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (followingUserError || !followingUserData) {
      // UUID로 찾지 못하면 clerk_id로 시도
      const { data: followingUserByClerk, error: clerkError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (clerkError || !followingUserByClerk) {
        return NextResponse.json({ following: false });
      }

      // 팔로우 상태 확인
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingUserByClerk.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking follow status:", error);
        return NextResponse.json({ following: false });
      }

      return NextResponse.json({
        following: !!data,
      });
    }

    // 팔로우 상태 확인
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingUserData.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking follow status:", error);
      return NextResponse.json({ following: false });
    }

    return NextResponse.json({
      following: !!data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ following: false });
  }
}




