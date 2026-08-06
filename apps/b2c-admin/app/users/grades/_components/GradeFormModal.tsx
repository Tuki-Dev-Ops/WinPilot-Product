'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Field, HintInput, Modal } from '@winpilot/ui';
import {
  formatAmount,
  parseAmount,
  validateGradeField,
  validateGradeForm,
  type GradeFormErrors,
  type GradeFormInput,
  type GradeFormMode,
} from '@/lib/validation/grade-record';

export type GradeRecord = {
  id: string;
  name: string;
  /** 누적 결제금액 기준 (원) */
  threshold: number;
  /** 할인율 (%) */
  discountRate: number;
  /** 이 등급에 속한 사용자 수 — 자동 집계 */
  memberCount: number;
};

export type GradeFormModalProps = {
  open: boolean;
  mode: GradeFormMode;
  record: GradeRecord | null;
  onClose: () => void;
  onSubmit: (value: GradeFormInput) => void;
};

const EMPTY: GradeFormInput = { name: '', threshold: '', discountRate: '' };

export function GradeFormModal({ open, mode, record, onClose, onSubmit }: GradeFormModalProps) {
  const [value, setValue] = useState<GradeFormInput>(EMPTY);
  const [errors, setErrors] = useState<GradeFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitted(false);
    setValue(
      record
        ? { name: record.name, threshold: String(record.threshold), discountRate: String(record.discountRate) }
        : EMPTY,
    );
  }, [open, record]);

  const update = (field: keyof GradeFormInput, next: string) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (!submitted) return;
    setErrors((current) => {
      const updated = { ...current };
      const message = validateGradeField(field, draft);
      if (message) updated[field] = message;
      else delete updated[field];
      return updated;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateGradeForm(value);
    setErrors(found);
    const firstInvalid = (['name', 'threshold', 'discountRate'] as const).find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(`grade-${firstInvalid}`)?.focus();
      return;
    }
    onSubmit(value);
  };

  const previewAmount = parseAmount(value.threshold);
  const previewRate = value.discountRate.trim();

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '등급 추가' : '등급 수정'}
      description="누적 결제금액이 기준을 넘으면 해당 등급의 할인율이 적용됩니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="grade-form">
            {mode === 'create' ? '추가' : '저장'}
          </Button>
        </>
      }
    >
      <form id="grade-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          label="등급명"
          htmlFor="grade-name"
          required
          {...(errors.name ? { error: errors.name } : {})}
        >
          <HintInput
            id="grade-name"
            type="text"
            hint="등급명을 입력해 주세요"
            value={value.name}
            onChange={(event) => update('name', event.target.value)}
            invalid={Boolean(errors.name)}
            {...(errors.name ? { 'aria-describedby': 'grade-name-error' } : {})}
          />
        </Field>

        <Field
          label="누적금액 기준"
          htmlFor="grade-threshold"
          required
          {...(errors.threshold ? { error: errors.threshold } : {})}
        >
          {/* 단위(`원 이상`)는 입력 옆에 붙어야 무엇을 넣는 칸인지가 눈으로 읽힌다. */}
          <div className="flex items-center gap-2">
            <HintInput
              id="grade-threshold"
              type="text"
              inputMode="numeric"
              hint="숫자만 입력해 주세요"
              value={value.threshold}
              onChange={(event) => update('threshold', event.target.value)}
              invalid={Boolean(errors.threshold)}
              className="flex-1"
              {...(errors.threshold ? { 'aria-describedby': 'grade-threshold-error' } : {})}
            />
            <span className="shrink-0 text-sm text-ink-muted">원 이상</span>
          </div>
        </Field>

        <Field
          label="할인율"
          htmlFor="grade-discountRate"
          required
          {...(errors.discountRate ? { error: errors.discountRate } : {})}
        >
          <div className="flex items-center gap-2">
            <HintInput
              id="grade-discountRate"
              type="text"
              inputMode="decimal"
              hint="0 ~ 100 사이 숫자"
              value={value.discountRate}
              onChange={(event) => update('discountRate', event.target.value)}
              invalid={Boolean(errors.discountRate)}
              className="flex-1"
              {...(errors.discountRate ? { 'aria-describedby': 'grade-discountRate-error' } : {})}
            />
            <span className="shrink-0 text-sm text-ink-muted">%</span>
          </div>
        </Field>

        <div className="rounded-lg bg-surface px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">적용 규칙</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            누적 결제금액 <span className="font-medium tabular-nums">{formatAmount(previewAmount)}</span>원 이상인
            사용자에게 <span className="font-medium tabular-nums">{previewRate || '0'}</span>% 할인이 적용됩니다.
          </p>
        </div>
      </form>
    </Modal>
  );
}
