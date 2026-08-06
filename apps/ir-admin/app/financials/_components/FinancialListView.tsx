'use client';

import { PageHeading } from '@winpilot/ui';
import { FINANCIALS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '기간', span: 'lg:col-span-2' },
  { label: '매출', span: 'lg:col-span-2 lg:text-right' },
  { label: '영업이익', span: 'lg:col-span-2 lg:text-right' },
  { label: '당기순이익', span: 'lg:col-span-2 lg:text-right' },
  { label: '자산', span: 'lg:col-span-2 lg:text-right' },
  { label: '부채', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 재무 정보.
 *
 * ## 단위를 백만 원으로 둔다
 * 원 단위로 두면 자릿수가 열둘이 넘어 **표에서 견줄 수가 없다.** 투자자 화면도 같은 단위를
 * 쓰므로(값이 한 곳이다) 여기서 바꾸면 그쪽도 함께 바뀐다.
 *
 * ## 분기와 연간을 한 목록에 둔다
 * 갈라 두면 "작년 대비" 를 보려고 두 화면을 함께 열게 된다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function FinancialListView() {
  return (
    <>
      <PageHeading title="재무 정보" description="투자자 화면에 나가는 요약 재무를 확인하세요." />

    <IrRecordTable
      title="재무 요약"
      description="단위는 백만 원입니다. 투자자 화면의 재무 정보와 같은 값을 읽습니다."
      columns={COLUMNS}
      rows={FINANCIALS.map((one) => ({ ...one, id: one.period }))}
      labelOf={(one) => one.period}
      empty="등록된 재무 정보가 없습니다."
      render={(one) => [
          <span key="period" className="min-w-0 truncate text-sm font-medium">
            {one.period}
          </span>,
          <span key="revenue" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums">
            {one.revenue.toLocaleString('ko-KR')}
          </span>,
          <span key="op" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums">
            {one.operatingProfit.toLocaleString('ko-KR')}
          </span>,
          <span key="net" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums">
            {one.netProfit.toLocaleString('ko-KR')}
          </span>,
          <span key="assets" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums text-ink-muted">
            {one.assets.toLocaleString('ko-KR')}
          </span>,
          <span key="liab" className="min-w-0 flex-1 truncate text-right text-sm tabular-nums text-ink-muted">
            {one.liabilities.toLocaleString('ko-KR')}
          </span>,
      ]}
      />
    </>
  );
}
