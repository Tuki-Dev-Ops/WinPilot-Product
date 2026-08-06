'use client';

import { useEffect, useState } from 'react';
import { Button, Field, HintInput, HintTextarea, Modal } from '@winpilot/ui';
import { hasErrors } from '@/lib/validation/content-record';
import {
  validateMilestone,
  type MilestoneFormErrors,
  type MilestoneFormInput,
} from '@/lib/validation/company-record';

export type MilestoneFormMode = 'create' | 'edit';

export type MilestoneFormModalProps = {
  open: boolean;
  mode: MilestoneFormMode;
  initial?: MilestoneFormInput;
  onClose: () => void;
  onSubmit: (input: MilestoneFormInput) => void;
};

const EMPTY: MilestoneFormInput = { year: '', month: '', title: '', description: '', visible: true };

/** 연혁 한 줄 등록·수정. */
export function MilestoneFormModal({ open, mode, initial, onClose, onSubmit }: MilestoneFormModalProps) {
  const [value, setValue] = useState<MilestoneFormInput>(EMPTY);
  const [errors, setErrors] = useState<MilestoneFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(initial ?? EMPTY);
    setErrors({});
    setSubmitted(false);
  }, [open, initial]);

  const update = <K extends keyof MilestoneFormInput>(field: K, next: MilestoneFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateMilestone(draft));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validateMilestone(value);
    setErrors(found);
    if (hasErrors(found)) return;
    onSubmit(value);
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '연혁 추가' : '연혁 수정'}
      description="월은 비워 둘 수 있습니다. 연도만 적는 연혁도 흔합니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={submit}>
            {mode === 'create' ? '추가' : '저장'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="milestone-year" className="text-sm font-medium">
              연도
            </label>
            <HintInput
              id="milestone-year"
              type="text"
              inputMode="numeric"
              hint="2026"
              value={value.year}
              onChange={(event) => update('year', event.target.value)}
              invalid={Boolean(errors.year)}
            />
            {errors.year && <p className="text-sm text-signal-danger">{errors.year}</p>}
          </div>

          <div className="flex w-28 shrink-0 flex-col gap-2">
            <label htmlFor="milestone-month" className="text-sm font-medium">
              월 (선택)
            </label>
            <HintInput
              id="milestone-month"
              type="text"
              inputMode="numeric"
              hint="07"
              value={value.month}
              onChange={(event) => update('month', event.target.value)}
              invalid={Boolean(errors.month)}
            />
            {errors.month && <p className="text-sm text-signal-danger">{errors.month}</p>}
          </div>
        </div>

        <Field
          label="내용"
          htmlFor="milestone-title"
          required
        >
          <HintInput
            id="milestone-title"
            type="text"
            hint="예: 어드민 콘솔 정식 공개"
            value={value.title}
            onChange={(event) => update('title', event.target.value)}
            invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="text-sm text-signal-danger">{errors.title}</p>}
        </Field>

        <Field
          label="설명 (선택)"
          htmlFor="milestone-description"
        >
          <HintTextarea
            id="milestone-description"
            hint="한두 문장으로 덧붙일 내용이 있으면 적어 주세요"
            value={value.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">노출</legend>
          <div className="mt-1 flex w-full gap-2">
            {(['노출', '숨김'] as const).map((option, index) => {
              const active = index === 0 ? value.visible : !value.visible;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update('visible', index === 0)}
                  className={`h-11 flex-1 whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
                    active
                      ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                      : 'border-border-strong text-ink-muted hover:border-ink-faint'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </Modal>
  );
}
