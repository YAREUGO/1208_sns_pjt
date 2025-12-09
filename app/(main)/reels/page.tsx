/**
 * @file app/(main)/reels/page.tsx
 * @description Reels 페이지
 *
 * 기능:
 * - 세로 스크롤 방식의 Reels 피드
 * - 전체 화면 Reels 경험
 */

import { ReelsFeed } from "@/components/reels/ReelsFeed";

// Vercel 배포 시 클라이언트 참조 매니페스트 문제 해결을 위한 동적 렌더링 강제
export const dynamic = "force-dynamic";

export default function ReelsPage() {
  return (
    <div className="fixed inset-0" style={{ background: 'var(--color-bg-app)' }}>
      <ReelsFeed />
    </div>
  );
}

