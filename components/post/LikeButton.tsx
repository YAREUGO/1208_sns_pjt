/**
 * @file components/post/LikeButton.tsx
 * @description 좋아요 버튼 컴포넌트
 *
 * 기능:
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 애니메이션 (scale 1.3 → 1, 0.15초)
 * - 더블탭 좋아요 (모바일, 큰 하트 fade in/out, 1초)
 */

"use client";

import { useState, useRef } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  showDoubleTap?: boolean; // 더블탭 좋아요 표시 여부 (이미지 영역에서 사용)
}

export function LikeButton({
  postId,
  initialLiked,
  initialLikesCount,
  onLikeChange,
  showDoubleTap = false,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const loadingRef = useRef(false);

  // 더블탭 감지
  const handleDoubleTap = () => {
    if (!showDoubleTap) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && !isLiked) {
      // 더블탭 감지 및 좋아요 추가
      handleLike(true);
      setShowDoubleTapHeart(true);
      setTimeout(() => {
        setShowDoubleTapHeart(false);
      }, 1000);
    }

    lastTapRef.current = now;
  };

  // 좋아요 토글
  const handleLike = async (skipAnimation = false) => {
    if (loadingRef.current) return;

    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트
    setIsLiked(newLiked);
    setLikesCount(newCount);

    if (!skipAnimation) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 150);
    }

    loadingRef.current = true;

    try {
      const response = await fetch("/api/likes", {
        method: newLiked ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 실패 시 롤백
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        console.error("Error toggling like:", data.error);
        return;
      }

      // 성공 시 콜백 호출
      onLikeChange?.(newLiked, newCount);
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error("Error toggling like:", error);
    } finally {
      loadingRef.current = false;
    }
  };

  return (
    <>
      <button
        onClick={() => handleLike()}
        onDoubleClick={handleDoubleTap}
        className={cn(
          "text-instagram-text-primary hover:opacity-70 transition-all duration-150",
          isAnimating && "scale-[1.3]",
          !isAnimating && "scale-100"
        )}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all duration-150",
            isLiked && "fill-instagram-like text-instagram-like"
          )}
        />
      </button>

      {/* 더블탭 시 큰 하트 표시 */}
      {showDoubleTapHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart
            className={cn(
              "w-24 h-24 fill-instagram-like text-instagram-like",
              "animate-[fadeInOut_1s_ease-in-out]"
            )}
          />
        </div>
      )}
    </>
  );
}

