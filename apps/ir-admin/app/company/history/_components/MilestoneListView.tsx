'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { MILESTONES, milestoneDate, sortMilestones } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '때', span: 'lg:col-span-2' },
  { label: '한 일', span: 'lg:col-span-8' },
  { label: '상태', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * 회사 > 연혁.
 *
 * ## 최신순으로 둔다
 * 사이트가 최신순으로 그리므로 여기서도 그 차례다. 어드민만 오래된 순으로 두면 **맨 위에서 본
 * 줄이 사이트에서는 맨 아래**에 있어, 방금 고친 것을 확인하러 갈 때마다 끝까지 내려가야 한다.
 *
 * ## 숨긴 것도 보여 준다
 * 사이트에는 `visible` 인 것만 서지만 여기서는 전부 보인다 — 숨긴 줄이 목록에서도 사라지면
 * 다시 켤 방법이 없다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `MILESTONES` 이고, B2C 어드민의
 * 회사 > 연혁이 같은 것을 고친다.
 */
export function MilestoneListView() {
  const rows = sortMilestones(MILESTONES);
  const shown = rows.filter((one) => one.visible).length;

  return (
    <>
      <PageHeading title="연혁" description={`${rows.length}건 중 ${shown}건이 사이트에 서 있습니다.`} />

      <IrRecordTable
        title="연혁"
        description="사이트의 연혁 화면에 최신순으로 섭니다."
        columns={COLUMNS}
        rows={rows}
        labelOf={(one) => one.title}
        empty="등록된 연혁이 없습니다."
        render={(one) => [
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {milestoneDate(one)}
          </span>,
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            {one.description && (
              <span className="block min-w-0 truncate text-xs text-ink-faint">{one.description}</span>
            )}
          </span>,
          <span key="state" className="flex min-w-0 flex-1 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
