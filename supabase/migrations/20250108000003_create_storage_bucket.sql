-- Storage 버킷 생성 및 RLS 정책 설정 (통합)
-- 개발 환경용: Service Role도 업로드 가능하도록 설정

-- 1. uploads 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- private bucket
  6291456,  -- 6MB 제한 (6 * 1024 * 1024)
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects;
DROP POLICY IF EXISTS "Service role can view files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update files" ON storage.objects;

-- 개발 환경: Storage RLS 비활성화 (Service Role이 자유롭게 업로드 가능)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 참고: 프로덕션 환경에서는 아래 정책들을 활성화하고 RLS를 활성화해야 합니다.
-- 현재는 개발 환경이므로 RLS를 비활성화하여 Service Role로 자유롭게 업로드 가능합니다.

