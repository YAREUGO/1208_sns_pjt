# Vercel 배포 체크리스트

## ✅ 완료된 항목

### 1. 빌드 오류 수정
- ✅ TypeScript 타입 오류 수정 (`app/api/posts/[postId]/route.ts`)
- ✅ ESLint 에러 수정 (`app/instruments/page.tsx` - 작은따옴표 이스케이프)
- ✅ 사용하지 않는 import 제거
- ✅ React Hook 의존성 배열 수정
- ✅ 중복 props 제거 (`components/post/CreatePostModal.tsx`)

### 2. 빌드 테스트
- ✅ `pnpm build` 성공 확인
- ✅ 모든 페이지 정적/동적 렌더링 확인

## 📋 Vercel 배포 전 필수 체크리스트

### 환경 변수 설정 (Vercel Dashboard)

다음 환경 변수들을 Vercel 프로젝트 설정에 추가해야 합니다:

#### Clerk 인증
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### Next.js 설정 확인

- ✅ `next.config.ts`에 Clerk 이미지 도메인 추가됨
- ✅ `next.config.ts`에 Supabase Storage 도메인 추가됨

### 데이터베이스 및 Storage 확인

#### Supabase 데이터베이스
- [ ] 마이그레이션 파일 적용 확인 (`supabase/migrations/20251208142224_create_sns_schema.sql`)
- [ ] 테이블 생성 확인:
  - [ ] `users`
  - [ ] `posts`
  - [ ] `likes`
  - [ ] `comments`
  - [ ] `follows`
- [ ] Views 생성 확인:
  - [ ] `post_stats`
  - [ ] `user_stats`
- [ ] Triggers 생성 확인:
  - [ ] `handle_updated_at`

#### Supabase Storage
- [ ] Storage 버킷 생성 확인 (`uploads` 또는 `NEXT_PUBLIC_STORAGE_BUCKET` 값)
- [ ] Storage 버킷 공개 읽기 권한 설정 확인
- [ ] Storage 업로드 정책 설정 확인

### Clerk 설정 확인

- [ ] Clerk Dashboard에서 Allowed Origins에 Vercel 도메인 추가
- [ ] Clerk Dashboard에서 Redirect URLs에 Vercel 도메인 추가

### 배포 후 테스트 항목

1. **인증 테스트**
   - [ ] 회원가입
   - [ ] 로그인
   - [ ] 로그아웃
   - [ ] 사용자 동기화 (Clerk → Supabase)

2. **게시물 기능 테스트**
   - [ ] 게시물 작성 (이미지 업로드)
   - [ ] 게시물 목록 조회
   - [ ] 게시물 상세 보기
   - [ ] 게시물 삭제

3. **좋아요 기능 테스트**
   - [ ] 좋아요 추가
   - [ ] 좋아요 취소

4. **댓글 기능 테스트**
   - [ ] 댓글 작성
   - [ ] 댓글 목록 조회
   - [ ] 댓글 삭제

5. **프로필 기능 테스트**
   - [ ] 프로필 페이지 조회
   - [ ] 프로필 게시물 그리드 표시

6. **팔로우 기능 테스트**
   - [ ] 팔로우 추가
   - [ ] 팔로우 취소

7. **반응형 테스트**
   - [ ] Desktop 레이아웃
   - [ ] Tablet 레이아웃
   - [ ] Mobile 레이아웃

## 🚀 배포 단계

1. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "chore: Vercel 배포 준비 완료"
   git push
   ```

2. **Vercel 프로젝트 연결**
   - Vercel Dashboard에서 GitHub 저장소 연결
   - 프로젝트 설정에서 환경 변수 추가

3. **배포 실행**
   - Vercel이 자동으로 배포 시작
   - 빌드 로그 확인

4. **배포 후 검증**
   - 위의 "배포 후 테스트 항목" 모두 실행
   - 에러 로그 확인 (Vercel Dashboard)

## ⚠️ 주의사항

1. **환경 변수 보안**
   - `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드 전용이므로 절대 클라이언트에 노출되지 않도록 주의
   - Vercel Dashboard에서만 설정하고 `.env` 파일은 Git에 커밋하지 않음

2. **CORS 설정**
   - Supabase Dashboard에서 Vercel 도메인을 Allowed Origins에 추가
   - Clerk Dashboard에서도 Vercel 도메인을 Allowed Origins에 추가

3. **Storage 버킷 권한**
   - 프로덕션에서는 RLS 정책을 적절히 설정해야 함
   - 현재는 개발 단계이므로 RLS가 비활성화되어 있을 수 있음

## 📝 참고 문서

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 프로덕션 가이드](https://supabase.com/docs/guides/hosting/overview)
- [Clerk 프로덕션 가이드](https://clerk.com/docs/deployments/overview)




