/**
 * @file app/(main)/messages/page.tsx
 * @description 메시지 페이지 (향후 구현)
 */

// Vercel 배포 시 클라이언트 참조 매니페스트 문제 해결을 위한 동적 렌더링 강제
export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground dark:text-neutral-100 mb-4">
          Messages
        </h1>
        <p className="text-muted-foreground mb-6">
          메시지 기능은 곧 제공될 예정입니다.
        </p>
        <p className="text-sm text-muted-foreground">
          다른 사용자와의 실시간 채팅 기능을 준비 중입니다.
        </p>
      </div>
    </div>
  );
}

