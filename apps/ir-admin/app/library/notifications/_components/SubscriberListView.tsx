'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { SUBSCRIBERS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '메일', span: 'lg:col-span-4' },
  { label: '받는 갈래', span: 'lg:col-span-3' },
  { label: '구독일', span: 'lg:col-span-2' },
  { label: '확인', span: 'lg:col-span-2 lg:text-center' },
];

/**
 * 알림 발송 — 공시를 메일로 받는 사람들.
 *
 * ## 메일 확인을 마쳤는지가 가장 중요한 값이다
 * 확인 전 주소로는 보내지 않는다. 남의 주소를 넣어 두고 공시 알림을 받게 하는 것을 막는
 * 장치이고, 확인 안 된 주소로 보내면 스팸 신고가 쌓여 **보내던 메일 전체가 막힌다.**
 *
 * ## 보낸 것은 거두지 못한다
 * 그래서 발송은 이 목록이 아니라 공시 화면의 게시에 붙는다 — 여기서는 받을 사람만 본다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function SubscriberListView() {
  return (
    <>
      <PageHeading title="알림 발송" description="공시 알림을 받는 구독자를 확인하세요." />

    <IrRecordTable
      title="구독자"
      description="메일 확인을 마친 주소로만 공시 알림이 갑니다."
      columns={COLUMNS}
      rows={SUBSCRIBERS}
      labelOf={(one) => one.email}
      empty="구독자가 없습니다."
      render={(one) => [
          <span key="email" className="min-w-0 truncate font-mono text-xs text-ink-muted">
            {one.email}
          </span>,
          <span key="kinds" className="min-w-0 truncate text-xs text-ink-muted">
            {one.kinds.length > 0 ? one.kinds.join(' · ') : '전체'}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.subscribedAt}
          </span>,
          <Badge key="verified" tone={one.verified ? 'ok' : 'danger'}>
            {one.verified ? '확인됨' : '확인 전'}
          </Badge>,
      ]}
      />
    </>
  );
}
