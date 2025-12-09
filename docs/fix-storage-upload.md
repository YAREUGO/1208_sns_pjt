# Storage 업로드 문제 해결 가이드

## 문제 상황

버킷이 이미 존재하는데도 이미지 업로드가 실패하는 경우, Storage RLS (Row Level Security) 정책 때문일 수 있습니다.

## 해결 방법

### 개발 환경: Storage RLS 비활성화 (권장)

Service Role로 업로드하려면 Storage RLS를 비활성화해야 합니다.

1. Supabase Dashboard → **SQL Editor**
2. **New query** 클릭
3. 다음 SQL 실행:

```sql
-- Storage RLS 비활성화 (개발 환경용)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

4. **Run** 클릭하여 실행
5. 성공 메시지 확인

### 프로덕션 환경: Service Role 정책 추가

프로덕션 환경에서는 RLS를 유지하면서 Service Role에 대한 정책을 추가합니다.

1. Supabase Dashboard → **SQL Editor**
2. 다음 SQL 실행:

```sql
-- Service Role이 업로드할 수 있도록 정책 추가
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'uploads');

-- Service Role이 파일을 조회할 수 있도록 정책 추가
CREATE POLICY "Service role can view files"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'uploads');

-- Service Role이 파일을 삭제할 수 있도록 정책 추가
CREATE POLICY "Service role can delete files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'uploads');

-- Service Role이 파일을 업데이트할 수 있도록 정책 추가
CREATE POLICY "Service role can update files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');
```

## 검증

RLS가 비활성화되었는지 확인:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

`rowsecurity`가 `false`이면 RLS가 비활성화된 것입니다.

## 다음 단계

1. 위 SQL 중 하나를 실행
2. 이미지 업로드를 다시 시도
3. 문제가 계속되면 브라우저 콘솔의 상세 에러 메시지를 확인

