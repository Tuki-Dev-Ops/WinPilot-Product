'use client';

import { useState } from 'react';
import { MENU_CATEGORIES, publicMenuItems } from '@winpilot/store';
import { AsidePicker } from '@/app/_components/AsidePicker';
import { MenuCard } from '@/app/_components/MenuCard';

/**
 * 손님에게 보이는 메뉴 — **모듈이 처음 불릴 때 한 번만** 추린다.
 *
 * `publicMenuItems()` 는 부를 때마다 새 배열을 만든다. 렌더 안에서 부르면 묶음을 바꿀 때마다
 * 그 일이 되풀이되는데, **이 목록은 고른 묶음에 따라 달라지지 않는다.**
 */
const ITEMS = publicMenuItems();

/**
 * 비어 있지 않은 묶음만, 각각 몇 가지인지와 함께.
 *
 * 빈 묶음을 세우지 않는 이유: 눌렀을 때 빈 화면이 나오면 없어진 줄 안다. 개수는 고르기 전에
 * 읽히므로 한 번만 세어 둔다 — 렌더 안에서 세면 묶음을 바꿀 때마다 넷을 돌면서 메뉴 전체를
 * 다시 훑는다.
 */
const CHOICES = MENU_CATEGORIES.map((one) => ({
  id: one.id,
  label: one.name,
  count: ITEMS.filter((each) => each.categoryId === one.id).length,
})).filter((one) => one.count > 0);

/**
 * 메뉴판 — **왼쪽에 묶음, 오른쪽에 그 묶음의 메뉴.**
 *
 * ## 세로로 이어 붙이던 것을 갈랐다
 * 한때 묶음 넷을 세로로 이어 붙여 훑어 내리면 전부가 지나가게 두었다. 그때 걱정한 것은 **전체가
 * 몇 가지인지 모르게 되는 것**이었는데, 그 물음은 기둥에 개수를 적어 답한다(`AsidePicker`) —
 * 오히려 스무 줄을 다 지나야 알던 것이 이제 첫 화면에 다 있다.
 *
 * 갈라 두면 곁들임만 보러 온 사람이 숙회 셋을 지나지 않는다. 메뉴판에서 실제로 하는 일이
 * 처음부터 끝까지 읽는 것이 아니라 **한 묶음을 고르는 것**이라 그렇다.
 *
 * ## 묶음 설명이 카드 위에 선다
 * `주문을 받고 삶습니다` 같은 한 줄은 그 묶음에만 해당한다. 기둥에 함께 적으면 기둥이
 * 길어져 고르는 자리가 아니게 되고, 카드 아래로 내리면 다 읽은 뒤에 만난다.
 *
 * ## 내려 둔 메뉴는 없는 것처럼 둔다
 * 품절과 계절 메뉴는 `publicMenuItems()` 가 걸러 낸다. 흐리게라도 세워 두면 손님이 **주문할 수
 * 있는 줄 알고** 매장에 가서 알게 된다.
 */
export function MenuBoard() {
  const [categoryId, setCategoryId] = useState(CHOICES[0]?.id ?? '');
  const category = MENU_CATEGORIES.find((one) => one.id === categoryId);
  const items = ITEMS.filter((one) => one.categoryId === categoryId);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <AsidePicker choices={CHOICES} picked={categoryId} onPick={setCategoryId} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {category?.note && <p className="text-sm leading-relaxed text-ink-muted">{category.note}</p>}

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((one) => (
            <li key={one.id}>
              <MenuCard item={one} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
