'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Field, HintInput, Modal } from '@winpilot/ui';
import {
  validateCategoryField,
  validateCategoryForm,
  type CategoryFormErrors,
  type CategoryFormInput,
  type CategoryFormMode,
} from '@/lib/validation/category-record';

export type CategoryRecord = {
  id: string;
  name: string;
  /** 상위 카테고리 id. 빈 문자열이면 1Depth. */
  parentId: string;
  visible: boolean;
  /** 이 카테고리에 속한 상품 수 — 자동 집계 */
  productCount: number;
};

export type CategoryFormModalProps = {
  open: boolean;
  mode: CategoryFormMode;
  /** 1 = 대분류, 2 = 세부 분류 */
  depth: 1 | 2;
  record: CategoryRecord | null;
  /** depth 2 일 때 소속될 1Depth 이름 */
  parentName?: string;
  onClose: () => void;
  onSubmit: (value: CategoryFormInput) => void;
};

const EMPTY: CategoryFormInput = { name: '', parentId: '', visible: true };

export function CategoryFormModal({
  open,
  mode,
  depth,
  record,
  parentName,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [value, setValue] = useState<CategoryFormInput>(EMPTY);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitted(false);
    setValue(record ? { name: record.name, parentId: record.parentId, visible: record.visible } : EMPTY);
  }, [open, record]);

  const update = <K extends keyof CategoryFormInput>(field: K, next: CategoryFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (!submitted) return;
    const message = validateCategoryField(field, draft);
    setErrors(message ? { [field]: message } : {});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateCategoryForm(value);
    setErrors(found);
    if (found.name) {
      document.getElementById('category-name')?.focus();
      return;
    }
    onSubmit(value);
  };

  const depthLabel = depth === 1 ? '대분류' : '세부 분류';

  return (
    <Modal
      open={open}
      title={`${depthLabel} ${mode === 'create' ? '추가' : '수정'}`}
      description={
        depth === 1
          ? '대분류는 상품 목록의 최상위 묶음입니다.'
          : `${parentName ?? '선택한 대분류'} 아래에 들어갈 세부 분류입니다.`
      }
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="category-form">
            {mode === 'create' ? '추가' : '저장'}
          </Button>
        </>
      }
    >
      <form id="category-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">분류 단계</span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">자동</span>
          </div>
          <p className="flex h-11 items-center rounded-lg bg-surface px-3 text-sm text-ink-muted">
            {depth}Depth · {depthLabel}
            {depth === 2 && parentName ? ` (상위: ${parentName})` : ''}
          </p>
        </div>

        <Field
          label="카테고리명"
          htmlFor="category-name"
          required
          {...(errors.name ? { error: errors.name } : {})}
        >
          <HintInput
            id="category-name"
            type="text"
            hint="카테고리명을 입력해 주세요"
            value={value.name}
            onChange={(event) => update('name', event.target.value)}
            invalid={Boolean(errors.name)}
            {...(errors.name ? { 'aria-describedby': 'category-name-error' } : {})}
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">고객 화면 노출</legend>
          <div className="mt-1 flex w-full gap-2">
            {['노출', '숨김'].map((option) => {
              const active = (option === '노출') === value.visible;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update('visible', option === '노출')}
                  className={`h-11 flex-1 rounded-lg border px-4 text-sm transition-colors duration-150 ${
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
      </form>
    </Modal>
  );
}
