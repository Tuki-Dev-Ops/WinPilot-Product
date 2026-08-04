import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `user.auth` · B2C Client (템플릿 A) · route `/login`
 *
 * 어드민 로그인과 **같은 기능**이다 — 검증 규칙이 갈라지지 않게 기능 레지스트리에서 한 쌍으로 묶여 있다.
 */
export const metadata: Metadata = { title: `${COPY.auth.loginTitle} — ${CONTENT.seo.title}` };

export default function UserAuthPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.auth.loginTitle} />

      <form id={SLOT.authForm} data-ssot-cid={cid('user.auth', 'SiteAuthForm')} className="flex max-w-100 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="auth-email" className="text-sm font-medium">
            {COPY.auth.email}
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="username"
            className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="auth-password" className="text-sm font-medium">
            {COPY.auth.password}
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
          />
        </div>

        <button
          type="button"
          className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {COPY.auth.loginSubmit}
        </button>

        <p className="text-sm text-ink-muted">
          {COPY.auth.toSignup}{' '}
          <a href={ROUTES.signup} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
            {COPY.auth.signupTitle}
          </a>
        </p>
      </form>
    </SiteShell>
  );
}
