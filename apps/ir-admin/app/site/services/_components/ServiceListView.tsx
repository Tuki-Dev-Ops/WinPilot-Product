'use client';

import { PageHeading } from '@winpilot/ui';
import { SITE_SERVICES } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '차례', span: 'lg:col-span-1' },
  { label: '서비스', span: 'lg:col-span-3' },
  { label: '소개', span: 'lg:col-span-5' },
  { label: '가는 곳', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 홈페이지 > 서비스.
 *
 * ## 순서를 첫 칸에 세우는 이유
 * 홈 화면의 회전 무대가 **이 순서대로 시계 방향으로** 방을 놓는다. 목록에서 순서를 바꾸면
 * 그림의 흐름(컨설팅 → 인프라 → MES → ERP → CRM → DXP)이 함께 바뀌므로, 순서가 값의 하나라는
 * 것이 첫 칸에서 보여야 한다.
 *
 * ## 소개는 두 줄까지다
 * 홈에서 두 줄이 한 문단으로 붙어 선다. 세 줄을 적으면 문단이 길어져 그 아래 단추가 화면
 * 밖으로 밀린다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `SITE_SERVICES` 이고, 투자자 화면이
 * 같은 것을 읽는다.
 */
export function ServiceListView() {
  return (
    <>
      <PageHeading title="서비스" description="홈 화면의 회전 무대에 서는 여섯 가지입니다." />

      <IrRecordTable
        title="서비스"
        description="목록의 순서가 곧 홈 화면에서 도는 차례입니다."
        columns={COLUMNS}
        rows={SITE_SERVICES}
        labelOf={(one) => one.name}
        empty="등록된 서비스가 없습니다."
        render={(one) => [
          <span key="no" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-faint">
            {one.no}
          </span>,
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="body" className="min-w-0">
            {one.body.map((line) => (
              <span key={line} className="block min-w-0 truncate text-xs text-ink-muted">
                {line}
              </span>
            ))}
          </span>,
          <span key="href" className="min-w-0 flex-1 truncate text-right font-mono text-xs text-ink-muted">
            {one.href}
          </span>,
        ]}
      />
    </>
  );
}
