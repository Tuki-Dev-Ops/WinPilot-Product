'use client';

import { useEffect, useState } from 'react';
import { Button, Field, HintInput, Modal } from '@winpilot/ui';
import { CONTENT_MESSAGES } from '@/lib/validation/content-record';

export type FaqCategoryInput = { name: string; visible: boolean };

export type FaqCategoryModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: FaqCategoryInput;
  onClose: () => void;
  onSubmit: (input: FaqCategoryInput) => void;
};

const EMPTY: FaqCategoryInput = { name: '', visible: true };

/** FAQ 카테고리 추가·수정. */
export function FaqCategoryModal({ open, mode, initial, onClose, onSubmit }: FaqCategoryModalProps) {
  const [value, setValue] = useState<FaqCategoryInput>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue(initial ?? EMPTY);
    setError('');
  }, [open, initial]);

  const submit = () => {
    if (!value.name.trim()) {
      setError(CONTENT_MESSAGES.categoryNameRequired);
      return;
    }
    onSubmit({ name: value.name.trim(), visible: value.visible });
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'FAQ 카테고리 추가' : 'FAQ 카테고리 수정'}
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
        <Field
          label="카테고리명"
          htmlFor="faq-category-name"
          required
        >
          <HintInput
            id="faq-category-name"
            type="text"
            hint="예: 배송"
            value={value.name}
            onChange={(event) => {
              setValue((previous) => ({ ...previous, name: event.target.value }));
              setError('');
            }}
            invalid={Boolean(error)}
          />
          {error && <p className="text-sm text-signal-danger">{error}</p>}
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
                  onClick={() => setValue((previous) => ({ ...previous, visible: index === 0 }))}
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
