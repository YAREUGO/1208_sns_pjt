-- Storage RLS 정책 수정
-- Service Role도 업로드할 수 있도록 정책 추가

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- INSERT: 인증된 사용자 또는 service_role이 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- Service Role은 모든 업로드 허용
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'uploads');

-- SELECT: 인증된 사용자 또는 service_role이 조회 가능
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- Service Role은 모든 파일 조회 가능
CREATE POLICY "Service role can view files"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'uploads');

-- DELETE: 인증된 사용자 또는 service_role이 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- Service Role은 모든 파일 삭제 가능
CREATE POLICY "Service role can delete files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'uploads');

-- UPDATE: 인증된 사용자 또는 service_role이 업데이트 가능
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- Service Role은 모든 파일 업데이트 가능
CREATE POLICY "Service role can update files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

