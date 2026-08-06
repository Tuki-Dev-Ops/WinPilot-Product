'use client';

import { PageHeading } from '@winpilot/ui';
import { IR_DOCUMENTS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '자료', span: 'lg:col-span-5' },
  { label: '구분', span: 'lg:col-span-2' },
  { label: '올린 날', span: 'lg:col-span-2' },
  { label: '크기', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * IR 자료실.
 *
 * 파일 크기를 함께 적는다 — 투자자 화면에서도 같은 값을 보여 준다. 모바일에서 8MB 를
 * 모르고 누르는 것과 알고 누르는 것은 다르다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function LibraryListView() {
  return (
    <>
      <PageHeading title="IR 자료실" description="투자자가 내려받는 자료를 관리하세요." />

    <IrRecordTable
      title="자료"
      description="투자자 화면의 IR 자료실에 그대로 섭니다."
      columns={COLUMNS}
      rows={IR_DOCUMENTS}
      labelOf={(one) => one.title}
      empty="등록된 자료가 없습니다."
      render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="kind" className="min-w-0 truncate text-xs text-ink-muted">
            {one.kind}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.publishedAt}
          </span>,
          <span key="size" className="min-w-0 flex-1 truncate text-right text-xs tabular-nums text-ink-muted">
            {one.sizeLabel}
          </span>,
      ]}
      />
    </>
  );
}
