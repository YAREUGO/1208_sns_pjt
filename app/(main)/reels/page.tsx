/**
 * @file app/(main)/reels/page.tsx
 * @description Reels 페이지
 *
 * 기능:
 * - 세로 스크롤 방식의 Reels 피드
 * - 전체 화면 Reels 경험
 */

import { ReelsFeed } from "@/components/reels/ReelsFeed";

export default function ReelsPage() {
  return (
    <div className="fixed inset-0" style={{ background: 'var(--color-bg-app)' }}>
      <ReelsFeed />
    </div>
  );
}

