'use client';

import { useState, type FormEvent } from 'react';
import { COPY, SLOT, cid } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';

/**
 * 로그인 폼 — **검사하고, 결과를 말한다.**
 *
 * 서버가 없으므로 실제로 인증하지는 않는다. 그래도 빈 값·형식 오류를 걸러 안내까지 내는 이유는,
 * 로그인 실패가 어떤 말로 어디에 뜨는지가 이 화면에서 정해져야 하기 때문이다.
 *
 * 실패 안내는 **어느 항목이 틀렸는지 말하지 않는다** — "이메일은 맞고 비밀번호가 틀렸다" 는
 * 안내는 계정이 있는지를 알려 주는 것과 같다.
 *
 * ## 어드민 연동
 * - 어드민 로그인(`/login`)과 같은 기능이다 — 검증 규칙이 갈라지지 않게 한 쌍으로 묶여 있다
 * - 가입된 계정은 `b2c-admin` 사용자 > 사용자 목록에서 운영자가 본다
 */
export function LoginForm() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const filled = email.trim() && password.trim();
    const shaped = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!filled) {
      setInvalid(true);
      toast.error({ message: '로그인하지 못했습니다', detail: '이메일과 비밀번호를 모두 입력해 주세요.' });
      return;
    }
    if (!shaped) {
      setInvalid(true);
      toast.error({ message: '로그인하지 못했습니다', detail: '이메일 형식을 확인해 주세요.' });
      return;
    }

    setInvalid(false);
    toast.success({ message: '로그인했습니다', detail: email.trim() });
  };

  const inputClass = `h-11 w-full rounded-lg border bg-surface px-3 text-sm ${
    invalid ? 'border-signal-danger' : 'border-border-strong'
  }`;

  return (
    <form
      id={SLOT.authForm}
      data-ssot-cid={cid('user.auth', 'SiteAuthForm')}
      onSubmit={submit}
      className="flex max-w-100 flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="auth-email" className="text-sm font-medium">
          {COPY.auth.email}
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
      >
        {COPY.auth.loginSubmit}
      </button>
    </form>
  );
}
