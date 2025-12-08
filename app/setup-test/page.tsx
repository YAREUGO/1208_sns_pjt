/**
 * @file app/setup-test/page.tsx
 * @description 기본 세팅 테스트 페이지
 * 
 * 이 페이지는 기본 세팅이 올바르게 작동하는지 확인하기 위한 테스트 페이지입니다.
 * - Tailwind CSS Instagram 컬러 스키마 테스트
 * - TypeScript 타입 import 테스트
 */

import { User, Post, PostWithUser } from "@/lib/types";

export default function SetupTestPage() {
  // TypeScript 타입 테스트
  const testUser: User = {
    id: "test-uuid",
    clerk_id: "clerk_test_123",
    name: "테스트 사용자",
    created_at: new Date().toISOString(),
  };

  const testPost: Post = {
    id: "post-uuid",
    user_id: testUser.id,
    image_url: "https://example.com/image.jpg",
    caption: "테스트 캡션",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const testPostWithUser: PostWithUser = {
    ...testPost,
    likes_count: 10,
    comments_count: 5,
    user: testUser,
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">기본 세팅 테스트</h1>

        {/* Instagram 컬러 스키마 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Instagram 컬러 스키마 테스트</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram Blue */}
            <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
              <div className="space-y-2">
                <div className="font-semibold" style={{ color: 'var(--instagram-text-primary)' }}>
                  Instagram Blue
                </div>
                <div 
                  className="px-4 py-2 rounded text-white inline-block"
                  style={{ backgroundColor: 'var(--instagram-blue)' }}
                >
                  팔로우 버튼
                </div>
              </div>
            </div>

            {/* Instagram Like */}
            <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
              <div className="space-y-2">
                <div className="font-semibold" style={{ color: 'var(--instagram-text-primary)' }}>
                  Instagram Like
                </div>
                <div 
                  className="text-2xl"
                  style={{ color: 'var(--instagram-like)' }}
                >
                  ❤️
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
              <div className="space-y-2">
                <div className="font-semibold" style={{ color: 'var(--instagram-text-primary)' }}>
                  Primary Text
                </div>
                <div style={{ color: 'var(--instagram-text-secondary)' }}>
                  Secondary Text
                </div>
              </div>
            </div>

            {/* Background */}
            <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
              <div className="space-y-2">
                <div className="font-semibold" style={{ color: 'var(--instagram-text-primary)' }}>
                  Background Colors
                </div>
                <div className="text-sm" style={{ color: 'var(--instagram-text-secondary)' }}>
                  Card Background: #ffffff
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 타이포그래피 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. 타이포그래피 테스트</h2>
          
          <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
            <div className="space-y-2">
              <div style={{ fontSize: 'var(--instagram-text-xs)', color: 'var(--instagram-text-secondary)' }}>
                XS (12px) - 시간 표시용
              </div>
              <div style={{ fontSize: 'var(--instagram-text-sm)', color: 'var(--instagram-text-primary)' }}>
                SM (14px) - 기본 텍스트
              </div>
              <div style={{ fontSize: 'var(--instagram-text-base)', color: 'var(--instagram-text-primary)' }}>
                Base (16px) - 입력창
              </div>
              <div style={{ fontSize: 'var(--instagram-text-xl)', color: 'var(--instagram-text-primary)' }}>
                XL (20px) - 프로필
              </div>
            </div>
          </div>
        </section>

        {/* TypeScript 타입 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. TypeScript 타입 테스트</h2>
          
          <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
            <div className="space-y-4">
              <div>
                <div className="font-semibold mb-2" style={{ color: 'var(--instagram-text-primary)' }}>
                  User 타입:
                </div>
                <pre className="text-xs p-2 rounded bg-gray-100 overflow-auto">
                  {JSON.stringify(testUser, null, 2)}
                </pre>
              </div>
              
              <div>
                <div className="font-semibold mb-2" style={{ color: 'var(--instagram-text-primary)' }}>
                  Post 타입:
                </div>
                <pre className="text-xs p-2 rounded bg-gray-100 overflow-auto">
                  {JSON.stringify(testPost, null, 2)}
                </pre>
              </div>
              
              <div>
                <div className="font-semibold mb-2" style={{ color: 'var(--instagram-text-primary)' }}>
                  PostWithUser 타입 (통계 포함):
                </div>
                <pre className="text-xs p-2 rounded bg-gray-100 overflow-auto">
                  {JSON.stringify(testPostWithUser, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 상태 표시 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. 설정 상태</h2>
          
          <div className="p-4 rounded border" style={{ backgroundColor: 'var(--instagram-card-background)', borderColor: 'var(--instagram-border)' }}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span style={{ color: 'var(--instagram-text-primary)' }}>
                  Tailwind CSS Instagram 컬러 스키마 설정 완료
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span style={{ color: 'var(--instagram-text-primary)' }}>
                  타이포그래피 설정 완료
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span style={{ color: 'var(--instagram-text-primary)' }}>
                  TypeScript 타입 정의 완료
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⚠</span>
                <span style={{ color: 'var(--instagram-text-secondary)' }}>
                  Supabase 마이그레이션: 수동으로 실행 필요 (docs/setup-guide.md 참고)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⚠</span>
                <span style={{ color: 'var(--instagram-text-secondary)' }}>
                  Storage 버킷: 수동으로 생성 필요 (docs/setup-guide.md 참고)
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

