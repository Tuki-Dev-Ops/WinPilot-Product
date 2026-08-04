'use client';

import { useEffect, useRef, type ChangeEvent } from 'react';

export type CheckboxProps = {
  checked: boolean;
  /** 일부만 선택된 상태 (전체 선택 체크박스용) */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  /** 화면에 보이지 않는 접근성 라벨 */
  label: string;
  /** 끌 수 없는 항목 — 켜진 채로 잠근다 */
  disabled?: boolean;
};

/**
 * 체크박스.
 *
 * 네이티브 렌더는 OS 마다 달라 Figma 와 맞출 수 없으므로 `appearance-none` 으로 직접 그린다.
 * 체크 표시는 실제 SVG 요소라 추출된다.
 */
export function Checkbox({ checked, indeterminate = false, onChange, label, disabled = false }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked);

  return (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        className="peer size-4 appearance-none rounded-xs border border-border-strong bg-canvas transition-colors duration-100 checked:border-brand-500 checked:bg-brand-500 indeterminate:border-brand-500 indeterminate:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        className="pointer-events-none absolute hidden peer-checked:block"
      >
        <path d="M2 5.2 L4.2 7.4 L8 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        className="pointer-events-none absolute hidden peer-indeterminate:block"
      >
        <path d="M2.5 5 L7.5 5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
