-- Clerk + Supabase 통합을 위한 RLS 정책 예제
-- 이 파일은 예제이며, 실제 사용 시 테이블 구조에 맞게 수정해야 합니다.

-- 예제: Tasks 테이블 생성 및 RLS 정책 설정
-- 참고: 개발 환경에서는 RLS를 비활성화할 수 있지만, 프로덕션에서는 반드시 활성화해야 합니다.

-- 1. Tasks 테이블 생성 (예제)
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. RLS 활성화
-- 주의: 개발 환경에서는 비활성화할 수 있지만, 프로덕션에서는 필수입니다.
-- ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 4. INSERT 정책: 사용자는 자신의 tasks만 생성 가능
-- user_id는 DEFAULT로 자동 설정되므로, WITH CHECK에서도 확인
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 5. UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 6. DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 참고사항:
-- 1. auth.jwt()->>'sub'는 Clerk 세션 토큰에서 user ID를 추출합니다.
-- 2. user_id 컬럼은 TEXT 타입으로 저장되며, Clerk user ID와 일치해야 합니다.
-- 3. DEFAULT auth.jwt()->>'sub'를 사용하면 INSERT 시 자동으로 현재 사용자 ID가 설정됩니다.
-- 4. 모든 정책은 'authenticated' 역할에만 적용되므로, 로그인한 사용자만 데이터에 접근할 수 있습니다.




