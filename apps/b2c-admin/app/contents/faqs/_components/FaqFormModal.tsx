'use client';

import { useEffect, useState } from 'react';
import { AdminModal } from '@/app/_components/AdminModal';
import { HintInput, RichTextEditor } from '@winpilot/ui';
import {
  hasErrors,
  validateFaq,
  type FaqFormErrors,
  type FaqFormInput,
} from '@/lib/validation/content-record';

export type FaqFormMode = 'create' | 'edit';

export type FaqFormModalProps = {
  open: boolean;
  mode: FaqFormMode;
  /** 이 FAQ 가 속한 카테고리 이름 — 카테고리는 왼쪽에서 이미 골랐으므로 여기서 바꾸지 않는다 */
  categoryName: string;
  categoryId: string;
  initial?: FaqFormInput;
  onClose: () => void;
  onSubmit: (input: FaqFormInput) => void;
};

const EMPTY: FaqFormInput = { categoryId: '', question: '', answer: '', visible: true };

/**
 * FAQ 등록·수정.
 *
 * 답변은 HTML 이다 — 목록·표·링크가 들어가는 답변이 흔해서 한 줄 입력으로는 부족하다.
 */
export function FaqFormModal({
  open,
  mode,
  categoryName,
  categoryId,
  initial,
  onClose,
  onSubmit,
}: FaqFormModalProps) {
  const [value, setValue] = useState<FaqFormInput>(EMPTY);
  const [errors, setErrors] = useState<FaqFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(initial ?? { ...EMPTY, categoryId });
    setErrors({});
    setSubmitted(false);
  }, [open, initial, categoryId]);

  const update = <K extends keyof FaqFormInput>(field: K, next: FaqFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateFaq(draft));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validateFaq({ ...value, categoryId });
    setErrors(found);
    if (hasErrors(found)) return;
    onSubmit({ ...value, categoryId });
  };

  return (
    <AdminModal
      open={open}
      title={mode === 'create' ? 'FAQ 등록' : 'FAQ 수정'}
      description={`${categoryName} 카테고리에 ${mode === 'create' ? '추가' : '저장'}합니다.`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
          >
            {mode === 'create' ? '추가' : '저장'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="faq-question" className="text-sm font-medium">
            질문
          </label>
          <HintInput
            id="faq-question"
            type="text"
            hint="고객이 묻는 그대로 적어 주세요"
            value={value.question}
            onChange={(event) => update('question', event.target.value)}
            invalid={Boolean(errors.question)}
          />
          {errors.question && <p className="text-sm text-signal-danger">{errors.question}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="faq-answer" className="text-sm font-medium">
            답변
          </label>
          <RichTextEditor
            id="faq-answer"
            hint="답변을 입력해 주세요"
            value={value.answer}
            onChange={(html) => update('answer', html)}
          />
          {errors.answer && <p className="text-sm text-signal-danger">{errors.answer}</p>}
        </div>

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
    </AdminModal>
  );
}
