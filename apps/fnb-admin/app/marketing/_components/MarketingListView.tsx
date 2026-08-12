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
import { MARKETING_CHANNELS, MARKETING_POSTS } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '창구', span: 'lg:col-span-1 lg:text-center' },
  { label: '제목', span: 'lg:col-span-3' },
  { label: '설명', span: 'lg:col-span-3' },
  { label: '올린 날', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 창구 이름을 한 번만 만들어 둔다.
 *
 * 줄마다 `findMarketingChannel()` 을 부르면 글 하나당 창구 목록을 처음부터 훑는다. 지금은 둘
 * 뿐이라 티가 안 나지만, 이 표는 **글이 늘어나는 표**다.
 */
const CHANNEL_NAME = new Map(MARKETING_CHANNELS.map((one) => [one.id, one.name]));

const FILTERS: ListFilterField[] = [
  {
    id: 'channel',
    label: '창구',
    options: MARKETING_CHANNELS.map((one) => ({ value: one.id, label: one.name })),
  },
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
 * 등록 > 마케팅.
 *
 * ## 사이트의 마케팅 화면이 이 목록을 그대로 건다
 * 창구를 고르면 그 창구의 글이 사진 카드로 선다(`ChannelFeed`). 여기서 숨긴 글은 거기서
 * 사라지고, 올린 날이 늦은 것부터 위에 선다.
 *
 * ## 창구가 첫 칸이다
 * 이 목록에서 가장 먼저 판단하는 것이 그것이다 — 인스타에 올릴 글과 블로그에 쓸 글은 길이도
 * 말투도 다르고, 실제로 쓰는 사람이 갈리는 일도 있다.
 *
 * ## 올린 날을 손으로 적는다
 * 저장한 시각을 자동으로 박지 않는다. 실제 창구에 올린 날과 여기 등록한 날이 **다른 것이
 * 보통**이라(먼저 올리고 나중에 옮겨 적는다), 자동으로 박으면 사이트의 차례가 실제와 어긋난다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function MarketingListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [channel, setChannel] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = MARKETING_POSTS.filter((one) => {
    if (channel !== ALL_VALUE && one.channelId !== channel) return false;
    if (state !== ALL_VALUE && (one.visible ? '공개' : '숨김') !== state) return false;
    if (!word) return true;
    return [one.title, one.desc].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="마케팅" description="사이트 마케팅 화면에 서는 글입니다. 창구별로 나뉘어 걸립니다." />

      <ListToolbar
        searchId="marketing-search"
        searchLabel="글 검색"
        searchHint="제목 · 설명"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="글 등록"
        onAction={() => router.push('/marketing/new')}
        filters={FILTERS}
        filterValues={{ channel, state }}
        onFilterChange={(id, value) => {
          if (id === 'channel') setChannel(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setChannel(ALL_VALUE);
          setState(ALL_VALUE);
        }}
      />

      <RecordTable
        title="올린 글"
        description="숨김으로 두면 사이트에서 빠집니다. 지우는 것과 달리 되돌릴 수 있습니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/marketing/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="사이트에서 사라집니다. 잠시 내리는 것이라면 지우지 말고 숨김으로 두세요."
        labelOf={(one) => one.title}
        empty="조건에 맞는 글이 없습니다."
        render={(one) => [
          <span key="channel" className="flex min-w-0 justify-center">
            <Badge tone={one.channelId === 'instagram' ? 'brand' : 'neutral'}>
              {CHANNEL_NAME.get(one.channelId) ?? one.channelId}
            </Badge>
          </span>,
          <span key="title" className="min-w-0 truncate text-sm font-medium">
            {one.title}
          </span>,
          <span key="desc" className="min-w-0 truncate text-xs text-ink-muted">
            {one.desc}
          </span>,
          <span key="date" className="flex min-w-0 justify-center font-mono text-xs tabular-nums text-ink-muted">
            {one.postedOn}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'neutral'}>{one.visible ? '공개' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
