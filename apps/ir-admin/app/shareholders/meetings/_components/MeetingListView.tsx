'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { MEETINGS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '총회', span: 'lg:col-span-4' },
  { label: '일자', span: 'lg:col-span-2' },
  { label: '안건', span: 'lg:col-span-3' },
  { label: '전자투표', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 주주총회.
 *
 * 안건을 한 줄로 줄여 싣는다 — 목록에서 필요한 것은 **언제 · 무엇을 다루는가**이고, 안건
 * 전문은 투자자 화면의 소집 공고가 맡는다.
 *
 * 전자투표 여부를 따로 적는 이유: 그것이 있으면 주주가 현장에 오지 않아도 되고, 없으면
 * 와야 한다. 목록에서 갈리지 않으면 문의로 들어온다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function MeetingListView() {
  return (
    <>
      <PageHeading title="주주총회" description="소집 공고와 안건을 확인하세요." />

    <IrRecordTable
      title="주주총회"
      description="투자자 화면의 주주총회와 같은 값을 읽습니다."
      columns={COLUMNS}
      rows={MEETINGS}
      labelOf={(one) => one.title}
      empty="등록된 주주총회가 없습니다."
      render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">{one.place}</span>
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.heldAt}
          </span>,
          <span key="agenda" className="min-w-0 truncate text-xs text-ink-muted">
            {one.agenda.join(' · ')}
          </span>,
          <span key="vote" className="min-w-0 truncate text-xs text-ink-muted">
            {one.electronicVote ? '가능' : '없음'}
          </span>,
          <Badge key="state" tone={one.state === '예정' ? 'brand' : 'neutral'}>
            {one.state}
          </Badge>,
      ]}
      />
    </>
  );
}
