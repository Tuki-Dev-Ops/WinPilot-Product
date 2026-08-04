'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AuthField } from '@/components/domain/user/AuthField';
import { useToast } from '@winpilot/ui';
import { validateAuthField, validateAuthForm, type AuthErrors, type AuthFieldName } from '@/lib/validation/user-auth';

const FIELDS: Array<{ id: AuthFieldName; label: string; hint: string; type: string; autoComplete: string }> = [
  { id: 'email', label: '이메일', hint: '이메일을 입력해 주세요', type: 'email', autoComplete: 'username' },
  {
    id: 'password',
    label: '비밀번호',
    hint: '비밀번호를 입력해 주세요',
    type: 'password',
    autoComplete: 'current-password',
  },
];

/**
 * 검증 규칙은 `@/lib/validation/user-auth` 를 두 뷰가 공유한다.
 *
 * 흐름은 docs/spec/03-flow.md §3.3 을 따른다:
 *   실패 → 필드 인라인 에러 + **첫 오류 필드로 포커스 이동** · 입력값 보존
 * 데모 단계라 통과 시 인증 없이 대시보드로 이동한다.
 */
export function AdminUserAuthForm() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const readValues = (form: HTMLFormElement) => {
    const data = new FormData(form);
    return {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const form = event.currentTarget;
    const found = validateAuthForm(readValues(form));
    setErrors(found);

    const firstInvalid = FIELDS.find((field) => found[field.id]);
    if (firstInvalid) {
      form.querySelector<HTMLInputElement>(`#${firstInvalid.id}`)?.focus();
      toast.error({ message: '로그인하지 못했습니다.', detail: found[firstInvalid.id] });
      return;
    }

    toast.success('로그인되었습니다.');
    router.push('/');
  };

  // 한 번 제출한 뒤에는 입력하는 즉시 다시 검사한다 — 고친 것을 바로 알려주기 위해.
  const handleChange = (name: AuthFieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!submitted) return;
    const message = validateAuthField(name, event.target.value);
    setErrors((previous) => {
      const next = { ...previous };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  return (
    <form ref={formRef} className="mt-6 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {FIELDS.map((field) => (
        <AuthField
          key={field.id}
          id={field.id}
          label={field.label}
          hint={field.hint}
          type={field.type}
          autoComplete={field.autoComplete}
          {...(errors[field.id] ? { error: errors[field.id] } : {})}
          onChange={handleChange(field.id)}
        />
      ))}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="size-4 shrink-0 appearance-none rounded-xs border border-border-strong bg-surface"
          />
          <label htmlFor="remember" className="text-sm text-ink-muted">
            로그인 상태 유지
          </label>
        </div>
        <a href="#reset" className="text-sm text-brand-700 dark:text-brand-300">
          비밀번호 찾기
        </a>
      </div>

      <button
        type="submit"
        className="mt-1 h-11 w-full rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
      >
        로그인
      </button>
    </form>
  );
}
