# Supabase + Next.js 통합 가이드

이 문서는 Supabase 공식 Next.js 가이드를 기반으로 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 참고 자료

- [Supabase 공식 Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase 공식 문서](https://supabase.com/docs)

## 프로젝트 구조

이 프로젝트는 Clerk 인증을 사용하면서 Supabase를 데이터베이스로 사용합니다. Supabase 공식 가이드의 패턴을 따르면서도 Clerk 통합을 지원합니다.

### Supabase 클라이언트 파일

```
lib/supabase/
├── server.ts          # Server Component용 (Supabase 공식 가이드 스타일)
├── clerk-client.ts    # Client Component용 (Clerk 통합)
├── service-role.ts    # 관리자 권한 작업용
└── client.ts         # 인증 불필요한 공개 데이터용
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 서버 사이드 전용

# Clerk (이미 설정되어 있음)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 환경 변수 가져오기

1. **Supabase Dashboard**:
   - Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys → anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project API keys → service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

2. **Clerk Dashboard**:
   - API Keys
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

## 사용 방법

### Server Components (Supabase 공식 가이드 스타일)

Supabase 공식 가이드의 패턴을 따릅니다:

```tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function MyData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("your_table")
    .select();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyData />
    </Suspense>
  );
}
```

**특징**:
- `await createClient()` 패턴 사용 (Supabase 공식 가이드)
- Clerk 세션 토큰이 자동으로 전달됨
- Server Component에서 직접 사용 가능

### Client Components

Client Component에서는 `useClerkSupabaseClient` 훅을 사용합니다:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    return data;
  }

  return <div>...</div>;
}
```

## 예제: Instruments 테이블

Supabase 공식 가이드의 예제를 따라 `instruments` 테이블을 만들어봅시다.

### 1. Supabase Dashboard에서 테이블 생성

1. Supabase Dashboard → **Table Editor**
2. **"New table"** 클릭
3. 테이블 이름: `instruments`
4. 컬럼 추가:
   - `id`: bigint, Primary Key, Auto Increment
   - `name`: text, Not Null
5. **"Save"** 클릭

### 2. 샘플 데이터 삽입

SQL Editor에서 다음 쿼리 실행:

```sql
INSERT INTO instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello');
```

### 3. RLS 정책 설정

공개 읽기 권한을 부여하는 RLS 정책 생성:

```sql
-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);
```

### 4. 페이지에서 데이터 조회

`app/instruments/page.tsx` 파일이 이미 생성되어 있습니다:

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 확인
http://localhost:3000/instruments
```

## 데이터베이스 쿼리 예제

### SELECT (조회)

```tsx
// 모든 데이터 조회
const { data, error } = await supabase
  .from('instruments')
  .select('*');

// 특정 조건으로 조회
const { data, error } = await supabase
  .from('instruments')
  .select('*')
  .eq('name', 'violin')
  .single();
```

### INSERT (삽입)

```tsx
const { data, error } = await supabase
  .from('instruments')
  .insert({ name: 'piano' })
  .select();
```

### UPDATE (수정)

```tsx
const { data, error } = await supabase
  .from('instruments')
  .update({ name: 'guitar' })
  .eq('id', 1)
  .select();
```

### DELETE (삭제)

```tsx
const { error } = await supabase
  .from('instruments')
  .delete()
  .eq('id', 1);
```

## Row Level Security (RLS)

RLS는 사용자별로 데이터 접근을 제어하는 Supabase의 보안 기능입니다.

### 기본 RLS 정책 예제

```sql
-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users can view their own data"
ON your_table
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id::text);

-- 사용자는 자신의 데이터만 생성 가능
CREATE POLICY "Users can insert their own data"
ON your_table
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id::text);
```

### Clerk 통합 시 RLS

Clerk를 사용하는 경우, `auth.jwt()->>'sub'`는 Clerk user ID를 반환합니다:

```sql
-- Clerk user ID로 데이터 필터링
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);
```

자세한 내용은 [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)를 참고하세요.

## 문제 해결

### "Unauthorized" 에러

- Clerk와 Supabase 통합이 제대로 설정되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 데이터가 조회되지 않음

- RLS 정책이 데이터 접근을 차단하고 있는지 확인
- 테이블에 데이터가 있는지 확인
- 쿼리 조건이 올바른지 확인

### 환경 변수 오류

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 확인)
- 개발 서버를 재시작했는지 확인

## 다음 단계

1. **인증 설정**: [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md) 참고
2. **Storage 사용**: 파일 업로드 및 관리
3. **Realtime**: 실시간 데이터 동기화
4. **Edge Functions**: 서버리스 함수 실행

## 참고 자료

- [Supabase 공식 Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript 클라이언트 문서](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

