/**
 * @file components/post/PostCardV2.tsx
 * @description 2025년형 SNS 게시물 카드 컴포넌트
 *
 * 새로운 디자인 특징:
 * - 4:5 비율 이미지
 * - 콘텐츠 타입 태그 (Post, Reel, Carousel 등)
 * - 팔로우 칩 버튼
 * - 아이콘 + 마이크로 카운터 (숫자 슬라이드 업 애니메이션)
 * - Repost/Remix 버튼
 * - In-place 댓글 확장
 * - Glassmorphism 카드 스타일
 */

"use client";

import { useState, useEffect, memo, useMemo, useRef } from "react";
import Image from "next/image";
import { MoreHorizontal, MessageCircle, Bookmark, Heart, Trash2, Repeat, Sparkles } from "lucide-react";
import { PostWithUser } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";

interface PostCardV2Props {
  post: PostWithUser;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onClick?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  index?: number; // Parallax 애니메이션용
  isAIRecommended?: boolean; // AI 추천 배지 표시 여부
}

export const PostCardV2 = memo(function PostCardV2({
  post,
  onLike,
  onComment,
  onClick,
  onDelete,
  index = 0,
  isAIRecommended = false,
}: PostCardV2Props) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentKey, setCommentKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLArticleElement>(null);
  const { user } = useUser();

  const isOwnPost = user?.id === post.user.clerk_id;

  // Intersection Observer for parallax
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes/${post.id}`);
        const data = await response.json();
        setIsLiked(data.liked || false);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    checkLikeStatus();
  }, [post.id]);

  // 팔로우 상태 확인 (본인 게시물이 아닐 때만)
  useEffect(() => {
    if (isOwnPost || !user?.id) return;

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follows/${post.user.clerk_id}`);
        const data = await response.json();
        setIsFollowing(data.following || false);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    checkFollowStatus();
  }, [post.user.clerk_id, user?.id, isOwnPost]);

  const shouldTruncate = useMemo(() => {
    const captionLines = post.caption?.split("\n") || [];
    return captionLines.length > 2 || (post.caption?.length || 0) > 100;
  }, [post.caption]);

  const timeAgo = useMemo(
    () =>
      formatDistanceToNow(new Date(post.created_at), {
        addSuffix: true,
        locale: ko,
      }),
    [post.created_at]
  );

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newLiked);
    setLikesCount(newCount);

    try {
      const response = await fetch("/api/likes", {
        method: newLiked ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        return;
      }

      onLike?.(post.id);
    } catch (error) {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "게시물 삭제에 실패했습니다.");
      }

      onDelete?.(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error instanceof Error ? error.message : "게시물 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFollow = async () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);

    try {
      const response = await fetch("/api/follows", {
        method: newFollowing ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: post.user.clerk_id }),
      });

      if (!response.ok) {
        setIsFollowing(!newFollowing);
      }
    } catch (error) {
      setIsFollowing(!newFollowing);
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        "glass-card feed-card mb-6",
        "animate-slide-up"
      )}
      style={{
        animationDelay: `${index * 0.1}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* 상단: 프로필 + 팔로우 칩 */}
      <header className="feed-card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (그라데이션 테두리) */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="feed-card-username">
              {post.user.name}
            </span>
            <span className="feed-card-meta">
              For You · {timeAgo}
            </span>
          </div>
        </div>

        {/* 우측: 팔로우 칩 또는 더보기 메뉴 */}
        {!isOwnPost ? (
          <button
            onClick={handleFollow}
            className="chip-follow"
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="더보기"
                disabled={isDeleting}
              >
                <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "삭제 중..." : "삭제"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* 본문: 4:5 비율 이미지 + 콘텐츠 타입 태그 */}
      <div
        className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
        onDoubleClick={() => {
          if (!isLiked) {
            setShowDoubleTapHeart(true);
            setTimeout(() => setShowDoubleTapHeart(false), 1000);
            handleLike();
          }
        }}
        onClick={() => onClick?.(post.id)}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          unoptimized
        />

        {/* AI 추천 배지 */}
        {isAIRecommended && (
          <div className="absolute top-3 right-3 z-10">
            <div className="badge-content-type flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI 추천
            </div>
          </div>
        )}

        {/* 콘텐츠 타입 태그 */}
        <div className="absolute top-3 left-3 z-10">
          <span className="badge-content-type">Post</span>
        </div>

        {/* 더블탭 시 큰 하트 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-32 h-32 fill-red-500 text-red-500 animate-heart-explosion" />
          </div>
        )}
      </div>

      {/* 하단: 아이콘 + 마이크로 카운터 */}
      <div className="feed-card-actions">
        <div className="flex items-center gap-4">
          {/* 좋아요 */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all duration-200",
                isLiked && "fill-red-500 text-red-500",
                !isLiked && "text-gray-600 dark:text-gray-400"
              )}
            />
            <span
              className="text-sm font-bold tabular-nums transition-all duration-200"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {formatNumber(likesCount)}
            </span>
          </button>

          {/* 댓글 (in-place 확장 트리거) */}
          <button
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className="flex items-center gap-2"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {formatNumber(commentsCount)}
            </span>
          </button>

          {/* 저장 */}
          <button aria-label="저장">
            <Bookmark className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* 우측: Repost/Remix */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Repost"
        >
          <Repeat className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* 캡션 */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span className="font-semibold">{post.user.name}</span>{" "}
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
              className="text-sm mt-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* In-place 댓글 확장 영역 */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isCommentsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <CommentList
            key={commentKey}
            postId={post.id}
            limit={10}
            onDelete={() => {
              setCommentKey((prev) => prev + 1);
            }}
          />
          <div className="mt-3">
            <CommentForm
              postId={post.id}
              onSubmit={() => {
                setCommentKey((prev) => prev + 1);
                setCommentsCount((prev) => prev + 1);
                onComment?.(post.id);
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
});

