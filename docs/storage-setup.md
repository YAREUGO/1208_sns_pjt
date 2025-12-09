# Storage 버킷 설정 가이드

## 문제 상황

이미지 업로드 시 "Storage 버킷 'uploads'이 존재하지 않습니다" 에러가 발생하는 경우, Storage 버킷이 생성되지 않았기 때문입니다.

## 해결 방법

### 방법 1: Supabase Dashboard 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. **New bucket** 버튼 클릭
5. 다음 정보 입력:
   - **Name**: `uploads`
   - **Public bucket**: **체크 해제** (private bucket)
   - **File size limit**: `6MB` (또는 `6291456` bytes)
   - **Allowed MIME types**: 비워두기 (모든 이미지 타입 허용)
6. **Create bucket** 클릭

### 방법 2: SQL Editor에서 실행

1. Supabase Dashboard → **SQL Editor** 메뉴
2. **New query** 클릭
3. 다음 SQL 실행:

```sql
-- uploads 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- private bucket
  6291456,  -- 6MB 제한
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456;
```

4. **Run** 클릭하여 실행
5. 성공 메시지 확인

### 방법 3: 스크립트로 확인

버킷 존재 여부를 확인하려면:

```bash
pnpm tsx scripts/create-storage-bucket.ts
```

## Storage RLS 설정 (개발 환경)

개발 환경에서는 Storage RLS를 비활성화하여 Service Role로 자유롭게 업로드할 수 있도록 합니다.

SQL Editor에서 다음 SQL 실행:

```sql
-- Storage RLS 비활성화 (개발 환경용)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## 프로덕션 환경

프로덕션 환경에서는 적절한 RLS 정책을 설정해야 합니다. 자세한 내용은 `supabase/migrations/20250108000001_fix_storage_rls.sql` 파일을 참고하세요.

## 검증

버킷이 제대로 생성되었는지 확인:

1. Supabase Dashboard → Storage
2. `uploads` 버킷이 목록에 표시되는지 확인
3. 이미지 업로드를 다시 시도

## 문제 해결

### 버킷을 생성했는데도 여전히 에러가 발생하는 경우

1. 환경 변수 확인:
   - `NEXT_PUBLIC_STORAGE_BUCKET=uploads` (기본값이므로 생략 가능)
   - `SUPABASE_SERVICE_ROLE_KEY`가 올바르게 설정되어 있는지 확인

2. 브라우저 콘솔에서 상세 에러 메시지 확인

3. 서버 로그 확인 (터미널에서 `pnpm dev` 실행 시 출력되는 로그)

