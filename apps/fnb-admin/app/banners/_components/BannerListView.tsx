'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_VALUE,
  Badge,
  ListToolbar,
  PageHeading,
  RecordTable,
  type BadgeTone,
  type ListFilterField,
  type RecordColumn,
} from '@winpilot/ui';
import { FNB_BANNERS, bannerState, type BannerState } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '제목', span: 'lg:col-span-3' },
  { label: '한 줄', span: 'lg:col-span-3' },
  { label: '기간', span: 'lg:col-span-2 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 상태별 표 색.
 *
 * `예정` 을 회색으로 두지 않는다 — 숨김과 구분되지 않기 때문이다. 곧 걸릴 배너는 **기다리는
 * 상태**이고 숨김은 사람이 내려 둔 상태라, 둘이 같은 색이면 목록에서 갈리지 않는다.
 */
const STATE_TONE: Record<BannerState, BadgeTone> = {
  '노출 중': 'ok',
  예정: 'wait',
  종료: 'neutral',
  숨김: 'neutral',
};

const FILTERS: ListFilterField[] = [
  {
    id: 'state',
    label: '상태',
    options: (['노출 중', '예정', '종료', '숨김'] as const).map((one) => ({ value: one, label: one })),
  },
];

/**
 * 배너 > 메인 비주얼.
 *
 * ## 상태를 사람이 켜지 않고 날짜가 정한다
 * `노출 중` 을 손으로 켜고 끄게 두면 개점 행사가 끝난 다음 날 **아무도 안 끈다.** 시작·종료를
 * 적어 두면 그날이 지나는 순간 저절로 내려간다(`bannerState`).
 *
 * 그래도 `숨김` 은 따로 있다 — 기간과 상관없이 지금 당장 내려야 하는 일이 있다.
 *
 * ## 오늘을 화면이 정해서 넘긴다
 * `bannerState()` 안에서 `new Date()` 를 부르지 않는다. 이 콘솔은 미리 만들어 두는 화면이라
 * 그 값이 **빌드한 날에 굳는다** — 오늘이 지나도 어제 상태가 그대로 서 있게 된다.
 *
 * 지금은 화면이 여는 순간을 쓴다. 값이 서버에서 오게 되는 날에는 서버 시각이 그 자리에 온다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function BannerListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);

  /* 화면이 열린 날. 렌더마다 새 값을 만들지 않으려면 상태로 한 번만 잡아 둔다. */
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const word = keyword.trim().toLowerCase();
  const shown = FNB_BANNERS.filter((one) => {
    if (state !== ALL_VALUE && bannerState(one, today) !== state) return false;
    if (!word) return true;
    return [one.title, one.subtitle].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="메인 비주얼" description="사이트 첫 화면에 걸리는 배너입니다. 기간이 지나면 저절로 내려갑니다." />

      <ListToolbar
        searchId="banner-search"
        searchLabel="배너 검색"
        searchHint="제목 · 한 줄"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="배너 등록"
        onAction={() => router.push('/banners/main/new')}
        filters={FILTERS}
        filterValues={{ state }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => setState(ALL_VALUE)}
      />

      <RecordTable
        title="배너"
        description="기간이 겹치면 위에 있는 것부터 섭니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/banners/main/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="첫 화면에서 사라집니다. 다음에 또 쓸 배너라면 지우지 말고 숨김으로 두세요."
        labelOf={(one) => one.title}
        empty="조건에 맞는 배너가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0 truncate text-sm font-medium">
            {one.title}
          </span>,
          <span key="sub" className="min-w-0 truncate text-xs text-ink-muted">
            {one.subtitle || '—'}
          </span>,
          <span key="period" className="flex min-w-0 justify-center font-mono text-xs tabular-nums text-ink-muted">
            {one.startAt} ~ {one.endAt || '상시'}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={STATE_TONE[bannerState(one, today)]}>{bannerState(one, today)}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
