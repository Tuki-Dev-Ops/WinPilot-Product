import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { AuthShell } from '@/app/_components/AuthShell';
import { SiteShell } from '@/app/_components/SiteShell';
import { SocialLoginButtons } from '@/app/_components/SocialLoginButtons';
import { LoginForm } from './_components/LoginForm';

/**
 * Feature: `user.auth` · B2C Client (템플릿 A) · route `/login`
 *
 * 로고 · 탭 · 제목 · 폼 · 간편 로그인 순서로 가운데에 모은다 — 배치는 `AuthShell` 이 정한다.
 *
 * ## 어드민 연동
 * - 어드민 로그인(`/login`)과 **같은 기능**이다 — 검증 규칙이 갈라지지 않게 한 쌍으로 묶여 있다
 * - 가입된 계정은 `b2c-admin` 사용자 > 사용자 목록(`/users`)에서 운영자가 본다
 * - 소셜 로그인의 키(Client ID 등)는 **사내 어드민**의 OAuth 설정에서 정한다
 */
export const metadata: Metadata = { title: `${COPY.auth.loginTitle} — ${CONTENT.seo.title}` };

export default function UserAuthPage() {
  return (
    <SiteShell>
      <AuthShell active="login" title={COPY.auth.loginTitle} description={COPY.auth.loginLead}>
        <LoginForm />
        <SocialLoginButtons label={COPY.auth.socialLabel} />
      </AuthShell>
    </SiteShell>
  );
}
