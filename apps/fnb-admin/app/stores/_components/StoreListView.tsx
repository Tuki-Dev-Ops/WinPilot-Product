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
import { STORES, STORE_REGIONS } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '매장', span: 'lg:col-span-2' },
  { label: '지역', span: 'lg:col-span-1 lg:text-center' },
  { label: '주소', span: 'lg:col-span-3' },
  { label: '영업시간', span: 'lg:col-span-1' },
  { label: '되는 것', span: 'lg:col-span-1' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 상태별 표 색.
 *
 * `준비중` 을 회색으로 두지 않는다 — 휴점과 구분되지 않기 때문이다. 곧 여는 매장은 **알릴 것이
 * 있는 상태**이고 휴점은 감출 것이 있는 상태라, 둘이 같은 색이면 목록에서 갈리지 않는다.
 */
const STATE_TONE = { 영업중: 'ok', 준비중: 'wait', 휴점: 'neutral' } as const;

const FILTERS: ListFilterField[] = [
  { id: 'region', label: '지역', options: STORE_REGIONS.map((one) => ({ value: one, label: one })) },
  {
    id: 'state',
    label: '상태',
    options: (['영업중', '준비중', '휴점'] as const).map((one) => ({ value: one, label: one })),
  },
];

/**
 * 매장 > 목록.
 *
 * ## 휴점 매장이 여기에는 남는다
 * 사이트(`publicStores()`)에서는 빠지지만 어드민 목록에는 선다. 다시 여는 일이 실제로 있고,
 * 목록에서까지 사라지면 **그 매장의 주소와 번호를 어디서도 찾을 수 없다.**
 *
 * ## 전화번호 대신 영업시간을 세운다
 * 목록에서 자주 확인하는 것은 번호가 아니라 **여는 시간**이다 — 손님이 전화로 묻는 것이 그것이고,
 * 준비중 매장에는 번호가 아예 없다. 번호는 상세에 있다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function StoreListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = STORES.filter((one) => {
    if (region !== ALL_VALUE && one.region !== region) return false;
    if (state !== ALL_VALUE && one.state !== state) return false;
    if (!word) return true;
    return [one.name, one.address].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="매장" description="사이트 매장 찾기에 서는 것과 영업 정보를 관리하세요." />

      <ListToolbar
        searchId="store-search"
        searchLabel="매장 검색"
        searchHint="매장명 · 주소"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="가맹점 등록"
        onAction={() => router.push('/stores/new')}
        filters={FILTERS}
        filterValues={{ region, state }}
        onFilterChange={(id, value) => {
          if (id === 'region') setRegion(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setRegion(ALL_VALUE);
          setState(ALL_VALUE);
        }}
      />

      <RecordTable
        title="매장"
        description="휴점 매장은 사이트에서만 빠지고 이 목록에는 남습니다 — 다시 열 때 필요합니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/stores/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="주소와 번호가 함께 사라집니다. 잠시 닫는 것이라면 지우지 말고 상세에서 휴점으로 바꾸세요."
        labelOf={(one) => one.name}
        empty="조건에 맞는 매장이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="region" className="flex min-w-0 justify-center text-sm">
            {one.region}
          </span>,
          <span key="address" className="min-w-0 truncate text-xs text-ink-muted">
            {one.address}
          </span>,
          <span key="hours" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.hours}
          </span>,
          <span key="features" className="min-w-0 truncate text-xs text-ink-muted">
            {one.features.length > 0 ? one.features.join(' · ') : '—'}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={STATE_TONE[one.state]}>{one.state}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
