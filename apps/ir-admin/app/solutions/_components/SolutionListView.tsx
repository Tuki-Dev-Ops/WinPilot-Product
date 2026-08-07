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
  { label: '솔루션', span: 'lg:col-span-2' },
  { label: '문제', span: 'lg:col-span-3' },
  { label: '구성', span: 'lg:col-span-1 lg:text-center' },
  { label: '업종', span: 'lg:col-span-1 lg:text-center' },
  { label: '절차', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 솔루션 > 목록.
 *
 * 제품 목록과 같은 값을 보되 **다른 칸**을 보여 준다. 여기서 확인할 것은 상세 화면이 채워졌는지다 —
 * 구성 층과 절차가 비어 있으면 그 화면은 문단 둘로 끝난다.
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
      <PageHeading title="솔루션" description="어떤 문제를 어떻게 푸는지를 관리하세요." />

      <ListToolbar
        searchId="solution-search"
        searchLabel="솔루션명 검색"
        searchHint="솔루션명 · 문제"
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
        title="솔루션"
        description="상세 화면의 문제 · 기능 · 구성 · 업종 · 절차가 여기서 옵니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/solutions/${one.id}`)}
        labelOf={(one) => one.name}
        empty="등록된 솔루션이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0 truncate text-sm font-medium">
            Cloud {one.name}
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
