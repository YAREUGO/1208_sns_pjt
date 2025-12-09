-- 개발 환경용: Storage RLS 비활성화
-- 프로덕션에서는 이 마이그레이션을 사용하지 마세요

-- Storage objects 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

