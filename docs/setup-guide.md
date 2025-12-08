# 기본 세팅 가이드

이 문서는 Mini Instagram SNS 프로젝트의 기본 세팅을 완료하는 방법을 안내합니다.

## 완료된 작업

### 1. Tailwind CSS Instagram 컬러 스키마 설정

`app/globals.css`에 Instagram 컬러 스키마가 추가되었습니다:

- `--instagram-blue: #0095f6` (버튼, 링크)
- `--instagram-background: #fafafa` (전체 배경)
- `--instagram-card-background: #ffffff` (카드)
- `--instagram-border: #dbdbdb` (테두리)
- `--instagram-text-primary: #262626` (본문)
- `--instagram-text-secondary: #8e8e8e` (보조)
- `--instagram-like: #ed4956` (빨간 하트)

**사용 방법**:
```tsx
<div className="bg-instagram-background text-instagram-text-primary">
  <div className="bg-instagram-card-background border-instagram-border">
    <button className="text-instagram-blue">팔로우</button>
  </div>
</div>
```

### 2. 타이포그래피 설정

Instagram 스타일의 타이포그래피가 설정되었습니다:

- 폰트 패밀리: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- 텍스트 크기 변수:
  - `--instagram-text-xs: 12px` (시간)
  - `--instagram-text-sm: 14px` (기본)
  - `--instagram-text-base: 16px` (입력창)
  - `--instagram-text-xl: 20px` (프로필)

### 3. TypeScript 타입 정의

`lib/types.ts` 파일에 모든 타입이 정의되었습니다:

**기본 타입**:
- `User`
- `Post`
- `Like`
- `Comment`
- `Follow`

**확장 타입**:
- `PostWithStats` (좋아요 수, 댓글 수 포함)
- `UserWithStats` (게시물 수, 팔로워 수, 팔로잉 수 포함)
- `PostWithUser` (게시물 + 사용자 정보 + 통계)
- `CommentWithUser` (댓글 + 사용자 정보)

**사용 예시**:
```typescript
import { PostWithUser, UserWithStats } from '@/lib/types';

async function getPosts(): Promise<PostWithUser[]> {
  // ...
}
```

### 4. 데이터베이스 마이그레이션 파일

`supabase/migrations/20251208142224_create_sns_schema.sql` 파일이 생성되었습니다.

## 수동으로 완료해야 할 작업

### 1. Supabase 데이터베이스 마이그레이션 적용

**방법 1: Supabase Dashboard 사용 (권장)**

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **SQL Editor** 메뉴 클릭
4. **New query** 클릭
5. `supabase/migrations/20251208142224_create_sns_schema.sql` 파일 내용을 복사하여 붙여넣기
6. **Run** 클릭하여 실행
7. 성공 메시지 확인

**생성되는 테이블**:
- `users`
- `posts`
- `likes`
- `comments`
- `follows`

**생성되는 Views**:
- `post_stats` (게시물 통계)
- `user_stats` (사용자 통계)

**생성되는 Triggers**:
- `set_updated_at` (posts 테이블)
- `set_updated_at` (comments 테이블)

**검증 쿼리**:
```sql
-- 테이블 존재 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows');

-- 뷰 존재 확인
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('post_stats', 'user_stats');

-- 트리거 존재 확인
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'set_updated_at';
```

### 2. Supabase Storage 버킷 생성

1. Supabase Dashboard → **Storage** 메뉴
2. **New bucket** 클릭
3. 버킷 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: **체크** (공개 읽기)
   - **File size limit**: `5MB` (PRD 요구사항)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif` (선택사항)
4. **Create bucket** 클릭

**참고**: 개발 단계에서는 Storage 정책을 나중에 설정할 수 있습니다. 현재는 RLS가 비활성화되어 있어 모든 사용자가 접근 가능합니다.

### 3. Storage 정책 설정 (선택사항, 나중에)

프로덕션 배포 전에 다음 정책을 설정하세요:

**INSERT 정책** (인증된 사용자만 업로드):
```sql
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

**SELECT 정책** (모든 사용자가 읽기 가능):
```sql
CREATE POLICY "Anyone can view posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');
```

**DELETE 정책** (본인만 삭제 가능):
```sql
CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

## 검증 체크리스트

모든 설정이 완료되었는지 확인하세요:

- [ ] `app/globals.css`에 Instagram 컬러 변수 확인
- [ ] `lib/types.ts` 파일 존재 및 타입 정의 확인
- [ ] Supabase Dashboard에서 5개 테이블 생성 확인
- [ ] Supabase Dashboard에서 2개 뷰 생성 확인
- [ ] Supabase Dashboard에서 2개 트리거 생성 확인
- [ ] Supabase Dashboard에서 `posts` 버킷 생성 확인
- [ ] TypeScript 타입 import 테스트 (에러 없음)

## 다음 단계

기본 세팅이 완료되면 다음 작업을 진행하세요:

1. 레이아웃 구조 구현 (Sidebar, Header, BottomNav)
2. 홈 피드 페이지 구현
3. 게시물 작성 기능 구현
4. 좋아요 및 댓글 기능 구현

자세한 내용은 `docs/TODO.md`를 참고하세요.

