import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `user.signup` · B2C Client (템플릿 A) · route `/signup`
 *
 * 어드민의 **사용자 추가**와 같은 자원이다. 수집 항목이 어긋나면 고객이 가입할 때 넣은 값과
 * 운영자가 보는 값이 달라지므로, 항목은 어드민 사용자 폼과 같은 목록을 쓴다.
 * 등급은 여기서 고르지 않는다 — 누적 결제금액으로 자동 산정된다.
 */
export const metadata: Metadata = { title: `${COPY.auth.signupTitle} — ${CONTENT.seo.title}` };

const FIELDS = [
  { id: 'name', label: COPY.auth.name, type: 'text', autoComplete: 'name' },
  { id: 'nickname', label: COPY.auth.nickname, type: 'text', autoComplete: 'nickname' },
  { id: 'email', label: COPY.auth.email, type: 'email', autoComplete: 'username' },
  { id: 'password', label: COPY.auth.password, type: 'password', autoComplete: 'new-password' },
  { id: 'passwordConfirm', label: COPY.auth.passwordConfirm, type: 'password', autoComplete: 'new-password' },
  { id: 'phone', label: COPY.auth.phone, type: 'tel', autoComplete: 'tel' },
];

export default function UserSignupPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.auth.signupTitle} />

      <form id={SLOT.authForm} data-ssot-cid={cid('user.signup', 'SiteSignupForm')} className="flex max-w-100 flex-col gap-5">
        {FIELDS.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label htmlFor={`signup-${field.id}`} className="text-sm font-medium">
              {field.label}
            </label>
            <input
              id={`signup-${field.id}`}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
            />
          </div>
        ))}

        <div className="flex flex-col gap-3 rounded-lg bg-surface px-4 py-3">
          <label htmlFor="signup-privacy" className="flex items-center gap-2 text-sm">
            <input id="signup-privacy" name="privacy" type="checkbox" className="size-4" />
            {COPY.auth.privacyAgree}
          </label>
          <label htmlFor="signup-marketing" className="flex items-center gap-2 text-sm text-ink-muted">
            <input id="signup-marketing" name="marketing" type="checkbox" className="size-4" />
            {COPY.auth.marketing}
          </label>
          <p className="text-xs leading-relaxed text-ink-faint">
            자세한 내용은{' '}
            <a href={ROUTES.privacy} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
              {CONTENT.privacy.label}
            </a>
            에서 확인할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {COPY.auth.signupSubmit}
        </button>

        <p className="text-sm text-ink-muted">
          {COPY.auth.toLogin}{' '}
          <a href={ROUTES.login} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
            {COPY.auth.loginTitle}
          </a>
        </p>
      </form>
    </SiteShell>
  );
}
