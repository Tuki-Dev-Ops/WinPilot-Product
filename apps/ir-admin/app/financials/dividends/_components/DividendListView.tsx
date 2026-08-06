'use client';

import { PageHeading } from '@winpilot/ui';
import { DIVIDENDS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '사업연도', span: 'lg:col-span-2' },
  { label: '주당 배당금', span: 'lg:col-span-2 lg:text-right' },
  { label: '배당성향', span: 'lg:col-span-2 lg:text-right' },
  { label: '시가배당률', span: 'lg:col-span-2 lg:text-right' },
  { label: '기준일', span: 'lg:col-span-2' },
  { label: '지급일', span: 'lg:col-span-1' },
];

/**
 * 배당 정보.
 *
 * 기준일과 지급일을 함께 적는다 — 투자자가 가장 많이 묻는 것이 **언제까지 사면 받는가**이고,
 * 그 답이 기준일이다. 지급일만 적어 두면 그 물음에 답하지 못한다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function DividendListView() {
  return (
    <>
      <PageHeading title="배당 정보" description="사업연도별 배당과 기준일을 확인하세요." />

    <IrRecordTable
      title="배당"
      description="투자자 화면의 배당 정보와 같은 값을 읽습니다."
      columns={COLUMNS}
      rows={DIVIDENDS.map((one) => ({ ...one, id: one.year }))}
      labelOf={(one) => `${one.year} 배당`}
      empty="등록된 배당 정보가 없습니다."
      render={(one) => [
          <span key="year" className="min-w-0 truncate text-sm font-medium">
            {one.year}
          </span>,
          <span key="per" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums">
            {one.perShare.toLocaleString('ko-KR')}원
          </span>,
          <span key="payout" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums text-ink-muted">
            {one.payoutRatio}%
          </span>,
          <span key="yield" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums text-ink-muted">
            {one.yieldRate}%
          </span>,
          <span key="record" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.recordDate}
          </span>,
          <span key="pay" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.payDate}
          </span>,
      ]}
      />
    </>
  );
}
