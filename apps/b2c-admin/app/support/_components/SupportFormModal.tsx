'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Checkbox, Dropdown, Field, HintInput, HintTextarea, Modal, RequiredLegend } from '@winpilot/ui';
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_NOTE, type SupportCategory } from '@winpilot/store';
import {
  SUPPORT_FORM,
  validateSupportForm,
  type SupportFormErrors,
} from '@/lib/validation/support-record';

export type SupportFormInput = {
  category: SupportCategory;
  title: string;
  body: string;
  urgent: boolean;
};

const EMPTY: SupportFormInput = { category: '장애', title: '', body: '', urgent: false };

/**
 * 사내 담당자에게 보낼 문의를 쓰는 창.
 *
 * ## 분류를 먼저 고르게 한다
 * 우리 쪽 목록은 분류로 갈라 손댄다 — 장애가 기능 요청 아래에 깔리면 그날 안에 안 열린다.
 * 이름만으로는 `기능 요청` 과 `기타` 가 갈리지 않아 고른 분류의 뜻을 아래에 적어 준다.
 *
 * ## 급함은 고객사가 켠다
 * 우리가 대신 판단하면 급한 것을 늦게 받는다. 남용은 목록에서 바로 보이므로(급함 건수)
 * 통화 한 번으로 정리된다. 대신 **켤 때 무엇을 뜻하는지**를 그 자리에 적는다 — 켜 두면
 * 담당자의 다른 일이 뒤로 밀린다는 사실을 알고 켜야 한다.
 */
export function SupportFormModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: SupportFormInput) => void;
}) {
  const [value, setValue] = useState<SupportFormInput>(EMPTY);
  const [errors, setErrors] = useState<SupportFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  /* 창을 열 때마다 비운다 — 앞서 쓰다 만 글이 남아 있으면 엉뚱한 문의가 올라간다. */
  useEffect(() => {
    if (!open) return;
    setValue(EMPTY);
    setErrors({});
    setSubmitted(false);
  }, [open]);

  const commit = (next: SupportFormInput) => {
    setValue(next);
    if (submitted) setErrors(validateSupportForm(next));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const found = validateSupportForm(value);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({ ...value, title: value.title.trim(), body: value.body.trim() });
  };

  return (
    <Modal
      open={open}
      title="문의하기"
      description="스페이스플래닝 담당자에게 바로 갑니다. 답변은 이 화면에서 확인합니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="support-form">
            보내기
          </Button>
        </>
      }
    >
      <form id="support-form" noValidate onSubmit={submit} className="flex flex-col gap-5">
        <RequiredLegend />

        <Field label="분류" htmlFor="support-category" hint={SUPPORT_CATEGORY_NOTE[value.category]}>
          <Dropdown
            id="support-category"
            label="분류 선택"
            options={SUPPORT_CATEGORIES.map((one) => ({ value: one, label: one }))}
            value={value.category}
            onChange={(next) => commit({ ...value, category: next as SupportCategory })}
          />
        </Field>

        <Field
          label={SUPPORT_FORM.title.label}
          htmlFor="support-title"
          required={SUPPORT_FORM.title.required}
          {...(errors.title ? { error: errors.title } : { hint: SUPPORT_FORM.title.hint })}
        >
          <HintInput
            id="support-title"
            type="text"
            hint="예: 카카오 로그인이 되지 않습니다"
            value={value.title}
            onChange={(event) => commit({ ...value, title: event.target.value })}
            invalid={Boolean(errors.title)}
            {...(errors.title ? { 'aria-describedby': 'support-title-error' } : {})}
          />
        </Field>

        <Field
          label={SUPPORT_FORM.body.label}
          htmlFor="support-body"
          required={SUPPORT_FORM.body.required}
          {...(errors.body ? { error: errors.body } : { hint: SUPPORT_FORM.body.hint })}
        >
          <HintTextarea
            id="support-body"
            rows={6}
            hint="예: 어제 저녁부터 로그인 화면에서 카카오 버튼을 누르면 오류 화면으로 갑니다."
            value={value.body}
            onChange={(event) => commit({ ...value, body: event.target.value })}
            invalid={Boolean(errors.body)}
            {...(errors.body ? { 'aria-describedby': 'support-body-error' } : {})}
          />
        </Field>

        <Field label="급함" hint="켜면 담당자의 다른 일보다 먼저 봅니다. 지금 장사가 멈춘 경우에만 켜 주세요.">
          <label className="flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-strong px-3 py-2 text-sm">
            <Checkbox
              checked={value.urgent}
              onChange={(checked) => commit({ ...value, urgent: checked })}
              label="급한 문의"
            />
            {value.urgent ? '급한 문의' : '보통'}
          </label>
        </Field>
      </form>
    </Modal>
  );
}
