/**
 * @file components/profile/PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * 기능:
 * - 3열 그리드 레이아웃 (반응형)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { PostWithUser } from "@/lib/types";
import { PostModal } from "@/components/post/PostModal";
import { Heart, MessageCircle } from "lucide-react";
// cn은 향후 사용 예정

interface PostGridProps {
  posts: PostWithUser[];
  userId?: string;
}

export function PostGrid({ posts }: PostGridProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-instagram-text-secondary">
        <p className="text-lg mb-2">게시물이 없습니다</p>
        <p className="text-sm">첫 게시물을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 cursor-pointer group"
            onClick={() => setSelectedPostId(post.id)}
          >
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
              unoptimized
            />

            {/* Hover 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-instagram-semibold">
                  {post.likes_count}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-instagram-semibold">
                  {post.comments_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          open={!!selectedPostId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPostId(null);
            }
          }}
        />
      )}
    </>
  );
}

