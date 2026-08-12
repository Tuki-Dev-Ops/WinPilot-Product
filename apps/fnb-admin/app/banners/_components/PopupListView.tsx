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
import { FNB_POPUPS, bannerState, type BannerState } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '제목', span: 'lg:col-span-3' },
  { label: '내용', span: 'lg:col-span-3' },
  { label: '기간', span: 'lg:col-span-2 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/** 배너와 같은 표를 쓴다 — 상태의 뜻이 같으므로 색이 갈리면 오히려 헷갈린다. */
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
  {
    id: 'dismissible',
    label: '닫기',
    options: [
      { value: '하루 감추기', label: '하루 감추기' },
      { value: '매번 뜸', label: '매번 뜸' },
    ],
  },
];

/**
 * 배너 > 팝업.
 *
 * ## 배너와 나눠 두는 까닭
 * 둘 다 기간이 있고 둘 다 사이트에 걸리지만, **팝업은 읽는 것을 막는다.** 배너는 지나가며 보고
 * 팝업은 닫아야 다음으로 간다. 한 목록에 섞으면 그 무게 차이가 사라져, 배너 하나 올리듯 팝업이
 * 올라간다.
 *
 * ## `닫기` 를 열로 세운다
 * `오늘 하루 보지 않기` 를 끄면 그 팝업은 **올 때마다 뜬다.** 반드시 읽혀야 하는 것(휴점 ·
 * 가격 조정)에만 쓸 설정인데, 목록에서 안 보이면 실수로 켠 것이 몇 달을 간다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function PopupListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  const [dismissible, setDismissible] = useState<string>(ALL_VALUE);

  /* 화면이 열린 날 — 배너 목록과 같은 판단이다(그쪽 머리말). */
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const word = keyword.trim().toLowerCase();
  const shown = FNB_POPUPS.filter((one) => {
    if (state !== ALL_VALUE && bannerState(one, today) !== state) return false;
    if (dismissible !== ALL_VALUE && (one.dismissible ? '하루 감추기' : '매번 뜸') !== dismissible) return false;
    if (!word) return true;
    return [one.title, one.body].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="팝업" description="화면 가운데 떠서 닫아야 넘어갑니다. 꼭 읽혀야 하는 것에만 쓰세요." />

      <ListToolbar
        searchId="popup-search"
        searchLabel="팝업 검색"
        searchHint="제목 · 내용"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="팝업 등록"
        onAction={() => router.push('/banners/popups/new')}
        filters={FILTERS}
        filterValues={{ state, dismissible }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
          if (id === 'dismissible') setDismissible(value);
        }}
        onFilterReset={() => {
          setState(ALL_VALUE);
          setDismissible(ALL_VALUE);
        }}
      />

      <RecordTable
        title="팝업"
        description="여럿이 겹치면 위에 있는 것부터 뜹니다 — 셋을 넘기지 마세요."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/banners/popups/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="사이트에서 사라집니다. 다음에 또 쓸 것이라면 지우지 말고 숨김으로 두세요."
        labelOf={(one) => one.title}
        empty="조건에 맞는 팝업이 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">
              {one.dismissible ? '하루 감추기 있음' : '매번 뜸'}
            </span>
          </span>,
          <span key="body" className="min-w-0 truncate text-xs text-ink-muted">
            {one.body}
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
