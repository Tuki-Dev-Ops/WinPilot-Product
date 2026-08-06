'use client';

import type { ReactNode } from 'react';
import { Button, Modal } from '@winpilot/ui';

export type DetailRow = {
  label: string;
  value: ReactNode;
};

/**
 * **읽기만 하는 상세 창** — 이름표와 값이 짝을 이루는 줄들, 아래줄은 `닫기` 하나.
 *
 * ## 등록 창(`InternalModal`)과 갈라 둔 이유
 * 그쪽은 아래줄이 언제나 `취소`·`저장` 둘이다. 고칠 것이 없는 자리에 저장 단추를 두면,
 * 눌러 본 사람이 무엇이 저장됐는지를 찾게 된다. **고칠 수 없는 화면과 고치는 화면은 아래줄
 * 모양부터 달라야** 들어가기 전에 무엇을 할 수 있는지가 읽힌다.
 *
 * ## 왜 이런 창이 필요한가
 * 목록의 한 줄에는 훑을 때 필요한 값만 싣는다. 그런데 기록에는 줄에 없는 값이 늘 남아 있다 —
 * 메모, 발행일, 되찾을 수 있다고 본 이유 같은 것들이다. 그것을 볼 자리가 없으면 줄에 다 넣게
 * 되고, 그때부터 목록은 훑을 수 없는 것이 된다.
 *
 * `note` 는 값이 아니라 **그 기록을 어떻게 다뤄야 하는지**를 적는 자리다.
 */
export function InternalDetailModal({
  open,
  title,
  description,
  rows,
  note,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  rows: DetailRow[];
  /** 창 아래 안내 한 줄 — 이 기록을 어디서 고치는지 같은 말 */
  note?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      {...(description === undefined ? {} : { description })}
      onClose={onClose}
      footer={
        <Button tone="secondary" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <dt className="w-24 shrink-0 text-xs text-ink-faint">{row.label}</dt>
            {/* 값은 줄바꿈을 허용한다 — 메모처럼 긴 값을 잘라 버리면 적어 둔 뜻이 없다. */}
            <dd className="min-w-0 flex-1 text-sm leading-relaxed">{row.value}</dd>
          </div>
        ))}
      </dl>

      {note && <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">{note}</p>}
    </Modal>
  );
}
