'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { MEDIA_CLIPS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-4' },
  { label: '갈래', span: 'lg:col-span-3' },
  { label: '무늬', span: 'lg:col-span-1' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 콘텐츠 > 뉴스.
 *
 * ## 제목에 검증되는 사실을 적지 않는다
 * 여기 적은 것이 그대로 회사 홈페이지에 실리고, 그 홈페이지는 IR 자료로도 읽힌다. 수상·수출
 * 실적처럼 **확인되는 숫자**를 제목으로 적으면 그것이 허위 기재가 될 수 있다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function NewsListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(MEDIA_CLIPS);
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title, one.channel].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="뉴스" description="방송·행사·제품 소개로 남은 것들입니다." />

      <ListToolbar
        searchId="news-search"
        searchLabel="제목 검색"
        searchHint="제목 · 갈래"
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
        actionLabel="뉴스 등록"
        onAction={() => router.push('/contents/news/new')}
      />

      <IrRecordTable
        title="뉴스"
        description="목록의 차례대로 사이트에 섭니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/contents/news/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="홈 마지막 칸과 CS CENTER 뉴스에서 함께 사라집니다."
        labelOf={(one) => one.title}
        empty="등록된 뉴스가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="channel" className="min-w-0 truncate text-xs text-ink-muted">
            {one.channel}
          </span>,
          <span key="seed" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.seed}
          </span>,
          <span key="state" className="flex min-w-0 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
