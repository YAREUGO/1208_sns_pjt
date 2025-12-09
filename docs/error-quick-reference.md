# 에러 빠른 참조 가이드

자주 발생하는 에러와 빠른 해결 방법을 정리한 치트시트입니다.

## 🔥 긴급 해결 (빠른 참조)

### 1. `ENOENT: page_client-reference-manifest.js`

**원인**: Route Group 충돌 또는 클라이언트 컴포넌트 누락

**해결**:
```bash
# 1. 중복 라우트 확인 및 제거
# app/page.tsx와 app/(main)/page.tsx 동시 존재 확인

# 2. 클라이언트 컴포넌트로 변환
# "use client" 추가

# 3. 빌드 확인
pnpm build
```

**상세**: [`error-troubleshooting-guide.md`](./error-troubleshooting-guide.md#1-nextjs-15-클라이언트-참조-매니페스트-에러)

---

### 2. `ERR_PNPM_META_FETCH_FAIL`

**원인**: pnpm 10.x 버그

**해결**:
```json
// package.json
{
  "packageManager": "pnpm@9.15.0",
  "engines": { "node": ">=20.0.0" }
}
```

```bash
# .npmrc 생성 (네트워크 안정성)
# vercel.json에 corepack enable 추가
# pnpm-lock.yaml Git에 포함
```

**상세**: [`error-troubleshooting-guide.md`](./error-troubleshooting-guide.md#2-pnpm-10x-호환성-문제)

---

### 3. `Missing publishableKey` (Clerk)

**원인**: Vercel 환경 변수 누락

**해결**:
```typescript
// ClerkProviderWrapper 클라이언트 컴포넌트 생성
"use client";
// 환경 변수 체크 및 폴백 UI
```

```bash
# Vercel CLI로 환경 변수 추가
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
```

**상세**: [`error-troubleshooting-guide.md`](./error-troubleshooting-guide.md#3-clerk-환경-변수-누락-에러)

---

## 📋 프로젝트 시작 체크리스트

```bash
# 1. package.json 설정
"packageManager": "pnpm@9.15.0"
"engines": { "node": ">=20.0.0" }

# 2. .npmrc 생성
engine-strict=true
fetch-retries=5

# 3. vercel.json 설정
"installCommand": "corepack enable && pnpm install"

# 4. pnpm-lock.yaml Git 포함 확인
# .gitignore에서 제거되어 있는지 확인
```

---

## 🔗 관련 문서

- **상세 가이드**: [`error-troubleshooting-guide.md`](./error-troubleshooting-guide.md)
- **배포 가이드**: [`vercel-deployment-guide.md`](./vercel-deployment-guide.md)

