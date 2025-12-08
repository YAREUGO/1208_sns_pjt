/**
 * @file components/comment/CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * 기능:
 * - 댓글 목록 렌더링
 * - PostCard: 최신 2개만 표시
 * - 상세 모달: 전체 댓글 + 스크롤
 * - 삭제 버튼 (본인만 표시)
 */

"use client";

import { useState, useEffect } from "react";
// MoreHorizontal, Trash2는 향후 사용 예정
import { CommentWithUser } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CommentListProps {
  postId: string;
  limit?: number; // PostCard에서는 2개, 상세 모달에서는 전체
  showAll?: boolean; // 전체 댓글 표시 여부
  onDelete?: () => void;
}

export function CommentList({
  postId,
  limit,
  showAll = false,
  onDelete,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { user } = useUser();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/comments/${postId}`);
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching comments:", data.error);
          return;
        }

        const fetchedComments = data.data || [];
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(commentId));

    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "댓글 삭제에 실패했습니다.");
      }

      // 댓글 목록에서 제거
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onDelete?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2">
        <p className="text-instagram-text-secondary text-sm">댓글을 불러오는 중...</p>
      </div>
    );
  }

  const displayComments = showAll ? comments : comments.slice(-(limit || 2));

  if (displayComments.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "px-4",
        showAll && "max-h-[400px] overflow-y-auto"
      )}
    >
      {displayComments.map((comment) => {
        const isOwner = user?.id === comment.user.clerk_id;
        const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
          addSuffix: true,
          locale: ko,
        });

        return (
          <div
            key={comment.id}
            className="flex items-start gap-2 py-2 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-instagram-semibold text-instagram-text-primary">
                  {comment.user.name}
                </span>{" "}
                <span className="text-instagram-text-primary">
                  {comment.content}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-instagram-text-secondary text-xs">
                  {timeAgo}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingIds.has(comment.id)}
                    className="text-instagram-text-secondary text-xs hover:text-instagram-like transition-colors disabled:opacity-50"
                  >
                    {deletingIds.has(comment.id) ? "삭제 중..." : "삭제"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

