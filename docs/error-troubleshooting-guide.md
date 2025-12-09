# Vercel 배포 에러 해결 가이드

이 문서는 실제 프로젝트에서 발생한 Vercel 배포 에러들과 해결 방법을 정리한 것입니다. 다음 프로젝트에서 유사한 문제가 발생할 때 참고하세요.

## 📋 목차

1. [Next.js 15 클라이언트 참조 매니페스트 에러](#1-nextjs-15-클라이언트-참조-매니페스트-에러)
2. [pnpm 10.x 호환성 문제](#2-pnpm-10x-호환성-문제)
3. [Clerk 환경 변수 누락 에러](#3-clerk-환경-변수-누락-에러)
4. [예방 체크리스트](#예방-체크리스트)

---

## 1. Next.js 15 클라이언트 참조 매니페스트 에러

### 🔴 에러 메시지

```
Error: ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(main)/page_client-reference-manifest.js'
```

### 🔍 원인 분석

1. **Route Group 충돌**: `app/page.tsx`와 `app/(main)/page.tsx`가 동시에 존재하여 같은 `/` 경로에 매핑됨
2. **Next.js 15의 클라이언트 컴포넌트 참조 시스템**: Route Group 내부의 서버 컴포넌트가 클라이언트 참조 매니페스트를 생성하지 못함
3. **빌드 시점 문제**: Vercel 빌드 환경에서 파일 생성 타이밍 이슈

### ✅ 해결 방법

#### 1단계: 중복 라우트 제거

```bash
# app/page.tsx 삭제 (app/(main)/page.tsx만 유지)
rm app/page.tsx
```

#### 2단계: Route Group 내 페이지를 클라이언트 컴포넌트로 변환

**`app/(main)/page.tsx`**
```typescript
"use client";  // 추가

import { PostFeed } from "@/components/post/PostFeed";

export default function HomePage() {
  return <PostFeed useV2={true} />;
}
```

#### 3단계: 동적 렌더링 강제 (선택사항)

Route Group 내 모든 페이지에 추가:

```typescript
export const dynamic = "force-dynamic";
```

#### 4단계: 검증

```bash
pnpm build
# .next/server/app/(main)/page_client-reference-manifest.js 파일 생성 확인
```

### 📝 핵심 포인트

- **Route Group `(main)`은 URL에 영향을 주지 않음** - 같은 경로에 여러 페이지가 있으면 충돌 발생
- **Next.js 15에서는 클라이언트 컴포넌트가 명시적으로 필요할 수 있음**
- **빌드 후 `.next/server/app/(main)/` 폴더 구조 확인 필수**

### 🛡️ 예방책

1. Route Group 사용 시 중복 라우트 확인
2. 빌드 후 `page_client-reference-manifest.js` 파일 존재 확인
3. Route Group 내 페이지는 가능하면 클라이언트 컴포넌트로 작성

---

## 2. pnpm 10.x 호환성 문제

### 🔴 에러 메시지

```
ERR_PNPM_META_FETCH_FAIL: GET https://registry.npmjs.org/@eslint%2Feslintrc
Value of "this" must be of type URLSearchParams
```

### 🔍 원인 분석

1. **Vercel이 pnpm@10.x를 자동으로 사용**: 프로젝트 생성 날짜 기반으로 버전 선택
2. **pnpm 10.x의 npm registry 호환성 버그**: URLSearchParams 관련 내부 버그
3. **네트워크 안정성 문제**: 재시도 로직 부족

### ✅ 해결 방법

#### 1단계: package.json에 packageManager 필드 추가

```json
{
  "name": "your-project",
  "version": "0.1.0",
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

#### 2단계: .npmrc 파일 생성

**`.npmrc`**
```
# pnpm 설정 - Vercel 배포 호환성
engine-strict=true
auto-install-peers=true
shamefully-hoist=true

# npm registry 설정
registry=https://registry.npmjs.org/

# 네트워크 안정성
fetch-retries=5
fetch-retry-factor=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
```

#### 3단계: vercel.json 업데이트

**`vercel.json`**
```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && pnpm install",
  "buildCommand": "pnpm build"
}
```

#### 4단계: pnpm-lock.yaml을 Git에 포함

**`.gitignore`에서 제거:**
```gitignore
# pnpm
# pnpm-lock.yaml은 반드시 git에 포함해야 함 (Vercel 배포용)
```

#### 5단계: 로컬에서 pnpm 버전 고정 및 재설치

```bash
# pnpm-lock.yaml 삭제
rm pnpm-lock.yaml

# node_modules 삭제
rm -rf node_modules

# corepack으로 pnpm 버전 고정
corepack enable
corepack prepare pnpm@9.15.0 --activate

# 재설치
pnpm install
```

### 📝 핵심 포인트

- **`packageManager` 필드는 Node.js 16.9+ / Corepack 필수**
- **pnpm-lock.yaml은 반드시 Git에 포함** - Vercel이 정확한 의존성 버전을 사용
- **.npmrc로 네트워크 재시도 설정** - 불안정한 네트워크 환경 대응

### 🛡️ 예방책

1. 프로젝트 시작 시 `packageManager` 필드 추가
2. `.npmrc` 파일로 네트워크 안정성 설정
3. `pnpm-lock.yaml`을 `.gitignore`에 추가하지 않기
4. 로컬과 Vercel에서 동일한 pnpm 버전 사용

---

## 3. Clerk 환경 변수 누락 에러

### 🔴 에러 메시지

```
Error: @clerk/clerk-react: Missing publishableKey. 
You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
Error occurred prerendering page "/_not-found"
```

### 🔍 원인 분석

1. **Vercel에 환경 변수가 설정되지 않음**: 빌드 시 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 없음
2. **ClerkProvider가 서버 컴포넌트에서 실행**: 빌드 시점에 환경 변수 체크 실패
3. **정적 페이지 생성(SSG) 시 에러**: `/_not-found` 페이지 prerendering 실패

### ✅ 해결 방법

#### 1단계: ClerkProviderWrapper 클라이언트 컴포넌트 생성

**`components/providers/clerk-provider-wrapper.tsx`**
```typescript
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // 환경 변수가 없으면 친절한 안내 메시지 표시
  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-xl font-bold mb-2">환경 변수 설정 필요</h1>
          <p className="text-gray-600 mb-4">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">Vercel 설정 방법:</p>
            <ol className="list-decimal list-inside space-y-1">
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
      appearance={{ cssLayerName: "clerk" }}
    >
      {children}
    </ClerkProvider>
  );
}
```

#### 2단계: app/layout.tsx 수정

**`app/layout.tsx`**
```typescript
import { ClerkProviderWrapper } from "@/components/providers/clerk-provider-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ClerkProviderWrapper>
          {/* 나머지 컴포넌트 */}
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
```

#### 3단계: Vercel에 환경 변수 설정

**Vercel CLI 사용:**
```bash
# Vercel 프로젝트 연결
vercel link

# 환경 변수 추가
echo "pk_test_..." | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "sk_test_..." | vercel env add CLERK_SECRET_KEY production
# ... 나머지 환경 변수들
```

**또는 Vercel Dashboard:**
1. Settings → Environment Variables
2. 각 환경 변수 추가
3. Production 환경 선택
4. Redeploy

### 📝 핵심 포인트

- **클라이언트 컴포넌트로 분리**: 빌드 시점 에러 방지
- **환경 변수 체크**: 없을 때 친절한 안내 메시지
- **Vercel CLI 활용**: 자동화된 환경 변수 설정

### 🛡️ 예방책

1. 프로젝트 시작 시 환경 변수 목록 문서화
2. `ClerkProviderWrapper` 같은 래퍼 컴포넌트 사용
3. 환경 변수 없을 때의 폴백 UI 제공
4. Vercel 배포 전 환경 변수 체크리스트 작성

---

## 예방 체크리스트

### 프로젝트 시작 시

- [ ] `package.json`에 `packageManager` 필드 추가
- [ ] `.npmrc` 파일 생성 (네트워크 안정성 설정)
- [ ] `pnpm-lock.yaml`이 `.gitignore`에 없는지 확인
- [ ] `vercel.json`에 `corepack enable` 추가
- [ ] Route Group 사용 시 중복 라우트 확인

### 빌드 전

- [ ] 로컬에서 `pnpm build` 성공 확인
- [ ] `.next/server/app/` 폴더 구조 확인
- [ ] `page_client-reference-manifest.js` 파일 생성 확인
- [ ] 환경 변수 목록 문서화

### Vercel 배포 전

- [ ] 모든 환경 변수가 Vercel에 설정되었는지 확인
- [ ] `vercel env ls production` 명령으로 확인
- [ ] 빌드 로그에서 에러 없는지 확인
- [ ] 배포 후 사이트 접속 테스트

### 일반적인 문제 해결 순서

1. **로컬 빌드 테스트**: `pnpm build` 실행
2. **에러 메시지 분석**: 정확한 에러 위치 파악
3. **관련 파일 확인**: 에러가 발생한 파일 검토
4. **해결 방법 적용**: 위 가이드 참고
5. **재빌드 및 검증**: 수정 후 다시 빌드

---

## 추가 리소스

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [pnpm 공식 문서](https://pnpm.io/)
- [Clerk Next.js 통합](https://clerk.com/docs/quickstarts/nextjs)

---

## 변경 이력

- **2025-01-08**: 초기 문서 작성
  - Next.js 15 클라이언트 참조 매니페스트 에러
  - pnpm 10.x 호환성 문제
  - Clerk 환경 변수 누락 에러

---

**💡 팁**: 이 문서는 실제 프로젝트에서 발생한 에러를 기반으로 작성되었습니다. 유사한 문제가 발생하면 이 문서를 먼저 참고하세요!

