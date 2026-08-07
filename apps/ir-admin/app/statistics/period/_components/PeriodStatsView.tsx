'use client';

import { PageHeading } from '@winpilot/ui';
import { VISIT_TREND } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '달', span: 'lg:col-span-3' },
  { label: '방문', span: 'lg:col-span-3 lg:text-right' },
  { label: '문의', span: 'lg:col-span-3 lg:text-right' },
  { label: '문의율', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * 통계 > 기간별 분석.
 *
 * ## 방문 옆에 문의를 둔다
 * 방문만 세면 늘었다는 것 말고는 알 수 없다. **방문이 늘어도 문의가 늘지 않으면** 사람은 왔는데
 * 화면이 설득하지 못한 것이고, 그때 손대야 하는 것은 광고가 아니라 화면이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function PeriodStatsView() {
  return (
    <>
      <PageHeading title="기간별 분석" description="달마다의 방문과 문의를 나란히 봅니다." />

      <IrRecordTable
        title="월별"
        description="방문이 늘어도 문의가 늘지 않으면 화면이 설득하지 못한 것입니다."
        columns={COLUMNS}
        rows={VISIT_TREND}
        labelOf={(one) => one.month}
        empty="집계된 기간이 없습니다."
        render={(one) => [
          <span key="month" className="min-w-0 truncate font-mono text-sm tabular-nums">
            {one.month}
          </span>,
          <span key="visits" className="min-w-0 truncate text-right text-sm tabular-nums">
            {one.visits.toLocaleString('ko-KR')}
          </span>,
          <span key="inq" className="min-w-0 truncate text-right text-sm tabular-nums text-ink-muted">
            {`${one.inquiries}건`}
          </span>,
          <span key="rate" className="min-w-0 flex-1 truncate text-right font-mono text-xs tabular-nums text-ink-muted">
            {`${((one.inquiries / one.visits) * 100).toFixed(2)}%`}
          </span>,
        ]}
      />
    </>
  );
}
