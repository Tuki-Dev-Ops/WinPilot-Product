'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { OFFICERS, SHAREHOLDERS } from '@winpilot/store';
import { IrPanel } from '@/app/_components/IrPanel';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const OFFICER_COLUMNS = [
  { label: '이름', span: 'lg:col-span-3' },
  { label: '직위', span: 'lg:col-span-3' },
  { label: '경력', span: 'lg:col-span-3' },
  { label: '구분', span: 'lg:col-span-2 lg:text-center' },
];

/**
 * 지배구조 — 이사회와 주주 구성.
 *
 * ## 사외이사를 따로 표시한다
 * 지배구조에서 투자자가 가장 먼저 읽는 값이다. 이름만 늘어놓으면 사내인지 사외인지 알 수
 * 없고, 그 비율이 곧 이사회의 독립성으로 읽힌다.
 *
 * ## 지분은 합이 100 이 되게 적는다
 * 최대주주·특수관계인·기관·소액주주 넷으로 나눠 **합이 맞는지가 화면에서 보이게** 한다.
 * 남는 자리를 적지 않으면 나머지가 어디 있는지 묻는 문의가 들어온다.
 */
export function GovernanceListView() {
  const total = SHAREHOLDERS.reduce((sum, one) => sum + one.share, 0);

  return (
    <>
      <PageHeading title="지배구조" description="이사회 구성과 주주 현황을 확인하세요." />

      <IrRecordTable
        title="이사회"
        description="투자자 화면의 지배구조와 같은 값을 읽습니다."
        columns={OFFICER_COLUMNS}
        rows={OFFICERS.map((one) => ({ ...one, id: one.name }))}
        labelOf={(one) => one.name}
        empty="등록된 임원이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0 truncate text-sm font-medium">
            {one.name}
          </span>,
          <span key="title" className="min-w-0 truncate text-sm text-ink-muted">
            {one.title}
          </span>,
          <span key="career" className="min-w-0 truncate text-xs text-ink-faint">
            {one.career}
          </span>,
          <Badge key="kind" tone={one.outside ? 'brand' : 'neutral'}>
            {one.outside ? '사외' : '사내'}
          </Badge>,
        ]}
      />

      <IrPanel
        title="주주 구성"
        description="합이 100% 가 되게 적습니다. 남는 자리를 비우면 나머지가 어디 있는지 묻게 됩니다."
        aside={
          <span
            className={`shrink-0 whitespace-nowrap text-sm tabular-nums ${
              Math.abs(total - 100) < 0.05 ? 'text-ink-muted' : 'font-medium text-signal-danger'
            }`}
          >
            합 {total.toFixed(1)}%
          </span>
        }
      >
        <div className="flex flex-col">
          {SHAREHOLDERS.map((one) => (
            <div key={one.name} className="flex flex-col gap-2 border-b border-border px-6 py-4 last:border-b-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 truncate text-sm">
                  {one.name}
                  <span className="ml-2 text-xs text-ink-faint">{one.kind}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">{one.share}%</span>
              </div>
              {/* 막대는 실제 요소라 추출된다 — 숫자만 두면 비율이 눈에 들어오지 않는다. */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${one.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </IrPanel>
    </>
  );
}
