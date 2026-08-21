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
import { MENU_CATEGORIES, MENU_ITEMS, formatPrice } from '@winpilot/store';

/**
 * 묶음 코드 → 이름.
 *
 * `findMenuCategory()` 를 줄마다 부르면 배열을 돌면서 그 안에서 다시 배열을 훑는다. 양쪽 다
 * 모듈 상수라 **앱이 뜰 때 한 번** 만들면 된다.
 */
const CATEGORY_NAME = new Map(MENU_CATEGORIES.map((one) => [one.id, one.name]));

/**
 * `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다.
 *
 * 값 칸이 두 칸이다. 한 칸일 때 `68,000원` 이 **줄바꿈으로 꺾였다** — 메뉴가 만 원짜리 국밥일
 * 때는 한 칸으로 됐는데 통문어 값이 들어오면서 넘쳤다. 알레르기에서 한 칸을 넘긴다: 거기는
 * 말이 잘려도 뜻이 남지만(`문어 · 대두 …`), 값은 **잘리면 다른 숫자**가 된다.
 */
const COLUMNS: RecordColumn[] = [
  { label: '메뉴', span: 'lg:col-span-2' },
  { label: '카테고리', span: 'lg:col-span-1' },
  { label: '값', span: 'lg:col-span-2 lg:text-right' },
  { label: '알레르기', span: 'lg:col-span-2' },
  { label: '표', span: 'lg:col-span-1' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

const FILTERS: ListFilterField[] = [
  {
    id: 'category',
    label: '카테고리',
    options: MENU_CATEGORIES.map((one) => ({ value: one.id, label: one.name })),
  },
  {
    id: 'state',
    label: '상태',
    options: [
      { value: '판매중', label: '판매중' },
      { value: '내림', label: '내림' },
    ],
  },
];

/**
 * 메뉴 > 목록.
 *
 * ## 알레르기를 목록에 세운다
 * 상세에만 두어도 되는 값이지만 목록에 세운다. **빠뜨린 줄을 찾는 일**이 이 화면에서 가장 자주
 * 하는 일이기 때문이다 — 표시 의무가 있는 값이고, 빠뜨리면 손님이 다친다. 스무 줄을 하나씩
 * 열어 확인하게 두면 아무도 확인하지 않는다.
 *
 * 비어 있는 줄은 `없음` 이라 적는다. 빈 칸으로 두면 **해당 없음**인지 **안 적은 것**인지
 * 알 수 없다.
 *
 * ## 지울 수 있다
 * 창업 문의와 달리 메뉴는 우리가 만든 값이라 지울 수 있다. 다만 대개는 지우지 않고 내린다 —
 * 지우면 다시 팔 때 처음부터 적어야 한다. 그래서 확인 창 문구에 그 말을 넣는다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function MenuListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = MENU_ITEMS.filter((one) => {
    if (category !== ALL_VALUE && one.categoryId !== category) return false;
    if (state !== ALL_VALUE && (one.visible ? '판매중' : '내림') !== state) return false;
    if (!word) return true;
    return [one.name, one.description].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="메뉴" description="사이트 메뉴판에 서는 것과 값·알레르기를 관리하세요." />

      <ListToolbar
        searchId="menu-search"
        searchLabel="메뉴 검색"
        searchHint="메뉴명 · 설명"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="메뉴 등록"
        onAction={() => router.push('/menus/new')}
        filters={FILTERS}
        filterValues={{ category, state }}
        onFilterChange={(id, value) => {
          if (id === 'category') setCategory(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setCategory(ALL_VALUE);
          setState(ALL_VALUE);
        }}
      />

      <RecordTable
        title="메뉴"
        description="알레르기가 빈 줄이 있는지 이 목록에서 확인하세요 — 표시 의무가 있는 값입니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/menus/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="사이트 메뉴판에서 사라지고 값도 함께 지워집니다. 잠시 안 파는 것이라면 지우지 말고 상세에서 내려 두세요."
        labelOf={(one) => one.name}
        empty="조건에 맞는 메뉴가 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="cat" className="min-w-0 truncate text-sm text-ink-muted">
            {CATEGORY_NAME.get(one.categoryId) ?? '—'}
          </span>,
          <span key="price" className="min-w-0 whitespace-nowrap text-right font-mono text-sm tabular-nums lg:block">
            {formatPrice(one.price)}
          </span>,
          <span
            key="allergens"
            className={`min-w-0 truncate text-xs ${one.allergens.length > 0 ? 'text-ink-muted' : 'text-ink-faint'}`}
          >
            {one.allergens.length > 0 ? one.allergens.join(' · ') : '없음'}
          </span>,
          /*
            표와 매운 정도를 한 칸에 적는다. 열을 하나 더 내면 `col-span` 합이 아홉을 넘어 표가
            어긋나고, 둘 다 **사이트 카드의 같은 자리**(사진 위 왼쪽)에 서는 값이라 함께 읽는
            편이 맞다.
          */
          <span key="tags" className="min-w-0 truncate text-xs text-ink-muted">
            {[...one.tags, ...(one.spicy ? [`매움 ${one.spicy}`] : [])].join(' · ') || '—'}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '판매중' : '내림'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
