/**
 * @file components/post/PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * Mobile: 전체 페이지로 전환
 * - 게시물 상세 정보 로드
 * - 댓글 전체 목록 표시
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostWithUser } from "@/lib/types";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import { LikeButton } from "./LikeButton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostModal({ postId, open, onOpenChange }: PostModalProps) {
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentKey, setCommentKey] = useState(0);
  // user는 향후 사용 예정

  useEffect(() => {
    if (!open || !postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching post:", data.error);
          setPost(null);
          return;
        }

        if (data.post || data.data) {
          const postData = data.post || data.data;
          setPost(postData);
          setLikesCount(postData.likes_count);

          // 좋아요 상태 확인
          try {
            const likeResponse = await fetch(`/api/likes/${postId}`);
            const likeData = await likeResponse.json();
            setIsLiked(likeData.liked || false);
          } catch (error) {
            console.error("Error checking like status:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [open, postId]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setPost(null);
      setLoading(true);
      setIsLiked(false);
      setLikesCount(0);
      setCommentKey(0);
    }
  }, [open]);

  if (loading || !post) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[1000px] p-0 h-[90vh] md:h-auto flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-instagram-text-secondary" />
        </DialogContent>
      </Dialog>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[1000px] p-0 h-[90vh] md:h-auto">
        <div className="flex flex-col md:flex-row h-full">
          {/* 이미지 영역 (Desktop: 50%, Mobile: 전체) */}
          <div className="relative w-full md:w-1/2 h-64 md:h-[600px] bg-gray-100">
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              unoptimized
            />
          </div>

          {/* 댓글 영역 (Desktop: 50%, Mobile: 전체) */}
          <div className="flex flex-col w-full md:w-1/2 h-[calc(90vh-16rem)] md:h-[600px]">
            {/* 헤더 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-instagram-border">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-instagram-text-secondary text-xs">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <span className="font-instagram-semibold text-instagram-text-primary text-sm">
                  {post.user.name}
                </span>
              </div>
            </div>

            {/* 댓글 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto">
              {/* 캡션 */}
              {post.caption && (
                <div className="px-4 py-3 border-b border-instagram-border">
                  <p className="text-sm">
                    <span className="font-instagram-semibold text-instagram-text-primary">
                      {post.user.name}
                    </span>{" "}
                    <span className="text-instagram-text-primary">
                      {post.caption}
                    </span>
                  </p>
                  <span className="text-instagram-text-secondary text-xs mt-1 block">
                    {timeAgo}
                  </span>
                </div>
              )}

              {/* 댓글 목록 (전체) */}
              <CommentList postId={postId} showAll={true} key={commentKey} />
            </div>

            {/* 액션 버튼 및 좋아요 수 */}
            <div className="border-t border-instagram-border">
              <div className="px-4 py-3 flex items-center gap-4">
                <LikeButton
                  postId={postId}
                  initialLiked={isLiked}
                  initialLikesCount={likesCount}
                  onLikeChange={(liked, newCount) => {
                    setIsLiked(liked);
                    setLikesCount(newCount);
                  }}
                />
              </div>
              {likesCount > 0 && (
                <div className="px-4 pb-2">
                  <span className="font-instagram-semibold text-instagram-text-primary text-sm">
                    좋아요 {likesCount}개
                  </span>
                </div>
              )}

              {/* 댓글 작성 폼 */}
              <CommentForm
                postId={postId}
                onSubmit={() => {
                  setCommentKey((prev) => prev + 1);
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
