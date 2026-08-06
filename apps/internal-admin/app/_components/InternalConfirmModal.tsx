'use client';

import { Button, Modal } from '@winpilot/ui';

/**
 * 되돌리기 어려운 일 앞에 세우는 **확인 창**.
 *
 * ## 왜 저장에도 세우나
 * 이 콘솔이 저장하는 값은 대부분 **고객사의 배포로 나간다.** 결제 키 · 로그인 키 · DNS 값은
 * 틀리면 그 고객사의 사이트가 멈추고, 멈춘 사실은 고객이 겪은 뒤에 우리에게 온다. 목록 하나
 * 고치는 일과 같은 무게로 저장되면 안 되는 자리다.
 *
 * 그래서 **무엇이 어디로 나가는지**를 한 줄로 다시 보여 주고 누르게 한다. 확인 창의 값어치는
 * 막는 데 있지 않고 **읽게 하는 데** 있다 — 그래서 `detail` 에 고객사 이름과 바뀌는 값을 적는다.
 *
 * ## 취소에도 세운다
 * 창을 닫으면 쓰던 값이 사라진다. 키는 다른 화면에서 복사해 온 값이라 다시 가져오는 데
 * 시간이 걸리고, 실수로 바깥을 눌러 닫은 것과 일부러 닫은 것을 화면은 구분하지 못한다.
 *
 * ## 위에 뜬다
 * 언제나 다른 창 위에서 열리므로 `elevated` 다. 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다.
 */
export function InternalConfirmModal({
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
  /** 어느 고객사의 무엇인지. 읽고 판단하는 값이라 비우지 않는다 */
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
