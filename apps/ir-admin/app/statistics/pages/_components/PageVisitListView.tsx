'use client';

import { PageHeading } from '@winpilot/ui';
import { PAGE_VISITS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '화면', span: 'lg:col-span-4' },
  { label: '주소', span: 'lg:col-span-4' },
  { label: '방문', span: 'lg:col-span-2 lg:text-right' },
  { label: '머문 시간', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * 통계 > 많이 방문한 페이지.
 *
 * ## 방문 수와 머문 시간을 **함께** 본다
 * 방문만 보면 홈이 늘 1등이라 아무것도 알 수 없다. 머문 시간이 짧은데 방문이 많은 화면은
 * **들어왔다 바로 나간 자리**이고, 그것이 고쳐야 할 화면이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function PageVisitListView() {
  return (
    <>
      <PageHeading title="많이 방문한 페이지" description="어느 화면이 실제로 읽히는지 봅니다." />

      <IrRecordTable
        title="페이지"
        description="머문 시간이 짧으면 들어왔다 바로 나간 것입니다."
        columns={COLUMNS}
        rows={PAGE_VISITS}
        labelOf={(one) => one.label}
        empty="집계된 방문이 없습니다."
        render={(one) => [
          <span key="label" className="min-w-0 truncate text-sm font-medium">
            {one.label}
          </span>,
          <span key="route" className="min-w-0 truncate font-mono text-xs text-ink-muted">
            {one.route}
          </span>,
          <span key="visits" className="min-w-0 truncate text-right text-sm tabular-nums">
            {one.visits.toLocaleString('ko-KR')}
          </span>,
          <span key="stay" className="min-w-0 flex-1 truncate text-right font-mono text-xs tabular-nums text-ink-muted">
            {`${Math.floor(one.staySeconds / 60)}분 ${one.staySeconds % 60}초`}
          </span>,
        ]}
      />
    </>
  );
}
