/**
 * @file app/(main)/search/page.tsx
 * @description 검색 페이지
 *
 * 기능:
 * - 사용자 검색
 * - 게시물 검색
 * - 실시간 검색 결과 표시
 */

import { SearchPageClient } from "@/components/search/SearchPageClient";

// Vercel 배포 시 클라이언트 참조 매니페스트 문제 해결을 위한 동적 렌더링 강제
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return <SearchPageClient />;
}

