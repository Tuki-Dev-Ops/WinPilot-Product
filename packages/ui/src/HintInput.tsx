import type { InputHTMLAttributes } from 'react';

export type HintInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  /** 입력란 안에 보이는 안내 문구 */
  hint: string;
  invalid?: boolean;
};

/**
 * 안내 문구가 있는 입력란.
 *
 * `placeholder` 로 문구를 넣지 않는다 — placeholder 는 DOM 텍스트 노드가 아니라
 * 추출되지 않고 Figma 에서 빈 상자로 나온다 (docs/spec/05-component.md).
 * 대신 **실제 텍스트 노드**를 겹쳐 두고, 포커스가 오거나 값이 입력되면 CSS 로만 숨긴다.
 * `placeholder=" "` 는 `:placeholder-shown` 을 살리기 위한 것이고 화면에는 보이지 않는다.
 */
export function HintInput({ hint, invalid = false, className = '', ...rest }: HintInputProps) {
  return (
    <div className="relative flex items-center">
      <input
        {...rest}
        placeholder=" "
        aria-invalid={invalid}
        className={`peer h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-sm text-ink ${
          invalid ? 'border-signal-danger' : 'border-border-strong'
        } ${className}`}
      />
      <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
        {hint}
      </span>
    </div>
  );
}
