'use client';

import { Badge, Button, Modal } from '@winpilot/ui';
import { type SupportRequest } from '@winpilot/store';
import { SUPPORT_TONE } from './support-tone';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-20 shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

/**
 * 올린 문의와 그 답변을 읽는 창.
 *
 * ## 고치지 못한다
 * 아래줄이 `닫기` 하나다. 보낸 뒤에 내용을 바꾸면 우리가 읽은 글과 고객사가 보는 글이
 * 달라지고, 그러면 "그렇게 안 적었는데요" 를 서로 확인할 방법이 없어진다. 고칠 것이 있으면
 * 새 문의로 이어 적는 편이 기록으로 남는다.
 *
 * ## 답이 없을 때 자리를 비우지 않는다
 * 빈 자리는 **답을 못 찾은 것**으로도 읽힌다. 아직 답 전이라는 말을 그 자리에 적고, 지금
 * 어느 단계인지(접수·처리중)를 함께 보여 준다.
 */
export function SupportDetailModal({
  open,
  request,
  onClose,
}: {
  open: boolean;
  request: SupportRequest | null;
  onClose: () => void;
}) {
  if (!request) return null;

  return (
    <Modal
      open={open}
      title={request.title}
      description={`${request.id} · ${request.category} · ${request.receivedAt}`}
      onClose={onClose}
      footer={
        <Button tone="secondary" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <dl className="flex flex-col">
        <Row label="상태">
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={SUPPORT_TONE[request.state]}>{request.state}</Badge>
            {request.urgent && <Badge tone="danger">급함</Badge>}
          </span>
        </Row>
        <Row label="올린 사람">{request.sender}</Row>
        <Row label="담당">
          {/* 배정 전을 빈 칸으로 두면 담당이 없는 것인지 못 불러온 것인지 알 수 없다. */}
          {request.assignee || <span className="text-ink-faint">아직 배정 전입니다.</span>}
        </Row>
      </dl>

      <div className="mt-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-ink-faint">보낸 내용</p>
        <p className="whitespace-pre-line rounded-lg border border-border px-4 py-3 text-sm leading-relaxed">
          {request.body}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-ink-faint">답변</p>
        {request.answer ? (
          <p className="whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed">
            {request.answer}
          </p>
        ) : (
          <p className="rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-ink-muted">
            아직 답변 전입니다. 답변이 등록되면 이 자리에 표시되고 상태가 답변완료로 바뀝니다.
          </p>
        )}
      </div>
    </Modal>
  );
}
