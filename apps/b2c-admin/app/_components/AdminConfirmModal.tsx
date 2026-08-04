'use client';

import { AdminModal } from '@/app/_components/AdminModal';

export type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 되돌릴 수 없는 동작은 danger, 등록·저장은 brand */
  tone?: 'danger' | 'brand';
  /** 입력 폼 모달 위에 겹쳐 띄우는 경우 */
  elevated?: boolean;
  /** 확인 창 본문에 함께 보여줄 요약 (무엇을 저장하는지) */
  summary?: Array<{ label: string; value: string }>;
};

/**
 * 되돌리기 어렵거나 기록이 남는 동작 앞에 세우는 확인 창.
 * 삭제뿐 아니라 등록·저장에도 세운다 — 목록이 소리 없이 바뀌면 무엇을 했는지 알 수 없다.
 */
export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  tone = 'danger',
  elevated = false,
  summary,
}: AdminConfirmModalProps) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      elevated={elevated}
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
            onClick={onConfirm}
            className={`h-9 shrink-0 whitespace-nowrap rounded-lg px-4 text-sm font-medium text-white ${
              tone === 'danger' ? 'bg-signal-danger' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
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
      </div>
    </AdminModal>
  );
}
