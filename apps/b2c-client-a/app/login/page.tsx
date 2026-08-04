import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { LoginForm } from './_components/LoginForm';

/**
 * Feature: `user.auth` · B2C Client (템플릿 A) · route `/login`
 *
 * ## 어드민 연동
 * - 어드민 로그인(`/login`)과 **같은 기능**이다 — 검증 규칙이 갈라지지 않게 한 쌍으로 묶여 있다
 * - 가입된 계정은 `b2c-admin` 사용자 > 사용자 목록(`/users`)에서 운영자가 본다
 */
export const metadata: Metadata = { title: `${COPY.auth.loginTitle} — ${CONTENT.seo.title}` };

export default function UserAuthPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.auth.loginTitle} />

      <LoginForm />

      <p className="text-sm text-ink-muted">
        {COPY.auth.toSignup}{' '}
        <a href={ROUTES.signup} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
          {COPY.auth.signupTitle}
        </a>
      </p>
    </SiteShell>
  );
}
