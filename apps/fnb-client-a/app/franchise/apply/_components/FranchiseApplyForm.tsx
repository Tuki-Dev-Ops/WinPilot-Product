'use client';

import { useState } from 'react';
import { Clock, Phone } from 'lucide-react';
import { Button, Dropdown, Field, HintInput, HintTextarea, RequiredLegend, useToast } from '@winpilot/ui';
import { FNB_BRAND, FRANCHISE_BUDGETS, STORE_REGIONS } from '@winpilot/store';

/**
 * 창업 상담 신청 — **네 칸만 묻는다.**
 *
 * ## 왜 이것만 묻나
 * 이름 · 연락처 · 지역 · 예산. 첫 통화를 걸기 위해 필요한 최소이고, 그 통화에서 나머지를 다
 * 듣게 된다.
 *
 * 창업 문의 양식에 흔히 `점포 유무 · 평수 · 희망 개점일 · 자기소개` 까지 열몇 칸이 선다. 그런데
 * 여기까지 온 사람은 대부분 **아직 아무것도 안 정한 사람**이다 — 평수를 물으면 모른다고 답할 수
 * 없어서 창을 닫는다. 실제로 비는 것은 양식이 아니라 신청 건수다.
 *
 * ## 예산을 구간으로 묻는다
 * 정확한 금액을 물으면 대부분 비워 둔다. 구간이면 답이 오고, 상담 순서를 정하는 데는 구간이면
 * 충분하다. `아직 모름` 을 목록에 둔 것도 같은 이유다 — 그 답도 정보다.
 *
 * ## 지역 목록을 매장과 같은 것으로 쓴다
 * `STORE_REGIONS` 는 매장에서 뽑아낸 목록이다. 여기에 손으로 다시 적으면 두 화면의 지역이
 * 갈리고, 그러면 **어느 거르개로도 걸리지 않는 문의**가 생긴다.
 *
 * ## 처음 값을 비워 둔다
 * 지역과 예산 둘 다 `고르지 않음` 으로 시작한다. 서울이 미리 골라져 있으면 고르지 않은 사람의
 * 문의가 전부 서울로 쌓이고, 그 사실은 아무도 모른다.
 *
 * **프론트엔드 전용** — 보낸 신청은 이 화면에만 반영된다.
 */
export function FranchiseApplyForm() {
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: name.trim() ? undefined : '성함을 입력해 주세요.',
    /* 비었는지와 형식이 맞는지를 나눠 알린다 — `번호 형식이 아닙니다` 는 빈 칸에 대한 답이 아니다. */
    phone: !phone.trim()
      ? '연락받으실 번호를 입력해 주세요.'
      : /^[0-9+\-\s()]{9,20}$/.test(phone.trim())
        ? undefined
        : '연락 가능한 번호 형식으로 적어 주세요.',
    region: region ? undefined : '보고 계신 지역을 골라 주세요.',
    budget: budget ? undefined : '예산 구간을 골라 주세요.',
    agreed: agreed ? undefined : '개인정보 수집 · 이용에 동의해 주세요.',
  };
  const broken = Object.values(errors).filter(Boolean).length;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (broken > 0) {
      toast.error({
        message: '신청하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${broken}개 있습니다.`,
      });
      return;
    }

    toast.success({
      message: '상담 신청이 접수됐습니다.',
      detail: `${phone.trim()} 으로 하루 안에 연락드립니다.`,
    });
    setName('');
    setPhone('');
    setRegion('');
    setBudget('');
    setMessage('');
    setAgreed(false);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/*
        왼쪽에 창구와 걸리는 시간. 양식만 세워 두면 **언제 연락이 오는지** 모른 채 남기게 되고,
        그 사람은 다음 날 다시 신청한다.
      */}
      <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-ink-faint">바로 통화를 원하시면</p>
          <Channel icon={<Phone aria-hidden className="size-3.5" strokeWidth={1.6} />} value={FNB_BRAND.franchisePhone} />
          <Channel icon={<Clock aria-hidden className="size-3.5" strokeWidth={1.6} />} value="평일 09:00 – 18:00" />
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <p className="text-xs font-medium text-ink-faint">연락까지</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            남겨 주신 번호로 <span className="font-semibold text-ink">하루 안에</span> 연락드립니다. 첫 통화에서는
            아무것도 정하지 않습니다.
          </p>
        </div>
      </aside>

      <form
        noValidate
        onSubmit={submit}
        className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border px-6 py-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">창업 상담 신청</p>
          <RequiredLegend />
        </div>

        <Field
          label="성함"
          htmlFor="apply-name"
          required
          {...(submitted && errors.name ? { error: errors.name } : {})}
        >
          <HintInput
            id="apply-name"
            type="text"
            hint="예: 홍길동"
            value={name}
            onChange={(event) => setName(event.target.value)}
            invalid={submitted && Boolean(errors.name)}
          />
        </Field>

        <Field
          label="연락처"
          htmlFor="apply-phone"
          required
          {...(submitted && errors.phone
            ? { error: errors.phone }
            : { hint: '통화가 되는 번호로 적어 주세요. 문자로 먼저 알려 드립니다.' })}
        >
          <HintInput
            id="apply-phone"
            type="text"
            hint="예: 010-0000-0000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            invalid={submitted && Boolean(errors.phone)}
          />
        </Field>

        <Field
          label="보고 계신 지역"
          htmlFor="apply-region"
          required
          {...(submitted && errors.region
            ? { error: errors.region }
            : { hint: '정확한 자리가 없어도 됩니다. 시 · 도만 골라 주세요.' })}
        >
          <Picker
            id="apply-region"
            label="보고 계신 지역"
            value={region}
            onChange={setRegion}
            options={STORE_REGIONS}
            invalid={submitted && Boolean(errors.region)}
          />
        </Field>

        <Field
          label="예산"
          htmlFor="apply-budget"
          required
          {...(submitted && errors.budget
            ? { error: errors.budget }
            : { hint: '임차료와 권리금을 뺀 창업 비용 기준입니다. 아직 모르셔도 됩니다.' })}
        >
          <Picker
            id="apply-budget"
            label="예산"
            value={budget}
            onChange={setBudget}
            options={FRANCHISE_BUDGETS}
            invalid={submitted && Boolean(errors.budget)}
          />
        </Field>

        {/* 하고 싶은 말은 **선택**이다. 필수로 두면 쓸 말이 없는 사람이 아무거나 적고 나간다. */}
        <Field label="하고 싶은 말" htmlFor="apply-message" hint="없으셔도 됩니다. 통화에서 여쭤봅니다.">
          <HintTextarea
            id="apply-message"
            rows={4}
            hint="예: 기존에 다른 브랜드로 운영 중입니다. 업종 변경도 되나요."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>

        {/*
          동의를 **무엇에 쓰는지와 함께** 묻는다. `개인정보 처리방침에 동의합니다` 한 줄만 두면
          무엇을 얼마나 보관하는지 모른 채 누르게 되고, 그 동의는 실제로 동의가 아니다.
        */}
        <label htmlFor="apply-agree" className="flex items-start gap-3 rounded-lg bg-surface px-4 py-3.5">
          <input
            id="apply-agree"
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            aria-invalid={submitted && Boolean(errors.agreed)}
            className="mt-0.5 size-4 shrink-0 accent-octo-600"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">개인정보 수집 · 이용에 동의합니다</span>
            <span className="block text-xs leading-relaxed text-ink-muted">
              성함 · 연락처 · 지역 · 예산을 창업 상담에만 씁니다. 상담이 끝나면 6개월 뒤 지웁니다.
            </span>
            {submitted && errors.agreed && (
              <span className="mt-1 block text-xs text-signal-danger">{errors.agreed}</span>
            )}
          </span>
        </label>

        <div className="flex justify-end pt-1">
          <Button type="submit">상담 신청</Button>
        </div>
      </form>
    </div>
  );
}

/**
 * 몇 안 되는 것 중 하나 고르기 — `@winpilot/ui` 의 `Dropdown` 을 감싼다.
 *
 * ## 생 `<select>` 를 쓰지 않는 이유
 * 운영체제가 그리는 화살표는 자리도 모양도 우리가 정할 수 없고, 무엇보다 **다른 화면의 고르개와
 * 생김새가 갈린다.** 공유 조각이 이미 그 문제를 풀어 두었다.
 *
 * ## 그런데 왜 한 겹을 더 두나
 * 지역과 예산 둘이 **같은 첫 값**(`고르지 않음`)을 가져야 한다. 부르는 자리에서 각자 그 항목을
 * 앞에 붙이면 한쪽에서 빠지고, 그때 그 칸은 서울이 미리 골라진 채로 선다 — 고르지 않은 사람의
 * 답이 전부 서울로 쌓이는 것이 그렇게 생긴다.
 */
function Picker({
  id,
  label,
  value,
  onChange,
  options,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
  invalid: boolean;
}) {
  return (
    <Dropdown
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      invalid={invalid}
      options={[{ value: '', label: '고르지 않음' }, ...options.map((one) => ({ value: one, label: one }))]}
    />
  );
}

/** 창구 한 줄 — 아이콘과 값. */
function Channel({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="shrink-0 text-ink-faint">{icon}</span>
      <span className="min-w-0 font-mono tabular-nums">{value}</span>
    </p>
  );
}
