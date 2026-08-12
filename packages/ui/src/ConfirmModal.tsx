'use client';

import { Button } from './Button';
import { Modal } from './Modal';

/**
 * 되돌리기 어려운 일 앞에 세우는 **확인 창**.
 *
 * ## 왜 저장에도 세우나
 * 어드민이 저장하는 값은 대부분 **사이트로 그대로 나간다.** 값이 틀리면 손님이 겪은 뒤에
 * 우리에게 온다. 목록 하나 고치는 일과 같은 무게로 저장되면 안 되는 자리다.
 *
 * 그래서 **무엇이 어디로 나가는지**를 한 줄로 다시 보여 주고 누르게 한다. 확인 창의 값어치는
 * 막는 데 있지 않고 **읽게 하는 데** 있다 — 그래서 `detail` 에 바뀌는 값을 적는다.
 *
 * ## 위에 뜬다
 * 언제나 다른 창 위에서 열리므로 `elevated` 다. 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다.
 *
 * ## 여기로 올라온 이유
 * IR 어드민 안에만 있던 것을 F&B 어드민이 같이 쓰기로 하면서 올렸다. 지우기 확인이 콘솔마다
 * 따로 있으면 **나중에 만든 콘솔일수록 확인 창이 빠진다** — 실제로 그렇게 갈라진 자리를 세다가
 * `Badge` · `Button` · `Modal` 을 올렸다(이 패키지 머리말).
 */
export function ConfirmModal({
  open,
  title,
  message,
  detail,
  confirmLabel,
  tone = 'primary',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  /** 무슨 일이 벌어지는지 — 한 문장 */
  message: string;
  /** 무엇이 바뀌는지. 읽고 판단하는 값이라 비우지 않는다 */
  detail?: string;
  confirmLabel: string;
  /** 되돌릴 수 없는 일은 붉게 */
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      elevated
      footer={
        <>
          <Button tone="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button tone={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed">{message}</p>
      {detail && (
        <p className="mt-3 rounded-lg bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink-muted">
          {detail}
        </p>
      )}
    </Modal>
  );
}
