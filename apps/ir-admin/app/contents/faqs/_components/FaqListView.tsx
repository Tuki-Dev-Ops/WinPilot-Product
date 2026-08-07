'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { FAQ_GROUPS, SITE_FAQS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'group', label: '갈래', options: FAQ_GROUPS.map((one) => ({ value: one, label: one })) },
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '갈래', span: 'lg:col-span-1' },
  { label: '물음', span: 'lg:col-span-3' },
  { label: '답', span: 'lg:col-span-4' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 콘텐츠 > FAQ.
 *
 * ## 답을 목록에서도 보여 준다
 * 물음만 늘어놓으면 **같은 물음이 두 번 적혔는지** 알 수 없다. 실제로 FAQ 가 늘어나는 방식이
 * 그렇다 — 문의가 들어올 때마다 하나씩 더하다 보면 말만 다른 같은 답이 쌓인다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function FaqListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(SITE_FAQS);
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((group === ALL_VALUE || one.group === group) && (state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.question, one.answer].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="FAQ" description="자주 받는 물음과 답을 관리하세요." />

      <ListToolbar
        searchId="faq-search"
        searchLabel="물음 검색"
        searchHint="물음 · 답"
        searchValue={keyword}
        onSearchChange={setKeyword}
        filters={FILTERS}
        filterValues={{ group, state }}
        onFilterChange={(id, value) => {
          if (id === 'group') setGroup(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setGroup(ALL_VALUE);
          setState(ALL_VALUE);
        }}
        actionLabel="FAQ 등록"
        onAction={() => router.push('/contents/faqs/new')}
      />

      <IrRecordTable
        title="물음"
        description="갈래가 사이트 FAQ 화면의 왼쪽 줄이 됩니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/contents/faqs/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="사이트 FAQ 에서 사라집니다. 잠깐 내리는 것이라면 상태를 숨김으로 두세요."
        labelOf={(one) => one.question}
        empty="등록된 FAQ 가 없습니다."
        render={(one) => [
          <span key="group" className="min-w-0 truncate text-xs text-ink-muted">
            {one.group}
          </span>,
          <span key="q" className="min-w-0 truncate text-sm font-medium">
            {one.question}
          </span>,
          <span key="a" className="min-w-0 truncate text-xs text-ink-muted">
            {one.answer}
          </span>,
          <span key="state" className="flex min-w-0 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
