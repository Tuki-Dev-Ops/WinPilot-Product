'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type AdminSelectionAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'danger' | 'brand';
  onClick: () => void;
};

export type AdminSelectionBarProps = {
  count: number;
  actions: AdminSelectionAction[];
  onClear: () => void;
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4 L10 10 M10 4 L4 10" strokeLinecap="round" />
    </svg>
  );
}

const TONE_STYLE = {
  neutral: 'border-border-strong text-ink hover:border-ink-faint',
  danger: 'border-border-strong text-signal-danger hover:border-signal-danger',
  brand: 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600',
} as const;

/**
 * 선택한 항목에 걸 수 있는 동작을 **화면 아래 가운데**에 띄우는 막대.
 *
 * 표 위쪽 툴바에 두면 목록을 스크롤한 뒤에는 보이지 않는다. 선택은 아래쪽에서 하는데
 * 동작은 위에 있으면 매번 되돌아가야 한다.
 *
 * 토스트도 아래 가운데에 뜨므로 이 막대는 그보다 한 단 위에 자리를 잡는다 — 겹치면
 * 방금 한 동작의 결과를 읽을 수 없다.
 */
export function AdminSelectionBar({ count, actions, onClear }: AdminSelectionBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (count === 0 || !mounted) return null;

  const bar = (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full animate-toast-in items-center gap-3 overflow-x-auto rounded-xl border border-border bg-surface-raised px-4 py-3 shadow-lg">
        <p className="shrink-0 whitespace-nowrap text-sm">
          <span className="font-medium tabular-nums">{count}</span>건 선택됨
        </p>

        <span className="h-5 w-px shrink-0 bg-border" />

        <div className="flex shrink-0 items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
                TONE_STYLE[action.tone ?? 'neutral']
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="선택 해제"
          className="shrink-0 rounded-lg p-1.5 text-ink-faint transition-colors duration-150 hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );

  return createPortal(bar, document.body);
}
