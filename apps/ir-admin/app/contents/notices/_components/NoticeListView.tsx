'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { SITE_NOTICES } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-5' },
  { label: '갈래', span: 'lg:col-span-1' },
  { label: '올린 날', span: 'lg:col-span-2' },
  { label: '고정', span: 'lg:col-span-2 lg:text-center' },
  { label: '상태', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * 콘텐츠 > 공지사항.
 *
 * ## 고정을 셋까지로 본다
 * 고정한 것이 넷을 넘으면 **고정의 뜻이 없어진다** — 맨 위 네 줄이 전부 고정이면 그냥 목록이다.
 * 화면이 막지는 않되, 몇 개가 고정되어 있는지를 표에서 바로 보이게 둔다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function NoticeListView() {
  return (
    <>
      <PageHeading title="공지사항" description="사이트에 서는 공지를 관리하세요." />

      <IrRecordTable
        title="공지"
        description="고정한 것이 맨 위에 섭니다."
        columns={COLUMNS}
        rows={SITE_NOTICES}
        labelOf={(one) => one.title}
        empty="등록된 공지가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="group" className="min-w-0 truncate text-xs text-ink-muted">
            {one.group}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.postedAt}
          </span>,
          <span key="pin" className="flex min-w-0 justify-center">
            {one.pinned ? <Badge tone="brand">고정</Badge> : <span className="text-xs text-ink-faint">—</span>}
          </span>,
          <span key="state" className="flex min-w-0 flex-1 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
