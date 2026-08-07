'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, type ListFilterField } from '@winpilot/ui';
import { SITE_BANNERS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const FILTERS: ListFilterField[] = [
  { id: 'state', label: '상태', options: [{ value: '노출', label: '노출' }, { value: '숨김', label: '숨김' }] },
];

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-4' },
  { label: '기간', span: 'lg:col-span-4' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 배너 > 메인 비주얼.
 *
 * **기간을 반드시 적는다.** 끝을 비워 두면 행사가 끝난 뒤에도 계속 서 있고, 그 사실은 대개
 * 밖에서 먼저 발견된다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function HeroBannerListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(SITE_BANNERS.filter((one) => one.slot === '메인 비주얼'));
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="메인 비주얼" description="첫 화면 위에 기간을 갖고 서는 배너입니다." />

      <ListToolbar
        searchId="herobanner-search"
        searchLabel="제목 검색"
        searchHint="제목"
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
        actionLabel="배너 등록"
        onAction={() => router.push('/banners/new')}
      />

      <IrRecordTable
        title="배너"
        description="기간이 지나면 저절로 내려갑니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/banners/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="첫 화면에서 사라집니다."
        labelOf={(one) => one.title}
        empty="등록된 배너가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="range" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {`${one.startAt} ~ ${one.endAt}`}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
