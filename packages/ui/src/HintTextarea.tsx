import type { TextareaHTMLAttributes } from 'react';

export type HintTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> & {
  hint: string;
  invalid?: boolean;
};

/**
 * 안내 문구가 있는 여러 줄 입력란.
 *
 * `placeholder` 를 쓰지 않는 이유는 `HintInput` 과 같다 — placeholder 는 DOM 텍스트 노드가
 * 아니라 추출되지 않고 Figma 에서 빈 상자로 나온다 (docs/spec/05-component.md).
 */
export function HintTextarea({ hint, invalid = false, className = '', rows = 6, ...rest }: HintTextareaProps) {
  return (
    <div className="relative">
      <textarea
        {...rest}
        rows={rows}
        placeholder=" "
        aria-invalid={invalid}
        className={`peer w-full rounded-lg border bg-surface px-3 py-3 text-sm leading-relaxed text-ink ${
          invalid ? 'border-signal-danger' : 'border-border-strong'
        } ${className}`}
      />
      <span className="pointer-events-none absolute left-3 top-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
        {hint}
      </span>
    </div>
  );
}
