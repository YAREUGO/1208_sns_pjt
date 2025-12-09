/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지
 *
 * 모든 사용자의 게시물을 시간 역순으로 표시합니다.
 * PostFeed 컴포넌트를 사용하여 무한 스크롤로 게시물을 로드합니다.
 */

"use client";

import { PostFeed } from "@/components/post/PostFeed";

export default function HomePage() {
  return <PostFeed useV2={true} />;
}

