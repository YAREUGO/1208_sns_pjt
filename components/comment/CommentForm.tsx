/**
 * @file components/comment/CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * 기능:
 * - 댓글 입력 필드 ("댓글 달기...")
 * - Enter 키 또는 "게시" 버튼으로 제출
 */

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

interface CommentFormProps {
  postId: string;
  onSubmit?: () => void;
}

export function CommentForm({ postId, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isSignedIn } = useUser();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isSignedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      // 성공 시 입력 필드 초기화
      setContent("");
      onSubmit?.();
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isSignedIn) {
    return (
      <div className="px-4 py-3 border-t border-border bg-card/50 dark:bg-card/30">
        <p className="text-white/80 dark:text-neutral-300 text-sm text-center">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border bg-card/50 dark:bg-card/30">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-white placeholder:text-white/50 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          disabled={submitting}
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={!content.trim() || submitting}
          className="text-blue-400 hover:text-blue-300 hover:bg-transparent px-2 disabled:opacity-50"
        >
          {submitting ? (
            <span className="text-xs">게시 중...</span>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}

