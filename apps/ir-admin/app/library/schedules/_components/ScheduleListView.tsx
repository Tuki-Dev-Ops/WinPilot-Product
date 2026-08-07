'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { IR_SCHEDULES } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '일정', span: 'lg:col-span-5' },
  { label: '구분', span: 'lg:col-span-2' },
  { label: '일자', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-2 lg:text-center' },
];

/**
 * IR 일정.
 *
 * 지난 일정을 지우지 않는다 — 언제 무엇을 했는지가 다음 일정을 정할 때 쓰인다. 대신 지난
 * 것을 배지로 갈라, 투자자 화면에 서는 것(앞으로 올 일정)과 구분한다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function ScheduleListView() {
  return (
    <>
      <PageHeading title="IR 일정" description="실적발표와 기업설명회 일정을 관리하세요." />

    <IrRecordTable
      title="일정"
      description="앞으로 올 일정만 투자자 화면에 섭니다."
      columns={COLUMNS}
      rows={IR_SCHEDULES}
      labelOf={(one) => one.title}
      empty="등록된 일정이 없습니다."
      render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">{one.note || '메모 없음'}</span>
          </span>,
          <span key="kind" className="min-w-0 truncate text-xs text-ink-muted">
            {one.kind}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.at}
          </span>,
          <Badge key="state" tone={one.at >= '2026-08-06' ? 'brand' : 'neutral'}>
            {one.at >= '2026-08-06' ? '예정' : '지남'}
          </Badge>,
      ]}
      />
    </>
  );
}
