/**
 * @file app/api/users/[userId]/upload-image/route.ts
 * @description 프로필 이미지 업로드 API
 *
 * POST: 프로필 이미지 업로드
 * - 이미지 파일을 Supabase Storage에 업로드
 * - users 테이블의 profile_image_url 업데이트
 * - 본인 프로필만 업로드 가능
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(
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

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 이미지 파일 타입 검증
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // Service Role 클라이언트로 사용자 조회
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, profile_image_url")
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

    // 기존 프로필 이미지가 있으면 삭제
    if (userData.profile_image_url) {
      try {
        const oldImagePath = userData.profile_image_url.split("/").slice(-2).join("/");
        const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";
        await supabase.storage.from(storageBucket).remove([oldImagePath]);
      } catch (error) {
        console.error("Error deleting old profile image:", error);
        // 기존 이미지 삭제 실패해도 계속 진행
      }
    }

    // 파일명 생성
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `profile-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    // Storage RLS 정책에 맞춰 Clerk user ID를 첫 번째 폴더로 사용
    const filePath = `${clerkUserId}/${fileName}`;

    // Supabase Storage에 이미지 업로드
    const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";
    
    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다.", details: uploadError },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(filePath);

    // users 테이블 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ profile_image_url: publicUrl })
      .eq("id", userData.id)
      .select("id, clerk_id, name, profile_image_url, created_at")
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      // 업로드된 이미지 삭제 시도
      await supabase.storage.from(storageBucket).remove([filePath]);
      return NextResponse.json(
        { error: "프로필 이미지 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile_image_url: publicUrl,
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

