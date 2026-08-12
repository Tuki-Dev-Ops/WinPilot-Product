'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_VALUE,
  Badge,
  ListToolbar,
  PageHeading,
  RecordTable,
  type ListFilterField,
  type RecordColumn,
} from '@winpilot/ui';
import { FNB_NOTICES } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '올린 날', span: 'lg:col-span-1' },
  { label: '제목', span: 'lg:col-span-3' },
  { label: '본문', span: 'lg:col-span-3' },
  { label: '고정', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

const FILTERS: ListFilterField[] = [
  {
    id: 'state',
    label: '상태',
    options: [
      { value: '공개', label: '공개' },
      { value: '숨김', label: '숨김' },
    ],
  },
];

/**
 * 콘텐츠 > 공지사항.
 *
 * ## 본문을 목록에 세운다
 * 제목만 세우면 **무엇을 알린 글인지**를 열어 봐야 안다. 이 브랜드의 공지는 가격 조정 · 개점 ·
 * 휴점처럼 한 줄로 요약되는 것들이라, 앞머리만 보여도 대부분 판단이 끝난다.
 *
 * ## 고정을 목록에서 확인한다
 * 고정한 글이 둘 이상이면 사이트에서 **무엇이 먼저인지 사라진다.** 목록에서 세어야 그것이 보인다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function NoticeListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = FNB_NOTICES.filter((one) => {
    if (state !== ALL_VALUE && (one.visible ? '공개' : '숨김') !== state) return false;
    if (!word) return true;
    return [one.title, one.body].some((value) => value.toLowerCase().includes(word));
  });

  const pinned = FNB_NOTICES.filter((one) => one.pinned && one.visible);

  return (
    <>
      <PageHeading title="공지사항" description="손님이 사이트에서 읽는 글입니다." />

      <ListToolbar
        searchId="notice-search"
        searchLabel="공지 검색"
        searchHint="제목 · 본문"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="공지 등록"
        onAction={() => router.push('/support/notices/new')}
        filters={FILTERS}
        filterValues={{ state }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => setState(ALL_VALUE)}
      />

      {/*
        고정이 둘 이상이면 알린다. 사이트에서는 둘 다 맨 위에 서서 **무엇이 먼저인지**가
        사라지는데, 그 사실은 사이트를 열어 봐야만 보인다.
      */}
      {pinned.length > 1 && (
        <p className="rounded-xl bg-surface px-6 py-4 text-sm leading-relaxed text-ink-muted">
          맨 위에 고정한 글이 {pinned.length}개입니다. 둘 이상이면 사이트에서 무엇을 먼저 읽어야 하는지가
          사라집니다 — 하나만 남기시길 권합니다.
        </p>
      )}

      <RecordTable
        title="공지사항"
        description="고정한 글이 사이트 맨 위에 섭니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/support/notices/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="사이트에서 사라집니다. 지난 공지를 남겨 두려면 지우지 말고 숨김으로 두세요."
        labelOf={(one) => one.title}
        empty="조건에 맞는 공지가 없습니다."
        render={(one) => [
          <span key="date" className="min-w-0 font-mono text-xs tabular-nums text-ink-muted">
            {one.postedOn}
          </span>,
          <span key="title" className="min-w-0 truncate text-sm font-medium">
            {one.title}
          </span>,
          <span key="body" className="min-w-0 truncate text-xs text-ink-muted">
            {one.body}
          </span>,
          <span key="pin" className="flex min-w-0 justify-center text-xs text-ink-muted">
            {one.pinned ? '맨 위' : '—'}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'neutral'}>{one.visible ? '공개' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
