/**
 * @file components/profile/PostGridV2.tsx
 * @description 2025년형 프로필 게시물 그리드 (Bento 스타일)
 *
 * 새로운 특징:
 * - 첫 줄: 4:5 비율 큰 카드 + 옆에 두 개 작은 카드
 * - 이후 줄: 3열 기본
 * - Reels 배지 표시
 * - Hover 시 좋아요/댓글 수 표시
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { PostWithUser } from "@/lib/types";
import { PostModal } from "@/components/post/PostModal";
import { Heart, MessageCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostGridV2Props {
  posts: PostWithUser[];
  userId?: string;
}

export function PostGridV2({ posts }: PostGridV2Props) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
        <p className="text-lg mb-2">게시물이 없습니다</p>
        <p className="text-sm">첫 게시물을 작성해보세요!</p>
      </div>
    );
  }

  // 첫 번째 게시물 (큰 카드)
  const firstPost = posts[0];
  // 두 번째, 세 번째 게시물 (작은 카드)
  const secondPost = posts[1];
  const thirdPost = posts[2];
  // 나머지 게시물들 (3열 그리드)
  const remainingPosts = posts.slice(3);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {/* 첫 줄: 큰 카드 + 작은 카드 2개 */}
        {firstPost && (
          <div
            className="col-span-2 row-span-2 relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPostId(firstPost.id)}
          >
            <Image
              src={firstPost.image_url}
              alt={firstPost.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 66vw, 400px"
              unoptimized
            />
            {/* Hover 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">{firstPost.likes_count}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-semibold">{firstPost.comments_count}</span>
              </div>
            </div>
          </div>
        )}

        {secondPost && (
          <div
            className="col-span-1 relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPostId(secondPost.id)}
          >
            <Image
              src={secondPost.image_url}
              alt={secondPost.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-white text-sm">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-semibold">{secondPost.likes_count}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white text-sm">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="font-semibold">{secondPost.comments_count}</span>
              </div>
            </div>
          </div>
        )}

        {thirdPost && (
          <div
            className="col-span-1 relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPostId(thirdPost.id)}
          >
            <Image
              src={thirdPost.image_url}
              alt={thirdPost.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-white text-sm">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-semibold">{thirdPost.likes_count}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white text-sm">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="font-semibold">{thirdPost.comments_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* 이후 줄: 3열 기본 */}
        {remainingPosts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
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

            {/* Reels 배지 (예시 - 실제로는 post 타입에 따라 표시) */}
            {Math.random() > 0.8 && (
              <div className="absolute top-2 left-2 z-10">
                <div
                  className="px-2 py-1 rounded flex items-center gap-1 text-xs font-semibold"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: 'white'
                  }}
                >
                  <Play className="w-3 h-3 fill-white" />
                  Reels
                </div>
              </div>
            )}

            {/* Hover 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-white text-sm">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-semibold">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white text-sm">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="font-semibold">{post.comments_count}</span>
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

