/**
 * @file app/api/posts/[postId]/route.ts
 * @description 특정 게시물 조회 및 삭제 API
 *
 * GET: 특정 postId로 게시물 조회 (사용자 정보 및 통계 포함)
 * DELETE: 게시물 삭제 (본인만 가능, Supabase Storage에서 이미지도 삭제)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
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
    // .single()을 사용했으므로 users는 단일 객체입니다
    const userData = Array.isArray(postData.users) 
      ? postData.users[0] 
      : postData.users;
    
    if (!userData) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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
        id: userData.id,
        clerk_id: userData.clerk_id,
        name: userData.name,
        created_at: userData.created_at,
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

/**
 * DELETE: 게시물 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    // 게시물 정보 조회
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, image_url, users!posts_user_id_fkey(clerk_id)")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("Post not found:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // users 데이터 처리 (배열일 수도 있고 객체일 수도 있음)
    const userData = Array.isArray(postData.users) 
      ? postData.users[0] 
      : postData.users;

    if (!userData || !userData.clerk_id) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 게시물인지 확인
    if (userData.clerk_id !== clerkUserId) {
      return NextResponse.json(
        { error: "본인의 게시물만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // Supabase Storage에서 이미지 삭제
    // image_url에서 파일 경로 추출
    // 예: https://xxx.supabase.co/storage/v1/object/public/posts/userId/filename.jpg
    // -> posts/userId/filename.jpg
    const imageUrl = postData.image_url;
    if (imageUrl) {
      try {
        // URL에서 파일 경로 추출
        const urlParts = imageUrl.split("/");
        const bucketIndex = urlParts.findIndex((part) => part === "object");
        if (bucketIndex !== -1 && urlParts[bucketIndex + 1] === "public") {
          const bucketName = urlParts[bucketIndex + 2];
          const filePath = urlParts.slice(bucketIndex + 3).join("/");

          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
            // Storage 삭제 실패해도 DB 삭제는 진행 (이미지가 없어도 게시물은 삭제)
          }
        }
      } catch (storageErr) {
        console.error("Error parsing image URL:", storageErr);
        // URL 파싱 실패해도 DB 삭제는 진행
      }
    }

    // 게시물 삭제 (CASCADE로 인해 관련 likes, comments도 자동 삭제됨)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      return NextResponse.json(
        { error: "게시물 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/posts/[postId]:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

