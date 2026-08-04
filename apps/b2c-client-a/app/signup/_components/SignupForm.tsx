'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CONTENT, COPY, ROUTES, SLOT, cid, randomNickname } from '@winpilot/client-content';
import { Checkbox, useToast } from '@winpilot/ui';
import { setSignedIn } from '@/app/_components/session-store';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';

/**
 * 회원가입 폼 — **검사 → 확인 → 가입 → 완료 화면**.
 *
 * 비밀번호 확인이 어긋나는 것과 필수 동의를 빼먹는 것이 가입 실패의 대부분이다. 둘 다
 * 보내기 전에 잡아 어느 것이 문제인지 한 줄로 말한다 — "가입 실패" 만 뜨면 다시 처음부터 훑게 된다.
 *
 * 가입을 마치면 **완료 화면(`/result`)으로 옮긴다.** 토스트만 띄우고 폼에 남으면 방금 가입한
 * 사람이 같은 화면을 다시 보게 되어 가입이 된 것인지 알 수 없다.
 *
 * **이메일은 인증을 마쳐야 가입할 수 있다.** 이메일이 주문·문의 기록을 묶는 열쇠라, 오타가
 * 섞이면 답변도 영수증도 닿지 않는 계정이 만들어진다. 인증한 뒤 주소를 고치면 인증은 풀린다 —
 * 그러지 않으면 인증만 받아 놓고 다른 주소로 가입할 수 있다.
 *
 * 서버가 없으므로 인증번호는 화면에서 만들어 안내에 실어 보여 준다. 실제로는 메일로 가고,
 * 이 자리에는 발송 결과만 남는다.
 *
 * ## 어드민 연동
 * - 여기서 모으는 항목은 `b2c-admin` 사용자 > 사용자 추가(목록 안 모달)의 항목과 같다 —
 *   어긋나면 고객이 넣은 값과 운영자가 보는 값이 달라진다
 * - 닉네임 자동 생성 규칙은 store 의 `randomNickname()` 하나를 어드민도 같이 쓴다
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

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 인증번호 유효 시간(초). 짧으면 메일함을 여는 사이에 끝나고, 길면 남의 손에 들어갈 틈이 는다. */
const CODE_TTL = 180;

type VerifyState = 'idle' | 'sent' | 'done';

export function SignupForm() {
  const toast = useToast();
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>({});
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const [verify, setVerify] = useState<VerifyState>('idle');
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(0);
  /** 발송한 번호와 그때의 주소 — 주소를 고치면 인증이 풀려야 하므로 함께 들고 있는다. */
  const sent = useRef<{ code: string; email: string } | null>(null);

  useEffect(() => {
    if (verify !== 'sent' || left <= 0) return undefined;
    const timer = setInterval(() => setLeft((current) => Math.max(current - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [verify, left]);

  const set = (id: FieldId, value: string) => {
    setValues((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => ({ ...previous, [id]: '' }));

    // 인증한 주소를 고치면 인증은 무효다 — 남겨 두면 인증만 받고 다른 주소로 가입할 수 있다.
    if (id === 'email' && sent.current && value.trim() !== sent.current.email) {
      setVerify('idle');
      setCode('');
      setLeft(0);
      sent.current = null;
    }
  };

  const sendCode = () => {
    const email = (values.email ?? '').trim();
    if (!EMAIL_SHAPE.test(email)) {
      setErrors((previous) => ({ ...previous, email: '이메일 형식을 확인해 주세요.' }));
      toast.error({ message: '인증번호를 보내지 못했습니다', detail: '이메일 형식을 확인해 주세요.' });
      return;
    }

    const next = String(100000 + Math.floor(Math.random() * 900000));
    sent.current = { code: next, email };
    setVerify('sent');
    setCode('');
    setLeft(CODE_TTL);

    // 서버가 없어 메일을 보낼 수 없다 — 화면 흐름을 보이기 위해 번호를 안내에 실어 준다.
    toast.info({ message: '인증번호를 보냈습니다', detail: `${email} · 데모 번호 ${next}` });
  };

  const confirmCode = () => {
    if (!sent.current) return;

    if (left <= 0) {
      toast.error({ message: '인증하지 못했습니다', detail: '유효 시간이 지났습니다. 다시 받아 주세요.' });
      return;
    }
    if (code.trim() !== sent.current.code) {
      toast.error({ message: '인증하지 못했습니다', detail: '인증번호가 일치하지 않습니다.' });
      return;
    }

    setVerify('done');
    setLeft(0);
    toast.success({ message: '이메일을 인증했습니다', detail: sent.current.email });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    FIELDS.forEach((field) => {
      if (!(values[field.id] ?? '').trim()) next[field.id] = `${field.label}을(를) 입력해 주세요.`;
    });

    const email = (values.email ?? '').trim();
    if (email && !EMAIL_SHAPE.test(email)) next.email = '이메일 형식을 확인해 주세요.';

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

    if (verify !== 'done') {
      toast.error({ message: '가입하지 못했습니다', detail: '이메일 인증을 먼저 마쳐 주세요.' });
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
    // 가입하면 바로 로그인 상태가 된다 — 방금 만든 계정으로 다시 로그인하게 하지 않는다.
    setSignedIn(true);
    toast.success({ message: '가입이 완료되었습니다', detail: `${values.name} · ${values.email}` });
    router.push(ROUTES.resultDone('signup'));
  };

  const inputClass = (id: FieldId) =>
    `h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-sm ${
      errors[id] ? 'border-signal-danger' : 'border-border-strong'
    }`;

  const sideButton =
    'h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted hover:text-ink';

  return (
    <>
      <form
        id={SLOT.authForm}
        data-ssot-cid={cid('user.signup', 'SiteSignupForm')}
        onSubmit={submit}
        className="flex w-full flex-col gap-5"
      >
        {FIELDS.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label htmlFor={`signup-${field.id}`} className="text-sm font-medium">
              {field.label}
              <span className="ml-1 text-signal-danger">*</span>
              {field.id === 'email' && verify === 'done' && (
                <span className="ml-2 text-xs font-medium text-signal-ok">{COPY.auth.verified}</span>
              )}
            </label>

            <div className="flex w-full gap-2">
              <input
                id={`signup-${field.id}`}
                name={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.id] ?? ''}
                readOnly={field.id === 'email' && verify === 'done'}
                onChange={(event) => set(field.id, event.target.value)}
                aria-invalid={Boolean(errors[field.id])}
                className={inputClass(field.id)}
              />

              {/* 닉네임은 비워 두기 쉬운 항목이라 만들어 주는 길을 옆에 둔다. */}
              {field.id === 'nickname' && (
                <button type="button" onClick={() => set('nickname', randomNickname())} className={sideButton}>
                  {COPY.auth.nicknameShuffle}
                </button>
              )}

              {field.id === 'email' && verify !== 'done' && (
                <button type="button" onClick={sendCode} className={sideButton}>
                  {verify === 'sent' ? COPY.auth.resend : COPY.auth.verifySend}
                </button>
              )}
            </div>

            {errors[field.id] && <p className="text-xs text-signal-danger">{errors[field.id]}</p>}

            {/* 인증번호 칸은 보낸 뒤에만 나온다 — 미리 두면 무엇을 적는 자리인지 알 수 없다. */}
            {field.id === 'email' && verify === 'sent' && (
              <div className="flex w-full flex-col gap-2 rounded-lg bg-surface px-4 py-3">
                <div className="flex w-full gap-2">
                  <div className="relative flex min-w-0 flex-1 items-center">
                    <input
                      value={code}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) => setCode(event.target.value)}
                      aria-label={COPY.auth.verifyCode}
                      placeholder=" "
                      className="peer h-11 w-full rounded-lg border border-border-strong bg-canvas pl-3 pr-16 text-sm tabular-nums"
                    />
                    {/* placeholder 는 추출되지 않는다 — 겹쳐 둔 글자가 자리를 지킨다. */}
                    <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
                      {COPY.auth.verifyCode}
                    </span>
                    {/* 남은 시간은 입력란 안 오른쪽에 — 눈이 번호를 적는 곳에서 벗어나지 않는다. */}
                    <span className="pointer-events-none absolute right-3 font-mono text-xs tabular-nums text-signal-danger">
                      {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={confirmCode}
                    className="h-11 shrink-0 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-medium text-white"
                  >
                    {COPY.auth.verifyConfirm}
                  </button>
                </div>
                <p className="text-xs text-ink-muted">{COPY.auth.verifyGuide}</p>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-3 rounded-lg bg-surface px-4 py-3">
          {/* 체크 표시까지 그려진 공통 체크박스를 쓴다 — 네이티브 렌더는 OS 마다 달라 맞출 수 없다. */}
          <div className="flex items-center gap-2 text-sm">
            <Checkbox checked={privacy} onChange={setPrivacy} label={COPY.auth.privacyAgree} />
            {COPY.auth.privacyAgree}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Checkbox checked={marketing} onChange={setMarketing} label={COPY.auth.marketing} />
            {COPY.auth.marketing}
          </div>
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
          { label: COPY.auth.nickname, value: values.nickname ?? '' },
          { label: COPY.auth.email, value: values.email ?? '' },
          { label: COPY.auth.phone, value: values.phone ?? '' },
          { label: COPY.auth.marketing, value: marketing ? '동의' : '미동의' },
        ]}
      />
    </>
  );
}
