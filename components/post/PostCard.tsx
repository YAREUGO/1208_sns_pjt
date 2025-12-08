/**
 * @file components/post/PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드:
 * - 헤더 (프로필 이미지 32px, 사용자명, 시간, ⋯ 메뉴)
 * - 이미지 영역 (1:1 정사각형)
 * - 액션 버튼 (좋아요, 댓글, 공유, 북마크)
 * - 좋아요 수 표시
 * - 캡션 (사용자명 Bold + 내용, 2줄 초과 시 "... 더 보기")
 * - 댓글 미리보기 (최신 2개)
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { PostWithUser } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostCardProps {
  post: PostWithUser;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onClick?: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment, onClick }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // TODO: 실제 좋아요 상태로 교체

  // 캡션 2줄 초과 여부 확인
  const captionLines = post.caption?.split("\n") || [];
  const shouldTruncate = captionLines.length > 2 || (post.caption?.length || 0) > 100;

  // 시간 포맷팅
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  // 좋아요 수 포맷팅
  const formatLikes = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <article className="bg-instagram-card-background border border-instagram-border rounded-lg overflow-hidden mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (32px 원형) */}
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {/* TODO: 실제 프로필 이미지로 교체 */}
            <span className="text-instagram-text-secondary text-xs">
              {post.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-instagram-semibold text-instagram-text-primary text-sm">
              {post.user.name}
            </span>
            <div className="text-instagram-text-secondary text-xs">{timeAgo}</div>
          </div>
        </div>
        <button
          className="text-instagram-text-primary hover:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div
        className="relative w-full aspect-square bg-gray-100 cursor-pointer"
        onClick={() => onClick?.(post.id)}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          unoptimized // Supabase Storage URL은 최적화 불필요
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              onLike?.(post.id);
            }}
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-instagram-like text-instagram-like" : ""}`}
            />
          </button>
          <button
            onClick={() => onComment?.(post.id)}
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            className="text-instagram-text-primary hover:opacity-70 transition-opacity"
            aria-label="공유"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <button
          className="text-instagram-text-primary hover:opacity-70 transition-opacity"
          aria-label="북마크"
        >
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* 좋아요 수 */}
      {post.likes_count > 0 && (
        <div className="px-4 pb-2">
          <span className="font-instagram-semibold text-instagram-text-primary text-sm">
            좋아요 {formatLikes(post.likes_count)}개
          </span>
        </div>
      )}

      {/* 캡션 */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p className="text-instagram-text-primary text-sm">
            <span className="font-instagram-semibold">{post.user.name}</span>{" "}
            {showFullCaption || !shouldTruncate ? (
              post.caption
            ) : (
              <>
                {post.caption.slice(0, 100)}
                {post.caption.length > 100 && "..."}
              </>
            )}
          </p>
          {shouldTruncate && !showFullCaption && (
            <button
              onClick={() => setShowFullCaption(true)}
              className="text-instagram-text-secondary text-sm mt-1 hover:opacity-70"
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* 댓글 미리보기 (최신 2개) */}
      {post.comments_count > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onComment?.(post.id)}
            className="text-instagram-text-secondary text-sm hover:opacity-70"
          >
            댓글 {post.comments_count}개 모두 보기
          </button>
          {/* TODO: 실제 댓글 2개 표시 */}
        </div>
      )}
    </article>
  );
}

