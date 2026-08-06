'use client';

import { useState } from 'react';
import { Button, Checkbox, Field, HintInput, useToast } from '@winpilot/ui';
import { SUPPORT_CATEGORIES } from '@winpilot/store';

/** 공시 갈래. 구독은 갈래마다 따로 받는다 — 전부 받으면 읽지 않게 된다. */
const KINDS = ['정기', '수시', '공정공시', '지분'] as const;

/**
 * 공시 구독 신청.
 *
 * ## 메일 확인을 거친다
 * 넣은 주소로 확인 메일을 먼저 보낸다. 남의 주소를 넣어 두고 알림을 받게 하는 것을 막는
 * 장치이고, 확인 안 된 주소로 보내면 **스팸 신고가 쌓여 보내던 메일 전체가 막힌다.**
 *
 * ## 갈래를 고르게 한다
 * 전부 받으면 읽지 않게 되고, 읽지 않으면 정작 중요한 공시도 지나친다.
 */
export function SubscribeForm() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? undefined
    : '메일 주소를 정확히 적어 주세요.';
  const agreeError = agreed ? undefined : '개인정보 수집·이용에 동의해 주세요.';

  const submit = () => {
    setSubmitted(true);
    if (emailError || agreeError) {
      toast.error({ message: '신청하지 못했습니다.', detail: emailError ?? agreeError });
      return;
    }

    toast.success({
      message: '확인 메일을 보냈습니다.',
      detail: `${email.trim()} — 메일의 링크를 누르셔야 알림이 시작됩니다.`,
    });
    setEmail('');
    setKinds([]);
    setAgreed(false);
    setSubmitted(false);
  };

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border px-6 py-6">
      <Field
        label="메일 주소"
        htmlFor="subscribe-email"
        required
        {...(submitted && emailError ? { error: emailError } : { hint: '이 주소로 확인 메일을 보냅니다.' })}
      >
        <HintInput
          id="subscribe-email"
          type="email"
          hint="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={submitted && Boolean(emailError)}
        />
      </Field>

      <Field label="받을 공시" hint="고르지 않으면 전체를 받습니다.">
        <div className="flex flex-col gap-2">
          {KINDS.map((kind) => (
            <label key={kind} className="flex items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm">
              <Checkbox
                checked={kinds.includes(kind)}
                onChange={(checked) =>
                  setKinds((previous) => (checked ? [...previous, kind] : previous.filter((one) => one !== kind)))
                }
                label={`${kind} 공시 받기`}
              />
              {kind}
            </label>
          ))}
        </div>
      </Field>

      <Field
        label="개인정보 수집·이용 동의"
        required
        {...(submitted && agreeError
          ? { error: agreeError }
          : { hint: '공시 알림 발송에만 씁니다. 구독을 끊으면 지웁니다.' })}
      >
        <label className="flex w-fit items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm">
          <Checkbox checked={agreed} onChange={setAgreed} label="개인정보 수집·이용 동의" />
          동의합니다
        </label>
      </Field>

      <div className="flex justify-end">
        <Button onClick={submit}>구독 신청</Button>
      </div>
    </section>
  );
}

/* 문의 분류는 IR 문의 화면이 쓴다 — 여기서는 쓰지 않는다. */
void SUPPORT_CATEGORIES;
