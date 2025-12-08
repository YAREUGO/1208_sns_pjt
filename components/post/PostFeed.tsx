/**
 * @file components/post/PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 기능:
 * - 게시물 목록 렌더링
 * - 무한 스크롤 (Intersection Observer)
 * - 페이지네이션 (10개씩)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { PostModal } from "./PostModal";
import { PostWithUser } from "@/lib/types";

interface PostFeedProps {
  userId?: string; // 특정 사용자의 게시물만 조회 (프로필 페이지용)
  initialPosts?: PostWithUser[];
}

export function PostFeed({ userId, initialPosts = [] }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialPosts.length);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = async (currentOffset: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "10",
        offset: currentOffset.toString(),
      });

      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching posts:", data.error);
        return;
      }

      const newPosts = data.data || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(data.hasMore || newPosts.length === 10);
      setOffset(currentOffset + newPosts.length);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(offset);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, offset, userId]);

  // 초기 데이터가 없으면 첫 로드
  useEffect(() => {
    if (initialPosts.length === 0 && !loading && hasMore) {
      fetchPosts(0);
    }
  }, []);

  const handleLike = (postId: string) => {
    // 좋아요 상태는 LikeButton에서 관리
    // 필요시 피드의 게시물 좋아요 수 업데이트
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          // 좋아요 수는 API 응답으로 업데이트되므로 여기서는 상태만 관리
          return post;
        }
        return post;
      }),
    );
  };

  const handleComment = (postId: string) => {
    // 댓글 작성 후 피드 새로고침
    fetchPosts(0);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleDelete = (postId: string) => {
    // 피드에서 게시물 제거
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-4">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onClick={handlePostClick}
          onDelete={handleDelete}
        />
      ))}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* 무한 스크롤 감지 타겟 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-instagram-text-secondary text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}

      {/* 게시물이 없을 때 */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-instagram-text-secondary">
          <p className="text-lg mb-2">게시물이 없습니다</p>
          <p className="text-sm">첫 게시물을 작성해보세요!</p>
        </div>
      )}

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
    </div>
  );
}
