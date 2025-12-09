/**
 * @file components/post/LikeButtonV2.tsx
 * @description 2025년형 좋아요 버튼 (과감한 애니메이션)
 *
 * 새로운 특징:
 * - 과감한 heartExplosion 애니메이션 (기울어지면서 scale + blur + fade)
 * - 숫자 슬라이드 업 애니메이션
 * - 더블탭 감지 개선
 */

"use client";

import { useState, useRef } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonV2Props {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  showCounter?: boolean; // 카운터 표시 여부
}

export function LikeButtonV2({
  postId,
  initialLiked,
  initialLikesCount,
  onLikeChange,
  showCounter = true,
}: LikeButtonV2Props) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const loadingRef = useRef(false);

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
    if (loadingRef.current) return;

    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트
    setIsLiked(newLiked);
    setLikesCount(newCount);

    // 과감한 애니메이션
    if (newLiked) {
      setIsAnimating(true);
      setShowExplosion(true);
      setTimeout(() => {
        setIsAnimating(false);
        setShowExplosion(false);
      }, 800);
    } else {
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
    <div className="relative flex items-center gap-2">
      <button
        onClick={handleLike}
        className={cn(
          "relative transition-all duration-200",
          isAnimating && isLiked && "scale-125"
        )}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all duration-200",
            isLiked && "fill-red-500 text-red-500",
            !isLiked && "text-gray-600 dark:text-gray-400"
          )}
        />

        {/* 과감한 하트 폭발 애니메이션 */}
        {showExplosion && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <Heart className="w-32 h-32 fill-red-500 text-red-500 animate-heart-explosion" />
          </div>
        )}
      </button>

      {/* 카운터 (숫자 슬라이드 업 애니메이션) */}
      {showCounter && (
        <span
          className={cn(
            "text-sm font-bold tabular-nums transition-all duration-300",
            isAnimating && "scale-110"
          )}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {formatNumber(likesCount)}
        </span>
      )}
    </div>
  );
}

