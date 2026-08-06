'use client';

import { useEffect, useState } from 'react';
import { Button, Checkbox, Dropdown, Field, HintInput, Modal, RequiredLegend } from '@winpilot/ui';
import { isDateString } from '@/lib/validation/content-record';

export type CouponFormInput = {
  name: string;
  kind: '정률' | '정액';
  /** 정률이면 %, 정액이면 원 */
  value: string;
  /** 정률 쿠폰의 최대 할인 금액. 비우면 제한 없음 */
  maxDiscount: string;
  /** 이 금액 이상 살 때만. 비우면 제한 없음 */
  minAmount: string;
  startAt: string;
  endAt: string;
  /** 비우면 누구나 받을 수 있는 쿠폰 */
  ownerEmail: string;
};

export type CouponFormErrors = Partial<Record<keyof CouponFormInput, string>>;

const EMPTY: CouponFormInput = {
  name: '',
  kind: '정률',
  value: '',
  maxDiscount: '',
  minAmount: '',
  startAt: '',
  endAt: '',
  ownerEmail: '',
};

const digits = (value: string) => value.replace(/[\s,]/g, '');
const isNumber = (value: string) => /^\d+$/.test(digits(value));

/**
 * 쿠폰 등록 검증.
 *
 * **정률과 정액은 받는 값이 다르다.** 정률에는 최대 할인 한도가 있고 정액에는 없다 —
 * 정액 쿠폰에 한도를 두면 "3천원 할인, 최대 2천원" 같은 앞뒤가 맞지 않는 쿠폰이 만들어진다.
 * 그래서 방식에 따라 검사도 갈린다.
 */
export function validateCoupon(input: CouponFormInput): CouponFormErrors {
  const errors: CouponFormErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = '쿠폰명을 입력해 주세요.';
  else if (name.length > 40) errors.name = '쿠폰명은 40자 이하로 입력해 주세요.';

  const value = digits(input.value);
  if (!value) {
    errors.value = input.kind === '정률' ? '할인율을 입력해 주세요.' : '할인 금액을 입력해 주세요.';
  } else if (!isNumber(value)) {
    errors.value = '숫자만 입력해 주세요.';
  } else if (input.kind === '정률') {
    const rate = Number(value);
    // 0% 쿠폰은 아무것도 깎지 않고, 100% 를 넘으면 돈을 돌려주는 쿠폰이 된다.
    if (rate < 1 || rate > 100) errors.value = '할인율은 1 이상 100 이하로 입력해 주세요.';
  } else if (Number(value) < 1) {
    errors.value = '할인 금액은 1원 이상이어야 합니다.';
  }

  // 최대 한도는 정률에만 뜻이 있다.
  if (input.kind === '정률' && input.maxDiscount.trim()) {
    if (!isNumber(input.maxDiscount)) errors.maxDiscount = '숫자만 입력해 주세요.';
    else if (Number(digits(input.maxDiscount)) < 1) errors.maxDiscount = '1원 이상으로 입력해 주세요.';
  }

  if (input.minAmount.trim() && !isNumber(input.minAmount)) {
    errors.minAmount = '숫자만 입력해 주세요.';
  }

  if (!input.startAt.trim()) errors.startAt = '시작일을 입력해 주세요.';
  else if (!isDateString(input.startAt)) errors.startAt = '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.';

  if (!input.endAt.trim()) errors.endAt = '종료일을 입력해 주세요.';
  else if (!isDateString(input.endAt)) errors.endAt = '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.';

  // 두 날짜가 다 제대로 들어왔을 때만 앞뒤를 본다 — 형식이 틀린 값끼리 비교하면 엉뚱한 말이 나온다.
  if (!errors.startAt && !errors.endAt && input.endAt.trim() < input.startAt.trim()) {
    errors.endAt = '종료일이 시작일보다 빠릅니다.';
  }

  if (input.ownerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.ownerEmail.trim())) {
    errors.ownerEmail = '이메일 형식이 올바르지 않습니다.';
  }

  return errors;
}

export type CouponFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CouponFormInput) => void;
};

/**
 * 쿠폰 등록 창.
 *
 * ## 왜 화면이 아니라 모달인가
 * `docs/path.md` §3.2 가 쿠폰을 **목록 한 장으로 끝나는 자원**으로 적어 두었다. 받는 값이
 * 여덟 개뿐이고 이미지도 본문도 없어서 모달 폭으로 감당된다. 전에는 등록 단추를 눌러도
 * `쿠폰 등록 화면은 준비 중입니다` 토스트만 떴다.
 *
 * ## 한 줄에 한 칸
 * 금액과 기간이 섞여 있어 나란히 두면 어느 칸이 무슨 돈인지 헷갈린다 — 최소 주문 금액과
 * 최대 할인 금액은 특히 그렇다.
 *
 * ## 정률·정액에 따라 칸이 바뀐다
 * 최대 할인 한도는 정률에만 있다. 정액 쿠폰에 한도를 두면 "3천원 할인, 최대 2천원" 같은
 * 앞뒤가 맞지 않는 쿠폰이 만들어진다.
 */
export function CouponFormModal({ open, onClose, onSubmit }: CouponFormModalProps) {
  const [value, setValue] = useState<CouponFormInput>(EMPTY);
  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(EMPTY);
    setErrors({});
    setSubmitted(false);
  }, [open]);

  const update = <K extends keyof CouponFormInput>(field: K, next: CouponFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateCoupon(draft));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validateCoupon(value);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(value);
  };

  const rate = value.kind === '정률';

  return (
    <Modal
      open={open}
      title="쿠폰 등록"
      description="등록하면 고객 화면의 쿠폰함에 바로 반영됩니다. 이미 나간 쿠폰의 조건은 나중에 바꾸지 않습니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={submit}>등록</Button>
        </>
      }
    >
      {/* 한 줄에 한 칸 — 금액이 여럿이라 나란히 두면 어느 돈인지 헷갈린다. */}
      <div className="flex flex-col gap-5">
        <RequiredLegend />

        <Field
          label="쿠폰명"
          htmlFor="coupon-name"
          required
          {...(errors.name ? { error: errors.name } : { hint: '고객 화면 쿠폰함에 그대로 보입니다.' })}
        >
          <HintInput
            id="coupon-name"
            type="text"
            hint="예: 첫 구매 10% 할인"
            value={value.name}
            aria-required
            onChange={(event) => update('name', event.target.value)}
            invalid={Boolean(errors.name)}
            {...(errors.name ? { 'aria-describedby': 'coupon-name-error' } : {})}
          />
        </Field>

        <Field label="할인 방식" required hint="정률은 비율로, 정액은 금액으로 깎습니다.">
          <Dropdown
            id="coupon-kind"
            label="할인 방식 선택"
            options={[
              { value: '정률', label: '정률 (%)' },
              { value: '정액', label: '정액 (원)' },
            ]}
            value={value.kind}
            onChange={(next) => update('kind', next as CouponFormInput['kind'])}
          />
        </Field>

        <Field
          label={rate ? '할인율 (%)' : '할인 금액 (원)'}
          htmlFor="coupon-value"
          required
          {...(errors.value
            ? { error: errors.value }
            : { hint: rate ? '1 이상 100 이하로 입력합니다.' : '원 단위로 입력합니다.' })}
        >
          <HintInput
            id="coupon-value"
            type="text"
            inputMode="numeric"
            hint={rate ? '예: 10' : '예: 3000'}
            value={value.value}
            aria-required
            onChange={(event) => update('value', event.target.value)}
            invalid={Boolean(errors.value)}
            {...(errors.value ? { 'aria-describedby': 'coupon-value-error' } : {})}
          />
        </Field>

        {/* 최대 한도는 정률에만 뜻이 있다 — 정액에서는 칸 자체를 그리지 않는다. */}
        {rate && (
          <Field
            label="최대 할인 금액 (원)"
            htmlFor="coupon-maxDiscount"
            {...(errors.maxDiscount
              ? { error: errors.maxDiscount }
              : { hint: '비우면 한도 없이 비율대로 깎습니다.' })}
          >
            <HintInput
              id="coupon-maxDiscount"
              type="text"
              inputMode="numeric"
              hint="예: 5000"
              value={value.maxDiscount}
              onChange={(event) => update('maxDiscount', event.target.value)}
              invalid={Boolean(errors.maxDiscount)}
              {...(errors.maxDiscount ? { 'aria-describedby': 'coupon-maxDiscount-error' } : {})}
            />
          </Field>
        )}

        <Field
          label="최소 주문 금액 (원)"
          htmlFor="coupon-minAmount"
          {...(errors.minAmount
            ? { error: errors.minAmount }
            : { hint: '이 금액 이상 살 때만 쓸 수 있습니다. 비우면 제한이 없습니다.' })}
        >
          <HintInput
            id="coupon-minAmount"
            type="text"
            inputMode="numeric"
            hint="예: 30000"
            value={value.minAmount}
            onChange={(event) => update('minAmount', event.target.value)}
            invalid={Boolean(errors.minAmount)}
            {...(errors.minAmount ? { 'aria-describedby': 'coupon-minAmount-error' } : {})}
          />
        </Field>

        <Field
          label="사용 시작일"
          htmlFor="coupon-startAt"
          required
          {...(errors.startAt ? { error: errors.startAt } : { hint: 'YYYY-MM-DD' })}
        >
          <HintInput
            id="coupon-startAt"
            type="text"
            hint="2026-08-01"
            value={value.startAt}
            aria-required
            onChange={(event) => update('startAt', event.target.value)}
            invalid={Boolean(errors.startAt)}
            {...(errors.startAt ? { 'aria-describedby': 'coupon-startAt-error' } : {})}
          />
        </Field>

        <Field
          label="사용 종료일"
          htmlFor="coupon-endAt"
          required
          {...(errors.endAt ? { error: errors.endAt } : { hint: '이 날짜가 지나면 기간 만료가 됩니다.' })}
        >
          <HintInput
            id="coupon-endAt"
            type="text"
            hint="2026-08-31"
            value={value.endAt}
            aria-required
            onChange={(event) => update('endAt', event.target.value)}
            invalid={Boolean(errors.endAt)}
            {...(errors.endAt ? { 'aria-describedby': 'coupon-endAt-error' } : {})}
          />
        </Field>

        <Field
          label="발급 대상"
          htmlFor="coupon-ownerEmail"
          {...(errors.ownerEmail
            ? { error: errors.ownerEmail }
            : { hint: '비우면 누구나 받을 수 있는 쿠폰이 되어 쿠폰 받기 탭에 나옵니다.' })}
        >
          <HintInput
            id="coupon-ownerEmail"
            type="email"
            hint="특정 고객에게만 줄 때 이메일을 적습니다"
            value={value.ownerEmail}
            onChange={(event) => update('ownerEmail', event.target.value)}
            invalid={Boolean(errors.ownerEmail)}
            {...(errors.ownerEmail ? { 'aria-describedby': 'coupon-ownerEmail-error' } : {})}
          />
        </Field>

        {/* 값이 다 찼을 때 무엇이 만들어지는지 한 줄로 되짚어 준다. */}
        <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
          {value.ownerEmail.trim() ? `${value.ownerEmail.trim()} 님에게만` : '누구나 받을 수 있는'} 쿠폰으로
          발급됩니다. 등록 직후 상태는 시작일과 오늘을 견주어 정해집니다.
        </p>
      </div>
    </Modal>
  );
}
