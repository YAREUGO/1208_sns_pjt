/**
 * @file components/providers/clerk-provider-wrapper.tsx
 * @description Clerk Provider 래퍼 컴포넌트
 *
 * 빌드 시 환경 변수 누락으로 인한 에러 방지를 위한 클라이언트 컴포넌트
 */

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // 클라이언트에서 환경 변수 확인
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // 환경 변수가 없으면 경고 메시지 표시 (프로덕션에서만)
  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-app, #fafafa)' }}>
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">환경 변수 설정 필요</h1>
          <p className="text-gray-600 mb-4">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold text-gray-700 mb-2">Vercel 설정 방법:</p>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              <li>Vercel Dashboard 접속</li>
              <li>프로젝트 → Settings → Environment Variables</li>
              <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 추가</li>
              <li>Redeploy 실행</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      {children}
    </ClerkProvider>
  );
}

