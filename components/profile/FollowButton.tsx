/**
 * @file components/profile/FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * 기능:
 * - "팔로우" 버튼 (파란색, 미팔로우 상태)
 * - "팔로잉" 버튼 (회색, 팔로우 중 상태)
 * - Hover 시 "언팔로우" (빨간 테두리)
 * - 클릭 시 즉시 API 호출 및 UI 업데이트
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface FollowButtonProps {
  userId: string; // Supabase user ID 또는 clerk_id
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleFollowToggle = async () => {
    if (!isSignedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const newFollowingStatus = !isFollowing;

    // 낙관적 업데이트
    setIsFollowing(newFollowingStatus);
    onFollowChange?.(newFollowingStatus);

    try {
      const response = await fetch("/api/follows", {
        method: newFollowingStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followingId: userId }),
      });

      if (!response.ok) {
        // 에러 발생 시 상태 롤백
        setIsFollowing(!newFollowingStatus);
        onFollowChange?.(!newFollowingStatus);
        const errorData = await response.json();
        throw new Error(errorData.error || "팔로우 처리 실패");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert(error instanceof Error ? error.message : "팔로우 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      className={cn(
        "w-full md:w-auto font-instagram-semibold transition-colors",
        isFollowing
          ? isHovering
            ? "bg-white text-red-600 border border-red-600 hover:bg-red-50"
            : "bg-gray-200 text-instagram-text-primary hover:bg-gray-300"
          : "bg-instagram-blue text-white hover:bg-instagram-blue/90"
      )}
    >
      {isLoading
        ? "처리 중..."
        : isFollowing
          ? isHovering
            ? "언팔로우"
            : "팔로잉"
          : "팔로우"}
    </Button>
  );
}

