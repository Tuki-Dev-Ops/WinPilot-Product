'use client';

import type { ReactNode } from 'react';

export function ContentSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-canvas">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
    </section>
  );
}

export function ContentField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** 자동입력·수정 불가 항목. input 이 아니라 텍스트로 그린다 — input 의 value 는 추출되지 않는다. */
export function ContentReadonly({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {note && <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">{note}</span>}
      </div>
      <p className="flex h-11 items-center rounded-lg bg-surface px-3 font-mono text-sm text-ink-muted">{value}</p>
    </div>
  );
}

export function ContentToggle({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: [string, string];
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-1 flex w-full gap-2">
        {options.map((option, index) => {
          const active = index === 0 ? value : !value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(index === 0)}
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
  );
}

/** 오른쪽 열 — 저장·목록 버튼. 모든 콘텐츠 폼이 같은 자리에 같은 버튼을 둔다. */
export function ContentFormActions({
  mode,
  onList,
  children,
}: {
  mode: 'create' | 'edit';
  onList: () => void;
  children?: ReactNode;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-80">
      {children}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-canvas px-6 py-6">
        <button
          type="submit"
          className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {mode === 'create' ? '등록' : '저장'}
        </button>
        <button
          type="button"
          onClick={onList}
          className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
        >
          목록으로
        </button>
      </div>
    </aside>
  );
}
