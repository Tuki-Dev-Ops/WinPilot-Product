'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { CREDENTIALS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'kind', label: '구분', options: [{ value: '특허', label: '특허' }, { value: '인증', label: '인증' }, { value: '수상', label: '수상' }] },
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

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
  const [keyword, setKeyword] = useState('');
  const [kind, setKind] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(CREDENTIALS);
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((kind === ALL_VALUE || one.kind === kind) && (state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title, one.number, one.issuer].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="특허 및 인증" description="사이트의 특허 및 인증 화면에 그대로 섭니다." />

      <ListToolbar
        searchId="credential-search"
        searchLabel="이름 검색"
        searchHint="이름 · 등록번호 · 발급 기관"
        searchValue={keyword}
        onSearchChange={setKeyword}
        filters={FILTERS}
        filterValues={{ kind, state }}
        onFilterChange={(id, value) => {
          if (id === 'kind') setKind(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setKind(ALL_VALUE);
          setState(ALL_VALUE);
        }}
        actionLabel="등록"
        onAction={() => router.push('/company/credentials/new')}
      />

      <IrRecordTable
        title="특허 · 인증"
        description="등록번호로 밖에서 조회할 수 있는 값입니다."
        columns={COLUMNS}
        rows={shown}
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
