'use client';

import { useState, type FormEvent } from 'react';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';

/**
 * 회원가입 폼 — **검사 → 확인 → 가입 → 안내**.
 *
 * 비밀번호 확인이 어긋나는 것과 필수 동의를 빼먹는 것이 가입 실패의 대부분이다. 둘 다
 * 보내기 전에 잡아 어느 것이 문제인지 한 줄로 말한다 — "가입 실패" 만 뜨면 다시 처음부터 훑게 된다.
 *
 * ## 어드민 연동
 * - 여기서 모으는 항목은 `b2c-admin` 사용자 > 사용자 추가(목록 안 모달)의 항목과 같다 —
 *   어긋나면 고객이 넣은 값과 운영자가 보는 값이 달라진다
 * - **등급은 고르지 않는다** — 누적 결제금액으로 자동 산정된다 (사용자 > 등급 `/users/grades`)
 * - 마케팅 동의 ← 사용자 목록의 **수신 동의** 열로 이어진다
 */
type FieldId = 'name' | 'nickname' | 'email' | 'password' | 'passwordConfirm' | 'phone';

const FIELDS: Array<{ id: FieldId; label: string; type: string; autoComplete: string }> = [
  { id: 'name', label: COPY.auth.name, type: 'text', autoComplete: 'name' },
  { id: 'nickname', label: COPY.auth.nickname, type: 'text', autoComplete: 'nickname' },
  { id: 'email', label: COPY.auth.email, type: 'email', autoComplete: 'username' },
  { id: 'password', label: COPY.auth.password, type: 'password', autoComplete: 'new-password' },
  { id: 'passwordConfirm', label: COPY.auth.passwordConfirm, type: 'password', autoComplete: 'new-password' },
  { id: 'phone', label: COPY.auth.phone, type: 'tel', autoComplete: 'tel' },
];

export function SignupForm() {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const set = (id: FieldId, value: string) => {
    setValues((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => ({ ...previous, [id]: '' }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    FIELDS.forEach((field) => {
      if (!(values[field.id] ?? '').trim()) next[field.id] = `${field.label}을(를) 입력해 주세요.`;
    });

    const email = (values.email ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '이메일 형식을 확인해 주세요.';

    const password = values.password ?? '';
    if (password && password.length < 8) next.password = '비밀번호는 8자 이상이어야 합니다.';
    if (password && values.passwordConfirm && password !== values.passwordConfirm) {
      next.passwordConfirm = '비밀번호가 서로 다릅니다.';
    }

    setErrors(next);

    const failed = Object.values(next);
    if (failed.length > 0) {
      toast.error({ message: '가입하지 못했습니다', detail: `${failed.length}개 항목을 확인해 주세요 — ${failed[0]}` });
      return;
    }

    if (!privacy) {
      toast.error({ message: '가입하지 못했습니다', detail: `${COPY.auth.privacyAgree}가 필요합니다.` });
      return;
    }

    setConfirming(true);
  };

  const signup = () => {
    setConfirming(false);
    toast.success({ message: '가입이 완료되었습니다', detail: `${values.name} · ${values.email}` });
  };

  return (
    <>
      <form
        id={SLOT.authForm}
        data-ssot-cid={cid('user.signup', 'SiteSignupForm')}
        onSubmit={submit}
        className="flex max-w-100 flex-col gap-5"
      >
        {FIELDS.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label htmlFor={`signup-${field.id}`} className="text-sm font-medium">
              {field.label}
              <span className="ml-1 text-signal-danger">*</span>
            </label>
            <input
              id={`signup-${field.id}`}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              value={values[field.id] ?? ''}
              onChange={(event) => set(field.id, event.target.value)}
              aria-invalid={Boolean(errors[field.id])}
              className={`h-11 w-full rounded-lg border bg-surface px-3 text-sm ${
                errors[field.id] ? 'border-signal-danger' : 'border-border-strong'
              }`}
            />
            {errors[field.id] && <p className="text-xs text-signal-danger">{errors[field.id]}</p>}
          </div>
        ))}

        <div className="flex flex-col gap-3 rounded-lg bg-surface px-4 py-3">
          {/* 체크박스 그림은 브라우저마다 달라 추출이 어긋나므로 직접 그린다. */}
          <label htmlFor="signup-privacy" className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              id="signup-privacy"
              name="privacy"
              type="checkbox"
              checked={privacy}
              onChange={(event) => setPrivacy(event.target.checked)}
              className="size-4 shrink-0 appearance-none rounded border border-border-strong bg-canvas checked:border-brand-500 checked:bg-brand-500"
            />
            {COPY.auth.privacyAgree}
          </label>
          <label htmlFor="signup-marketing" className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
            <input
              id="signup-marketing"
              name="marketing"
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="size-4 shrink-0 appearance-none rounded border border-border-strong bg-canvas checked:border-brand-500 checked:bg-brand-500"
            />
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
          type="submit"
          className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {COPY.auth.signupSubmit}
        </button>
      </form>

      <ConfirmDialog
        open={confirming}
        title="이 내용으로 가입할까요?"
        description="가입 후 이름과 이메일은 고객센터를 통해서만 바꿀 수 있습니다."
        confirmLabel={COPY.auth.signupSubmit}
        tone="brand"
        onConfirm={signup}
        onClose={() => setConfirming(false)}
        summary={[
          { label: COPY.auth.name, value: values.name ?? '' },
          { label: COPY.auth.email, value: values.email ?? '' },
          { label: COPY.auth.phone, value: values.phone ?? '' },
          { label: COPY.auth.marketing, value: marketing ? '동의' : '미동의' },
        ]}
      />
    </>
  );
}
