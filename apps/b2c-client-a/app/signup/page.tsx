import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { SignupForm } from './_components/SignupForm';

/**
 * Feature: `user.signup` · B2C Client (템플릿 A) · route `/signup`
 *
 * ## 어드민 연동
 * - 어드민의 **사용자 추가**(사용자 목록 안 모달)와 같은 자원이다 — 수집 항목이 어긋나면
 *   고객이 넣은 값과 운영자가 보는 값이 달라진다
 * - 등급은 여기서 고르지 않는다 — 누적 결제금액으로 자동 산정된다 (사용자 > 등급)
 */
export const metadata: Metadata = { title: `${COPY.auth.signupTitle} — ${CONTENT.seo.title}` };

export default function UserSignupPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.auth.signupTitle} />

      <SignupForm />

      <p className="text-sm text-ink-muted">
        {COPY.auth.toLogin}{' '}
        <a href={ROUTES.login} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
          {COPY.auth.loginTitle}
        </a>
      </p>
    </SiteShell>
  );
}
