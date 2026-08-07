'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, PageHeading } from '@winpilot/ui';
import { CREDENTIALS } from '@winpilot/store';
import { IrCreateLink } from '@/app/_components/IrForm';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '구분', span: 'lg:col-span-1' },
  { label: '이름', span: 'lg:col-span-3' },
  { label: '번호', span: 'lg:col-span-2' },
  { label: '발급', span: 'lg:col-span-1' },
  { label: '취득일', span: 'lg:col-span-1' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 회사 > 특허 및 인증.
 *
 * 번호를 고정폭(`font-mono`)으로 둔다 — 자릿수가 눈으로 맞아야 다른 번호와 견줄 수 있고,
 * 여기 오는 사람의 절반은 **번호를 들고 와서** 맞는지 본다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function CredentialListView() {
  const router = useRouter();
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(CREDENTIALS);
  return (
    <>
      <PageHeading title="특허 및 인증" description="사이트의 특허 및 인증 화면에 그대로 섭니다." />

      <IrRecordTable
        title="특허 · 인증"
        aside={<IrCreateLink href="/company/credentials/new">등록</IrCreateLink>}
        description="등록번호로 밖에서 조회할 수 있는 값입니다."
        columns={COLUMNS}
        rows={rows}
        onOpen={(one) => router.push(`/company/credentials/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="사이트의 특허 및 인증 화면에서 사라집니다."
        labelOf={(one) => one.title}
        empty="등록된 특허·인증이 없습니다."
        render={(one) => [
          <span key="kind" className="min-w-0 truncate text-xs text-ink-muted">
            {one.kind}
          </span>,
          <span key="title" className="min-w-0 truncate text-sm font-medium">
            {one.title}
          </span>,
          <span key="number" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.number}
          </span>,
          <span key="issuer" className="min-w-0 truncate text-xs text-ink-muted">
            {one.issuer}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.acquiredAt}
          </span>,
          <span key="state" className="flex min-w-0 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
