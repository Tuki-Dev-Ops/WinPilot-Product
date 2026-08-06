'use client';

import { Button, Modal } from '@winpilot/ui';

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
 *
 * `tone` 을 `Button` 의 톤으로 그냥 넘기지 않고 한 번 옮기는 이유: 여기서 `brand` 는
 * '되돌릴 수 있다' 는 뜻이고 `Button` 의 `primary` 는 '이 화면에서 하려던 일' 이라는 뜻이라
 * 두 어휘가 가리키는 것이 다르다. 같은 말로 묶어 두면 한쪽 뜻이 바뀔 때 다른 쪽이 소리 없이
 * 끌려간다.
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
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      elevated={elevated}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button tone={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
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
    </Modal>
  );
}
