/**
 * @file app/api/search/route.ts
 * @description 검색 API
 *
 * GET: 사용자 및 게시물 검색
 * - query 파라미터로 검색어 전달
 * - type 파라미터로 검색 타입 지정 (users, posts, all)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // users, posts, all
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query.trim()) {
      return NextResponse.json({
        users: [],
        posts: [],
      });
    }

    const serviceClient = getServiceRoleClient();
    const results: {
      users: Array<{
        id: string;
        clerk_id: string;
        name: string;
        created_at: string;
      }>;
      posts: Array<{
        id: string;
        user_id: string;
        image_url: string;
        caption: string | null;
        created_at: string;
        user: {
          id: string;
          clerk_id: string;
          name: string;
        };
      }>;
    } = {
      users: [],
      posts: [],
    };

    // 사용자 검색
    if (type === "all" || type === "users") {
      const { data: usersData, error: usersError } = await serviceClient
        .from("users")
        .select("id, clerk_id, name, created_at")
        .ilike("name", `%${query}%`)
        .limit(limit);

      if (!usersError && usersData) {
        results.users = usersData;
      }
    }

    // 게시물 검색 (캡션으로)
    if (type === "all" || type === "posts") {
      const { data: postsData, error: postsError } = await serviceClient
        .from("posts")
        .select(
          `
          id,
          user_id,
          image_url,
          caption,
          created_at,
          users!posts_user_id_fkey (
            id,
            clerk_id,
            name
          )
        `
        )
        .ilike("caption", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!postsError && postsData) {
        results.posts = postsData.map((post: any) => ({
          id: post.id,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          user: {
            id: post.users.id,
            clerk_id: post.users.clerk_id,
            name: post.users.name,
          },
        }));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

