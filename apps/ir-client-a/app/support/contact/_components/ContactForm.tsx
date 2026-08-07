'use client';

import { useState } from 'react';
import { Clock, Mail, Phone } from 'lucide-react';
import { Button, Field, HintInput, HintTextarea, RequiredLegend, useToast } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';

/**
 * 문의 갈래. 받는 사람이 달라 **먼저 고른다.**
 *
 * 도입·기술이 앞이다. 이 화면은 CS CENTER 아래로 옮겨 왔고, 솔루션 상세와 제품 화면의
 * `문의하기` 단추가 전부 여기로 온다 — 들어오는 문의의 대부분이 도입 검토다.
 *
 * 갈래마다 **누가 받는지**를 함께 적는다. 적어 두지 않으면 고르는 사람이 자기 문의가 어디에
 * 드는지 짐작으로 고르고, 그러면 받는 쪽에서 다시 나눠 보내게 된다.
 */
const KINDS = [
  { id: '도입 · 견적', desk: '영업' },
  { id: '기술 지원', desk: '엔지니어' },
  { id: '주주 · 투자자', desk: 'IR 담당' },
  { id: '기관 · 애널리스트', desk: 'CFO 조직' },
  { id: '언론', desk: '홍보' },
  { id: '기타', desk: '접수 후 배정' },
] as const;

/**
 * 문의 양식 — **왼쪽에 갈래, 오른쪽에 양식**.
 *
 * ## FAQ · 특허 인증과 같은 틀이다
 * 세 화면 다 "여럿 중에서 하나를 고르고, 고른 것에 맞는 것을 본다" 는 같은 일을 한다. 그래서
 * 뼈대를 맞췄다 — 왼쪽에 고르는 줄, 오른쪽에 그 결과. **CS CENTER 안을 오가는 사람이 화면마다
 * 다른 배치를 다시 익히지 않아도 된다.**
 *
 * 전에는 갈래가 양식 첫 칸의 드롭다운이었다. 그러면 어떤 갈래가 있는지 보려면 **눌러야** 하고,
 * 누가 받는지는 아예 적을 자리가 없었다.
 *
 * ## 창구를 갈래 아래에 둔다
 * 양식을 채우는 사람과 전화를 거는 사람은 다르다. 급한 쪽은 대개 전화인데, 양식이 화면을
 * 가득 채우고 있으면 번호를 찾으려고 끝까지 내려가야 한다.
 *
 * ## 예측 정보를 묻는 문의에 답하지 못한다
 * 아직 공시하지 않은 실적이나 전망을 개별적으로 알려 주는 것은 **공정공시 위반**이다. 그래서
 * 양식 아래에 그 사실을 먼저 적는다 — 답을 못 받고 기다리는 것보다 낫다.
 *
 * **프론트엔드 전용** — 보낸 문의는 이 화면에만 반영된다.
 */
export function ContactForm() {
  const toast = useToast();
  const [kind, setKind] = useState<string>(KINDS[0].id);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: name.trim() ? undefined : '이름을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : '답을 받으실 메일 주소를 정확히 적어 주세요.',
    body: body.trim().length >= 10 ? undefined : '무엇이 궁금하신지 조금만 더 적어 주세요. (10자 이상)',
  };
  const broken = Object.values(errors).filter(Boolean).length;

  const submit = () => {
    setSubmitted(true);
    if (broken > 0) {
      toast.error({ message: '보내지 못했습니다.', detail: `확인이 필요한 항목이 ${broken}개 있습니다.` });
      return;
    }

    toast.success({ message: '문의를 보냈습니다.', detail: `${kind} · ${email.trim()} 으로 답변드립니다.` });
    setName('');
    setEmail('');
    setBody('');
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* 왼쪽 — 갈래와 창구. 좁은 화면에서는 갈래가 가로로 눕는다(세로로 두면 양식이 화면 밖으로 밀린다). */}
      <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
        <div>
          <p className="mb-3 text-xs font-medium text-ink-faint">문의 갈래</p>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {KINDS.map((one) => (
              <button
                key={one.id}
                type="button"
                onClick={() => setKind(one.id)}
                aria-current={one.id === kind}
                className={`flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
                  one.id === kind ? 'bg-surface' : 'hover:bg-surface'
                }`}
              >
                <span className={`text-sm ${one.id === kind ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                  {one.id}
                </span>
                {/* 누가 받는지 — 고른 갈래에만 적는다. 여섯 줄에 다 적으면 갈래 이름이 묻힌다. */}
                {one.id === kind && <span className="text-xs text-ink-faint">{one.desk}가 받습니다</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <p className="text-xs font-medium text-ink-faint">바로 연락</p>
          <Channel icon={<Phone aria-hidden className="size-3.5" strokeWidth={1.6} />} value={IR_COMPANY.irPhone} />
          <Channel icon={<Mail aria-hidden className="size-3.5" strokeWidth={1.6} />} value={IR_COMPANY.irEmail} />
          <Channel icon={<Clock aria-hidden className="size-3.5" strokeWidth={1.6} />} value="평일 09:00 – 18:00" />
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border px-6 py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          {/* 고른 갈래를 양식 위에 한 번 더 적는다 — 왼쪽을 보고 오른쪽을 채우는 사이에 무엇을 골랐는지 잊는다. */}
          <p className="text-sm font-semibold">{kind}</p>
          <RequiredLegend />
        </div>

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
            : { hint: '도입 검토시 지금 쓰시는 시스템과 설비를 함께 적어 주시면 빠릅니다.' })}
        >
          <HintTextarea
            id="contact-body"
            rows={6}
            hint="예: 조립 라인 3개에서 생산 실적을 손으로 적고 있습니다. MES 도입 시 기간과 비용이 궁금합니다."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            invalid={submitted && Boolean(errors.body)}
          />
        </Field>

        {/* 먼저 적어 둔다. 답을 못 받고 기다리는 것보다, 왜 답할 수 없는지를 보내기 전에 아는 편이 낫다. */}
        <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
          아직 공시하지 않은 실적·전망은 개별적으로 알려 드릴 수 없습니다. 특정 투자자에게만 미리 알리는 것은
          공정공시에 어긋납니다. 급하시면 {IR_COMPANY.irPhone} 으로 전화 주세요.
        </p>

        <div className="flex justify-end">
          <Button onClick={submit}>문의 보내기</Button>
        </div>
      </section>
    </div>
  );
}

/** 왼쪽 아래의 연락 한 줄. 값이 길어도 줄을 넘기지 않게 감싼다. */
function Channel({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="shrink-0 text-ink-faint">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </p>
  );
}
