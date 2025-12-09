/**
 * @file components/reels/ReelsFeed.tsx
 * @description Reels 피드 컴포넌트
 *
 * 기능:
 * - 세로 스크롤 방식의 Reels 피드
 * - 각 Reel은 전체 화면 높이
 * - 스와이프/스크롤로 다음 Reel로 이동
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PostWithUser } from "@/lib/types";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import Image from "next/image";
import { MessageCircle, Share2, MoreVertical } from "lucide-react";
import { LikeButton } from "@/components/post/LikeButton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

export function ReelsFeed() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (currentOffset: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: currentOffset.toString(),
      });

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching posts:", data.error);
        return;
      }

      const newPosts = data.data || [];
      setPosts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });
      setHasMore(data.hasMore || newPosts.length === 20);
      setOffset(currentOffset + newPosts.length);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // 스크롤 이벤트로 다음 Reel 로드
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // 하단 80% 지점에 도달하면 더 로드
      if (scrollTop + clientHeight >= scrollHeight * 0.8 && hasMore && !loading) {
        fetchPosts(offset);
      }

      // 현재 보이는 Reel 인덱스 계산
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, offset, currentIndex, fetchPosts]);

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <PostCardSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Reels가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {posts.map((post, index) => (
        <ReelItem
          key={post.id}
          post={post}
          isActive={index === currentIndex}
        />
      ))}
      {loading && posts.length > 0 && (
        <div className="h-screen flex items-center justify-center snap-center">
          <PostCardSkeleton />
        </div>
      )}
    </div>
  );
}

interface ReelItemProps {
  post: PostWithUser;
  isActive: boolean;
}

function ReelItem({ post, isActive }: ReelItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="h-screen snap-center relative flex items-center justify-center bg-black">
      {/* 이미지/비디오 */}
      <div className="absolute inset-0">
        <Image
          src={post.image_url}
          alt={post.caption || "Reel"}
          fill
          className="object-cover"
          unoptimized
          priority={isActive}
        />
      </div>

      {/* 오버레이 그라데이션 (하단) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full h-full flex">
        {/* 왼쪽: 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col justify-end p-6 pb-20">
          {/* 사용자 정보 */}
          <Link
            href={`/profile/${post.user.clerk_id}`}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center overflow-hidden border-2 border-white">
              {post.user.profile_image_url ? (
                <Image
                  src={post.user.profile_image_url}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{post.user.name}</p>
              <p className="text-white/70 text-sm">{timeAgo}</p>
            </div>
          </Link>

          {/* 캡션 */}
          {post.caption && (
            <p className="text-white mb-4 line-clamp-3">{post.caption}</p>
          )}
        </div>

        {/* 오른쪽: 액션 버튼 */}
        <div className="flex flex-col items-center justify-end gap-4 p-6 pb-20">
          <div className="flex flex-col items-center gap-2">
            <LikeButton
              postId={post.id}
              initialLiked={isLiked}
              initialLikesCount={likesCount}
              onLikeChange={(liked, newCount) => {
                setIsLiked(liked);
                setLikesCount(newCount);
              }}
            />
            <span className="text-white text-xs font-semibold">
              {likesCount}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-xs font-semibold">
              {post.comments_count || 0}
            </span>
          </div>

          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </button>

          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

