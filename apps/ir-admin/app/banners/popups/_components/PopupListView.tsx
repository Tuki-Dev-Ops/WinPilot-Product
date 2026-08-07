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
 * 배너 > 팝업.
 *
 * ## 동시에 둘을 띄우지 않는다
 * 창이 둘이면 들어온 사람이 하는 일은 **둘 다 닫는 것**이고, 그러면 정작 알리려던 것도 읽히지
 * 않는다. 기간이 겹치는 것이 있는지 목록에서 바로 보이게 기간을 한 칸에 둔다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function PopupListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  /* 프론트엔드 전용 — 지운 결과는 이 화면에만 남는다. */
  const [rows, setRows] = useState(SITE_BANNERS.filter((one) => one.slot === '팝업'));
  /* 검색어와 거르개를 함께 건다. 하나만 걸어도 나머지는 `전체` 로 남아 방해하지 않는다. */
  const shown = rows.filter((one) => {
    if (!((state === ALL_VALUE || (one.visible ? '노출' : '숨김') === state))) return false;
    const word = keyword.trim().toLowerCase();
    if (!word) return true;
    return [one.title].some((value) => String(value).toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="팝업" description="사이트에 들어오면 뜨는 창입니다." />

      <ListToolbar
        searchId="popup-search"
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
        actionLabel="팝업 등록"
        onAction={() => router.push('/banners/popups/new')}
      />

      <IrRecordTable
        title="팝업"
        description="기간이 지나면 저절로 내려갑니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/banners/popups/${one.id}`)}
        onDelete={(one) => setRows((was) => was.filter((row) => row.id !== one.id))}
        deleteNote="사이트에서 이 팝업이 더 이상 뜨지 않습니다."
        labelOf={(one) => one.title}
        empty="등록된 팝업이 없습니다."
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
