'use client';

import { useState } from 'react';
import { Button, Dropdown, Field, HintInput, HintTextarea, RequiredLegend, useToast } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';

/** 문의 갈래. 받는 사람이 달라 첫 칸에서 가른다. */
const KINDS = ['주주 문의', '기관 · 애널리스트', '언론', '기타'] as const;

/**
 * IR 문의 양식.
 *
 * ## 갈래를 먼저 고르게 한다
 * 받는 사람이 다르다 — 주주 문의는 IR 담당이, 기관·애널리스트는 CFO 조직이, 언론은 홍보가
 * 받는다. 갈래가 없으면 한 사람이 전부 읽고 다시 나눠 보내게 되고, 그 하루가 그대로 늦어진다.
 *
 * ## 예측 정보를 묻는 문의에 답하지 못한다
 * 아직 공시하지 않은 실적이나 전망을 개별적으로 알려 주는 것은 **공정공시 위반**이다. 그래서
 * 양식 아래에 그 사실을 먼저 적는다 — 답을 못 받고 기다리는 것보다 낫다.
 *
 * **프론트엔드 전용** — 보낸 문의는 이 화면에만 반영된다.
 */
export function ContactForm() {
  const toast = useToast();
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: name.trim() ? undefined : '이름을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : '답을 받으실 메일 주소를 정확히 적어 주세요.',
    body:
      body.trim().length >= 10
        ? undefined
        : '무엇이 궁금하신지 조금만 더 적어 주세요. (10자 이상)',
  };
  const broken = Object.values(errors).filter(Boolean).length;

  const submit = () => {
    setSubmitted(true);
    if (broken > 0) {
      toast.error({ message: '보내지 못했습니다.', detail: `확인이 필요한 항목이 ${broken}개 있습니다.` });
      return;
    }

    toast.success({
      message: '문의를 보냈습니다.',
      detail: `${kind} · ${email.trim()} 으로 답변드립니다.`,
    });
    setName('');
    setEmail('');
    setBody('');
    setSubmitted(false);
  };

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border px-6 py-6">
      <RequiredLegend />

      <Field label="문의 갈래" htmlFor="contact-kind" hint="받는 사람이 달라 먼저 고릅니다.">
        <Dropdown
          id="contact-kind"
          label="갈래 선택"
          options={KINDS.map((one) => ({ value: one, label: one }))}
          value={kind}
          onChange={setKind}
        />
      </Field>

      <Field
        label="이름"
        htmlFor="contact-name"
        required
        {...(submitted && errors.name ? { error: errors.name } : { hint: '기관이시면 기관명을 함께 적어 주세요.' })}
      >
        <HintInput
          id="contact-name"
          type="text"
          hint="예: 홍길동 / 000자산운용 홍길동"
          value={name}
          onChange={(event) => setName(event.target.value)}
          invalid={submitted && Boolean(errors.name)}
        />
      </Field>

      <Field
        label="메일 주소"
        htmlFor="contact-email"
        required
        {...(submitted && errors.email ? { error: errors.email } : { hint: '이 주소로 답변드립니다.' })}
      >
        <HintInput
          id="contact-email"
          type="email"
          hint="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={submitted && Boolean(errors.email)}
        />
      </Field>

      <Field
        label="문의 내용"
        htmlFor="contact-body"
        required
        {...(submitted && errors.body
          ? { error: errors.body }
          : { hint: '공시된 자료에 대한 것이면 어느 자료인지 함께 적어 주시면 빠릅니다.' })}
      >
        <HintTextarea
          id="contact-body"
          rows={6}
          hint="예: 2026년 반기보고서의 부문별 매출 기준이 궁금합니다."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          invalid={submitted && Boolean(errors.body)}
        />
      </Field>

      {/*
        먼저 적어 둔다. 답을 못 받고 기다리는 것보다, 왜 답할 수 없는지를 보내기 전에 아는 편이 낫다.
      */}
      <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
        아직 공시하지 않은 실적·전망은 개별적으로 알려 드릴 수 없습니다. 특정 투자자에게만 미리 알리는 것은
        공정공시에 어긋납니다. 급하시면 {IR_COMPANY.irPhone} 으로 전화 주세요.
      </p>

      <div className="flex justify-end">
        <Button onClick={submit}>문의 보내기</Button>
      </div>
    </section>
  );
}
