'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { SITE_NOTICES, SITE_NOTICE_GROUPS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'group', label: '갈래', options: SITE_NOTICE_GROUPS.map((one) => ({ value: one, label: one })) },
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-4' },
  { label: '갈래', span: 'lg:col-span-1' },
  { label: '올린 날', span: 'lg:col-span-2' },
  { label: '고정', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 콘텐츠 > 공지사항.
 *
 * ## 고정을 셋까지로 본다
 * 고정한 것이 넷을 넘으면 **고정의 뜻이 없어진다** — 맨 위 네 줄이 전부 고정이면 그냥 목록이다.
 * 화면이 막지는 않되, 몇 개가 고정되어 있는지를 표에서 바로 보이게 둔다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function NoticeListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(SITE_NOTICES);
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((group === ALL_VALUE || one.group === group) && (state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title, ...one.body].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="공지사항" description="사이트에 서는 공지를 관리하세요." />

      <ListToolbar
        searchId="notice-search"
        searchLabel="제목 검색"
        searchHint="제목 · 내용"
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
        actionLabel="공지 등록"
        onAction={() => router.push('/contents/notices/new')}
      />

      <IrRecordTable
        title="공지"
        description="고정한 것이 맨 위에 섭니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/contents/notices/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="사이트 공지사항 목록에서 사라집니다. 되돌릴 수 없습니다."
        labelOf={(one) => one.title}
        empty="등록된 공지가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="group" className="min-w-0 truncate text-xs text-ink-muted">
            {one.group}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.postedAt}
          </span>,
          <span key="pin" className="flex min-w-0 justify-center">
            {one.pinned ? <Badge tone="brand">고정</Badge> : <span className="text-xs text-ink-faint">—</span>}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
