'use client';

import { Check, Minus } from 'lucide-react';
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
    <span className="relative inline-flex size-[18px] shrink-0 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        /*
          테두리는 켜지지 않았을 때도 또렷해야 한다 — 옅게 두면 배경이 회색인 자리에서
          네모가 있는지조차 보이지 않는다. 켜면 브랜드색으로 채우고 체크 표시를 얹는다.
        */
        className="peer size-[18px] cursor-pointer appearance-none rounded border-[1.5px] border-border-strong bg-canvas transition-colors duration-100 hover:border-ink-faint checked:border-brand-500 checked:bg-brand-500 indeterminate:border-brand-500 indeterminate:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {/*
        체크와 빗금도 실제 SVG 라 Figma 로 추출된다 — 글꼴 글리프(✓)로 두면 모양이 달라진다.

        색을 `stroke="#ffffff"` 로 못 박지 않고 `text-white` 로 준다. 라이브러리 아이콘은
        `currentColor` 를 쓰므로, 색을 글자색으로 다루면 나중에 톤을 바꿀 때 손댈 자리가 한 곳이다.
      */}
      <Check
        aria-hidden
        className="pointer-events-none absolute hidden size-3 text-white peer-checked:block"
        strokeWidth={3}
      />
      <Minus
        aria-hidden
        className="pointer-events-none absolute hidden size-3 text-white peer-indeterminate:block"
        strokeWidth={3}
      />
    </span>
  );
}
