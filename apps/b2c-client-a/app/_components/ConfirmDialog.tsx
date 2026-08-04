'use client';

import { useEffect } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 되돌릴 수 없는 동작은 danger, 저장·주문은 brand */
  tone?: 'danger' | 'brand';
  /** 무엇을 확정하는지 — 숫자와 이름을 눈으로 한 번 더 맞춘다 */
  summary?: Array<{ label: string; value: string }>;
};

/**
 * 되돌리기 어려운 동작 앞에 세우는 확인 창 — **고객 화면도 어드민과 같은 규칙**이다.
 *
 * 주문·삭제·저장처럼 기록이 남는 일은 한 번 더 묻는다. 목록이 소리 없이 바뀌면
 * 무엇을 했는지 알 수 없고, 잘못 눌렀을 때 되돌릴 방법도 없다.
 *
 * 포털을 쓰지 않는다 — 추출 시점의 DOM 트리에 그대로 남아야 Figma 에서도 이 창이 보인다.
 * 닫힌 상태에서는 아예 그리지 않으므로 평소 화면에는 영향이 없다.
 *
 * ## 어드민 연동
 * - 어드민의 `AdminConfirmModal` 과 **같은 규칙**이다 — 삭제·저장·주문 앞에 한 번 더 묻는다
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  tone = 'brand',
  summary,
}: ConfirmDialogProps) {
  // Esc 로 닫힌다 — 확인 창을 닫을 방법이 마우스뿐이면 키보드 사용자가 갇힌다.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 뒤 화면을 덮어 어둡게 — 지금 답해야 할 것이 무엇인지 분명해진다. */}
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/45" />

      <div className="relative flex w-full max-w-100 flex-col gap-4 rounded-xl border border-border bg-surface-raised px-6 py-6 shadow-xl">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>

        {summary && summary.length > 0 && (
          <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
            {summary.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{row.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 shrink-0 whitespace-nowrap rounded-lg px-4 text-sm font-medium text-white ${
              tone === 'danger' ? 'bg-signal-danger' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
