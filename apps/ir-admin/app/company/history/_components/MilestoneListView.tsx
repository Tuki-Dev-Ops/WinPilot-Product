'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { MILESTONES, milestoneDate, sortMilestones } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '때', span: 'lg:col-span-2' },
  { label: '한 일', span: 'lg:col-span-6' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 회사 > 연혁.
 *
 * ## 최신순으로 둔다
 * 사이트가 최신순으로 그리므로 여기서도 그 차례다. 어드민만 오래된 순으로 두면 **맨 위에서 본
 * 줄이 사이트에서는 맨 아래**에 있어, 방금 고친 것을 확인하러 갈 때마다 끝까지 내려가야 한다.
 *
 * ## 숨긴 것도 보여 준다
 * 사이트에는 `visible` 인 것만 서지만 여기서는 전부 보인다 — 숨긴 줄이 목록에서도 사라지면
 * 다시 켤 방법이 없다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `MILESTONES` 이고, B2C 어드민의
 * 회사 > 연혁이 같은 것을 고친다.
 */
export function MilestoneListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(sortMilestones(MILESTONES));

  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title, one.description, one.year].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="연혁" description={`${rows.length}건 중 ${rows.filter((one) => one.visible).length}건이 사이트에 서 있습니다.`} />

      <ListToolbar
        searchId="milestone-search"
        searchLabel="제목 검색"
        searchHint="제목 · 설명 · 연도"
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
        actionLabel="연혁 등록"
        onAction={() => router.push('/company/history/new')}
      />

      <IrRecordTable
        title="연혁"
        description="사이트의 연혁 화면에 최신순으로 섭니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/company/history/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="사이트 연혁에서 사라집니다. B2C 쇼핑몰의 회사 소개에서도 함께 사라집니다."
        labelOf={(one) => one.title}
        empty="등록된 연혁이 없습니다."
        render={(one) => [
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {milestoneDate(one)}
          </span>,
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            {one.description && (
              <span className="block min-w-0 truncate text-xs text-ink-faint">{one.description}</span>
            )}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
