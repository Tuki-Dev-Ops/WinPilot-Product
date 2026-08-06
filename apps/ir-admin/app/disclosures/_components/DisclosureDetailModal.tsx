'use client';

import { Badge, Button, Modal } from '@winpilot/ui';
import type { Disclosure } from '@winpilot/store';

/**
 * 공시 한 건을 읽고 **게시**하는 창.
 *
 * 아래줄이 상태에 따라 달라진다 — 아직 안 나간 원고에는 `게시`, 이미 나간 공시에는 `닫기`
 * 하나다. 나간 것을 다시 게시할 수 있게 두면 같은 공시가 두 번 나간다.
 */
export function DisclosureDetailModal({
  open,
  disclosure,
  onClose,
  onPublish,
}: {
  open: boolean;
  disclosure: Disclosure | null;
  onClose: () => void;
  onPublish: () => void;
}) {
  if (!disclosure) return null;

  const sent = disclosure.state === '공시됨' || disclosure.state === '정정';

  return (
    <Modal
      open={open}
      title={disclosure.title}
      description={`${disclosure.id} · ${disclosure.kind}`}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            닫기
          </Button>
          {!sent && (
            <Button tone="danger" onClick={onPublish}>
              게시
            </Button>
          )}
        </>
      }
    >
      <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="shrink-0 text-xs text-ink-faint">상태</dt>
          <dd>
            <Badge tone={sent ? 'ok' : 'wait'}>{disclosure.state}</Badge>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="shrink-0 text-xs text-ink-faint">공시일</dt>
          <dd className="font-mono text-xs tabular-nums">{disclosure.disclosedAt || '아직 안 나감'}</dd>
        </div>
        {disclosure.correctionOf && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-xs text-ink-faint">정정 대상</dt>
            <dd className="font-mono text-xs">{disclosure.correctionOf}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-ink-faint">본문</p>
        {/* 값의 출처는 이 콘솔의 편집기다 — 외부 입력이 아니라 편집기에 넣은 것과 같은 신뢰 수준으로 다룬다. */}
        <div
          className="rounded-lg border border-border px-4 py-3 text-sm leading-relaxed [&_p]:my-2"
          dangerouslySetInnerHTML={{ __html: disclosure.body }}
        />
      </div>

      {disclosure.dartUrl && (
        <a
          href={disclosure.dartUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300"
        >
          DART 원문 보기
        </a>
      )}
    </Modal>
  );
}
