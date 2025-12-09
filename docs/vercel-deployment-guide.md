# Vercel 배포 가이드

## 현재 상태

✅ **프로젝트 연결 완료**: GitHub 저장소가 Vercel에 연결되었습니다.

- 프로젝트 URL: https://vercel.com/kim-dis-projects/1208_sns_pjt
- GitHub 저장소: https://github.com/YAREUGO/1208_sns_pjt

## 배포 방법

### 방법 1: GitHub 자동 배포 (권장)

1. **Vercel Dashboard에서 환경 변수 설정**:

   - https://vercel.com/kim-dis-projects/1208_sns_pjt/settings/environment-variables
   - 아래 환경 변수들을 추가하세요

2. **환경 변수 추가 후**:
   - GitHub에 푸시하면 자동으로 배포가 시작됩니다
   - 또는 Vercel Dashboard에서 "Redeploy" 버튼 클릭

### 방법 2: Vercel CLI 배포

```bash
# 환경 변수 설정 후
vercel --prod
```

## 필수 환경 변수

⚠️ **중요**: 아래는 환경 변수 **이름** 목록입니다. 실제 **값**은 `.env` 파일에서 복사해서 사용하세요!

다음 환경 변수들을 Vercel Dashboard → Settings → Environment Variables에 추가하세요:

### Clerk 인증

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - `.env` 파일의 실제 값 사용
- `CLERK_SECRET_KEY` - `.env` 파일의 실제 값 사용
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - 값: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` - 값: `/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` - 값: `/`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - `.env` 파일의 실제 값 사용
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - `.env` 파일의 실제 값 사용
- `SUPABASE_SERVICE_ROLE_KEY` - `.env` 파일의 실제 값 사용 (⚠️ 민감한 정보)
- `NEXT_PUBLIC_STORAGE_BUCKET` - 값: `uploads`

### 선택사항

- `NEXT_PUBLIC_APP_URL` - 배포 후 Vercel에서 제공하는 URL 사용

## 환경 변수 설정 방법

1. **로컬 `.env` 파일 확인**:

   - 프로젝트 루트의 `.env` 또는 `.env.local` 파일을 엽니다
   - ⚠️ **절대 이 파일을 깃허브에 올리지 마세요!** (이미 `.gitignore`에 포함되어 있습니다)

2. **Vercel Dashboard 접속**:

   - https://vercel.com/kim-dis-projects/1208_sns_pjt
   - Settings → Environment Variables 클릭

3. **각 환경 변수를 추가**:

   - Key: 환경 변수 이름 (예: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - Value: `.env` 파일에서 복사한 **실제 값** (예시 값이 아닌 실제 키!)
   - Environment: Production, Preview, Development 모두 선택
   - Save 클릭

4. **보안 확인**:
   - ✅ 실제 API 키 값은 `.env` 파일에만 있습니다
   - ✅ `.env` 파일은 `.gitignore`에 포함되어 깃허브에 올라가지 않습니다
   - ✅ 이 문서에는 환경 변수 이름만 나열되어 있습니다

## 배포 확인

환경 변수 설정 후:

1. Vercel Dashboard → Deployments 탭에서 배포 상태 확인
2. 또는 GitHub에 새로운 커밋을 푸시하면 자동 배포 시작
3. 배포 완료 후 Production URL로 접속하여 테스트

## 문제 해결

### 빌드 에러 발생 시

- Vercel Dashboard → Deployments → 실패한 배포 → Logs 확인
- 로컬에서 `pnpm build` 실행하여 빌드 에러 확인
- **📖 상세한 에러 해결 가이드**: [`docs/error-troubleshooting-guide.md`](./error-troubleshooting-guide.md) 참고

### 환경 변수 관련 에러

- 모든 필수 환경 변수가 설정되었는지 확인
- 환경 변수 이름이 정확한지 확인 (대소문자 구분)
- Production, Preview, Development 모두에 설정되었는지 확인

### 자주 발생하는 에러

자세한 해결 방법은 **[에러 해결 가이드](./error-troubleshooting-guide.md)**를 참고하세요:

- ✅ Next.js 15 클라이언트 참조 매니페스트 에러
- ✅ pnpm 10.x 호환성 문제
- ✅ Clerk 환경 변수 누락 에러

## 참고 링크

- 프로젝트 대시보드: https://vercel.com/kim-dis-projects/1208_sns_pjt
- 배포 인스펙트: https://vercel.com/kim-dis-projects/1208_sns_pjt/Ado2p1YJJGeUmmYtigK6AQ94xuES
