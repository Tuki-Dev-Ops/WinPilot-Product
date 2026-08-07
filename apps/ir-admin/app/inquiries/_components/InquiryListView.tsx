'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { SITE_INQUIRIES, SITE_INQUIRY_KINDS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'state', label: '상태', options: [{ value: '접수', label: '접수' }, { value: '처리중', label: '처리중' }, { value: '답변완료', label: '답변완료' }, { value: '보류', label: '보류' }] },
  { id: 'kind', label: '갈래', options: SITE_INQUIRY_KINDS.map((one) => ({ value: one, label: one })) },
];

const COLUMNS = [
  { label: '문의', span: 'lg:col-span-4' },
  { label: '보낸 곳', span: 'lg:col-span-2' },
  { label: '받은 때', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/** 상태마다 다른 톤. 색만으로 알리지 않도록 글자도 함께 바뀐다. */
const STATE_TONE = { 접수: 'wait', 처리중: 'brand', 답변완료: 'ok', 보류: 'neutral' } as const;

/**
 * 문의 > 목록.
 *
 * ## 상태를 오른쪽 끝에 둔다
 * 훑을 때 찾는 것은 **아직 답하지 않은 것**이다. 상태가 가운데 있으면 줄마다 눈이 멈추는
 * 자리가 달라져, 끝까지 읽어야 몇 건이 남았는지 안다. 한 세로선 위에 세워 두면 그 줄만
 * 따라 내려가면 된다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function InquiryListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  const [kind, setKind] = useState<string>(ALL_VALUE);
  const waiting = SITE_INQUIRIES.filter((one) => one.state !== '답변완료').length;

  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = SITE_INQUIRIES.filter((one) => {
    if (!((state === ALL_VALUE || one.state === state) && (kind === ALL_VALUE || one.kind === kind))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.company, one.name, one.message, one.region].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="문의" description={`아직 답하지 않은 것이 ${waiting}건입니다.`} />

      <ListToolbar
        searchId="inquiry-search"
        searchLabel="회사명 검색"
        searchHint="회사명 · 담당자 · 내용"
        searchValue={keyword}
        onSearchChange={setKeyword}
        filters={FILTERS}
        filterValues={{ state, kind }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
          if (id === 'kind') setKind(value);
        }}
        onFilterReset={() => {
          setState(ALL_VALUE);
          setKind(ALL_VALUE);
        }}
      />

      <IrRecordTable
        title="문의"
        description="사이트의 문의 양식으로 들어온 것입니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/inquiries/${one.id}`)}
        labelOf={(one) => one.message}
        empty="들어온 문의가 없습니다."
        render={(one) => [
          <span key="body" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.message}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">
              {one.kind}
              {one.attachment && ` · ${one.attachment}`}
            </span>
          </span>,
          <span key="from" className="min-w-0">
            <span className="block min-w-0 truncate text-sm">{one.company}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">
              {one.region} · {one.name}
            </span>
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.receivedAt}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={STATE_TONE[one.state]}>{one.state}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
