# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어의 로컬라이제이션을 제공합니다. 한국어는 `koKR` 키로 제공됩니다.

## 현재 설정

프로젝트에는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        cssLayerName: "clerk", // Tailwind CSS 4 호환성
      }}
    >
      <html lang="ko">
        {children}
      </html>
    </ClerkProvider>
  );
}
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 키 | BCP 47 태그 |
|------|-----|-------------|
| 한국어 | `koKR` | ko-KR |
| 영어 (미국) | `enUS` | en-US |
| 영어 (영국) | `enGB` | en-GB |
| 일본어 | `jaJP` | ja-JP |
| 중국어 (간체) | `zhCN` | zh-CN |
| 중국어 (번체) | `zhTW` | zh-TW |
| 프랑스어 | `frFR` | fr-FR |
| 독일어 | `deDE` | de-DE |
| 스페인어 | `esES` | es-ES |
| ... | ... | ... |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 사용 방법

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```bash
npm install @clerk/localizations
```

### 2. ClerkProvider에 적용

`ClerkProvider`에 `localization` prop을 전달합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 3. Tailwind CSS 4 호환성

Tailwind CSS 4를 사용하는 경우, `appearance` prop에 `cssLayerName`을 추가해야 합니다:

```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk",
  }}
>
  {children}
</ClerkProvider>
```

## 커스텀 한국어 메시지

기본 한국어 번역을 수정하거나 추가 메시지를 정의할 수 있습니다:

### 에러 메시지 커스터마이징

```tsx
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
    form_identifier_not_found:
      "입력하신 이메일 또는 사용자 이름을 찾을 수 없습니다.",
  },
};

<ClerkProvider localization={customKoKR}>
  {children}
</ClerkProvider>
```

### 특정 컴포넌트 메시지 커스터마이징

```tsx
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    start: {
      ...koKR.signIn.start,
      title: "환영합니다",
      subtitle: "계정에 로그인하여 계속하세요",
    },
  },
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp.start,
      title: "계정 만들기",
      subtitle: "새로운 계정을 만들어 시작하세요",
    },
  },
};
```

## 개별 컴포넌트에 적용

특정 컴포넌트에만 한국어를 적용할 수도 있습니다:

```tsx
import { SignIn } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function SignInPage() {
  return (
    <SignIn
      localization={koKR}
      routing="path"
      path="/sign-in"
    />
  );
}
```

## HTML lang 속성

`<html>` 태그의 `lang` 속성도 한국어로 설정하는 것이 좋습니다:

```tsx
<html lang="ko">
  <body>
    {/* ... */}
  </body>
</html>
```

## 주의사항

### 실험적 기능

로컬라이제이션 기능은 현재 **실험적(experimental)** 기능입니다. 예상과 다르게 동작할 수 있으므로, 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

### Account Portal

로컬라이제이션은 **Clerk 컴포넌트**에만 적용됩니다. Clerk의 호스팅된 [Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 여전히 영어로 표시됩니다.

## 테스트

한국어 로컬라이제이션이 제대로 적용되었는지 확인:

1. **로그인 모달 열기**: `SignInButton` 클릭
2. **회원가입 모달 열기**: `SignUpButton` 클릭
3. **사용자 메뉴**: `UserButton` 클릭하여 계정 관리 메뉴 확인

모든 텍스트가 한국어로 표시되어야 합니다.

## 문제 해결

### 한국어가 적용되지 않음

1. `@clerk/localizations` 패키지가 설치되어 있는지 확인
2. `koKR`이 올바르게 import되었는지 확인
3. `ClerkProvider`에 `localization={koKR}` prop이 전달되었는지 확인
4. 개발 서버를 재시작

### 일부 텍스트가 영어로 표시됨

- 로컬라이제이션은 Clerk 컴포넌트에만 적용됩니다
- Account Portal은 영어로 유지됩니다
- 커스텀 메시지가 필요한 경우 위의 커스터마이징 방법을 사용하세요

## 참고 자료

- [Clerk 공식 로컬라이제이션 가이드](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk Next.js 문서](https://clerk.com/docs/reference/nextjs/overview)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)




