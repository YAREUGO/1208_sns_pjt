# Clerk + Supabase 통합 가이드

이 문서는 2025년 최신 모범 사례를 기반으로 Clerk와 Supabase를 통합하는 방법을 설명합니다.

## 개요

2025년 4월 1일부터 Clerk의 Supabase JWT 템플릿이 deprecated되었으며, **네이티브 Supabase 통합**이 권장됩니다.

### 주요 변경사항

- ❌ **JWT 템플릿 불필요**: 더 이상 Clerk Dashboard에서 JWT 템플릿을 설정할 필요가 없습니다
- ✅ **네이티브 통합**: Clerk를 Supabase의 third-party auth provider로 직접 설정
- ✅ **자동 토큰 검증**: Supabase가 Clerk 세션 토큰을 자동으로 검증
- ✅ **간편한 설정**: JWT secret key를 Clerk와 공유할 필요 없음

## 설정 단계

### 1. Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. **Setup** → **Supabase** 메뉴로 이동
3. **"Activate Supabase integration"** 클릭
4. 표시된 **Clerk domain**을 복사 (예: `https://your-app-12.clerk.accounts.dev`)

### 2. Supabase에서 Clerk를 Third-Party Auth Provider로 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 → **Authentication** → **Providers** 메뉴
3. 페이지 하단의 **"Third-Party Auth"** 섹션으로 스크롤
4. **"Add Provider"** 클릭
5. **"Clerk"** 선택
6. 앞서 복사한 **Clerk domain**을 입력 (예: `https://your-app-12.clerk.accounts.dev`)
7. **"Save"** 클릭

> **참고**: Clerk Dashboard의 Supabase 통합 페이지에서 제공하는 정확한 설정 방법을 따르세요.

## 코드 구현

### 클라이언트 사이드 (Client Components)

`lib/supabase/clerk-client.ts` 파일을 사용합니다:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from('tasks')
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

**구현 세부사항**:
- `useSession()` 훅을 사용하여 Clerk 세션 토큰 가져오기
- `session?.getToken()`으로 현재 세션 토큰 반환
- `useMemo`를 사용하여 클라이언트 인스턴스 최적화

### 서버 사이드 (Server Components & Server Actions)

`lib/supabase/server.ts` 파일을 사용합니다:

```tsx
// Server Component 예제
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return (
    <div>
      {data?.map((task) => (
        <p key={task.id}>{task.name}</p>
      ))}
    </div>
  );
}
```

```ts
// Server Action 예제
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });
  
  if (error) {
    throw new Error('Failed to add task');
  }
  
  return data;
}
```

**구현 세부사항**:
- `auth().getToken()`으로 서버 사이드에서 Clerk 세션 토큰 가져오기
- 각 요청마다 새로운 클라이언트 인스턴스 생성 (서버 사이드 특성)

## Row Level Security (RLS) 정책 설정

Clerk와 Supabase 통합 시, RLS 정책에서 `auth.jwt()->>'sub'`를 사용하여 Clerk user ID를 확인합니다.

### 예제: Tasks 테이블

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);
```

### RLS 정책 설명

- `auth.jwt()->>'sub'`: Clerk 세션 토큰에서 user ID 추출
- `user_id::text`: 테이블의 user_id 컬럼과 비교
- `TO authenticated`: 인증된 사용자에게만 적용
- `USING`: SELECT, UPDATE, DELETE 시 조건
- `WITH CHECK`: INSERT, UPDATE 시 조건

## 환경 변수

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 서버 사이드 전용
```

## 파일 구조

프로젝트의 Supabase 클라이언트 파일 구조:

```
lib/supabase/
├── clerk-client.ts    # Client Component용 (useClerkSupabaseClient hook)
├── server.ts          # Server Component/Server Action용 (createClerkSupabaseClient)
├── service-role.ts    # 관리자 권한 작업용 (RLS 우회)
└── client.ts          # 인증 불필요한 공개 데이터용 (anon key만 사용)
```

## 테스트

통합이 제대로 작동하는지 확인:

1. **로그인 상태 확인**: Clerk로 로그인
2. **데이터 조회**: 자신의 데이터만 조회되는지 확인
3. **데이터 생성**: 새 데이터가 올바른 `user_id`로 생성되는지 확인
4. **다른 사용자 데이터 접근 불가**: 다른 사용자의 데이터는 조회되지 않는지 확인

## 문제 해결

### "Unauthorized" 에러

- Clerk와 Supabase 통합이 제대로 설정되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- `auth.jwt()->>'sub'`가 올바른 Clerk user ID를 반환하는지 확인

### 토큰 관련 에러

- Clerk 세션이 유효한지 확인 (`useSession()` 또는 `auth()` 사용)
- Supabase Dashboard에서 Clerk provider 설정 확인

## 참고 자료

- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)




