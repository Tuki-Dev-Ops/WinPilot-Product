'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { SOLUTIONS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '제품', span: 'lg:col-span-2' },
  { label: '문제', span: 'lg:col-span-3' },
  { label: '구성', span: 'lg:col-span-1 lg:text-center' },
  { label: '업종', span: 'lg:col-span-1 lg:text-center' },
  { label: '절차', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 문제 · 해법 > 목록.
 *
 * 제품 목록과 같은 값을 보되 **다른 칸**을 보여 준다. 여기서 확인할 것은 상세 화면이 채워졌는지다 —
 * 구성 층과 절차가 비어 있으면 그 화면은 문단 둘로 끝난다.
 *
 * ## 갈래 이름이 `솔루션` 이 아닌 이유
 * 사이트에서 SOLUTION 은 **서비스 둘**을 뜻하게 되었다. 같은 말로 여기에 제품 넷을 세워 두면
 * 운영자가 서비스 문구를 고치러 왔다가 제품 넷을 보게 된다. 그 갈림은 `서비스` 갈래가 맡고,
 * 여기는 하는 일을 그대로 이름으로 쓴다(`ir-menu.ts`).
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function SolutionListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = SOLUTIONS.filter((one) => {
    if (!((state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.name, one.problem].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="문제 · 해법" description="제품 넷이 어떤 문제를 어떻게 푸는지를 관리하세요." />

      <ListToolbar
        searchId="solution-search"
        searchLabel="제품명 검색"
        searchHint="제품명 · 문제"
        searchValue={keyword}
        onSearchChange={setKeyword}
        filters={FILTERS}
        filterValues={{ state }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setState(ALL_VALUE);
        }}
      />

      <IrRecordTable
        title="문제 · 해법"
        description="상세 화면의 문제 · 기능 · 구성 · 업종 · 절차가 여기서 옵니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/solutions/${one.id}`)}
        labelOf={(one) => one.title}
        empty="등록된 제품이 없습니다."
        render={(one) => [
          /* 화면에 서는 이름은 `title` 이 갖는다 — `Cloud ${name}` 을 만들어 쓰지 않는다(store 머리말). */
          <span key="name" className="min-w-0 truncate text-sm font-medium">
            {one.title}
          </span>,
          <span key="problem" className="min-w-0 truncate text-xs text-ink-muted">
            {one.problem}
          </span>,
          <span key="layers" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.layers.length}층</Badge>
          </span>,
          <span key="ind" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.industries.length}개</Badge>
          </span>,
          <span key="steps" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.steps.length}단계</Badge>
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
