'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { LEGAL_DOCS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '문서', span: 'lg:col-span-5' },
  { label: '주소', span: 'lg:col-span-4' },
  { label: '상태', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 홈페이지 > 약관 · 방침.
 *
 * ## 왜 목록만 있고 편집기가 없는가
 * 약관은 채워 넣는 순간 **효력을 주장할 문서**가 되고, 개인정보 처리방침은 적힌 것과 서버가
 * 실제로 하는 일이 어긋나면 그대로 법 위반이다. 그래서 이 화면에서 본문을 바로 쓰게 두지
 * 않는다 — 검토를 마친 원고를 받아 넣는 자리가 따로 생겨야 한다.
 *
 * 지금 여기서 하는 일은 **어느 문서가 아직 준비 중인지 한눈에 두는 것**이다. 사이트는
 * `준비중` 인 동안 준비하고 있다는 사실과 물어볼 곳만 보여 준다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `LEGAL_DOCS` 다.
 */
export function LegalListView() {
  return (
    <>
      <PageHeading title="약관 · 방침" description="사이트 푸터 맨 윗줄이 이 두 문서를 가리킵니다." />

      <IrRecordTable
        title="문서"
        description="본문은 법무 검토를 마친 원고를 받아 넣습니다."
        columns={COLUMNS}
        rows={LEGAL_DOCS}
        labelOf={(one) => one.label}
        empty="등록된 문서가 없습니다."
        render={(one) => [
          <span key="label" className="min-w-0 truncate text-sm font-medium">
            {one.label}
          </span>,
          <span key="href" className="min-w-0 truncate font-mono text-xs text-ink-muted">
            {one.href}
          </span>,
          <span key="state" className="flex min-w-0 flex-1 justify-end">
            <Badge tone={one.published ? 'ok' : 'wait'}>{one.published ? '공개' : '준비중'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
