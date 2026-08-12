import type { Metadata } from 'next';
import { Badge, PageHeading, Panel } from '@winpilot/ui';
import { MENU_CATEGORIES, MENU_ITEMS } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `menu.categories` · F&B Admin · route `/menus/categories`
 *
 * ## 여기서 순서를 바꾸지 못하게 둔 이유
 * 메뉴판이 이 순서대로 세로로 이어 붙는다(`/menu`). 그런데 이 넷의 차례는 취향이 아니라
 * **먹는 순서**다 — 숙회나 볶음으로 주된 것을 정하고, 곁들임을 더하고, 마실 것을 고른다.
 * 순서를 바꾸면 메뉴판이 없는 흐름을 그린다.
 *
 * 묶음을 늘리고 줄이는 일도 여기서 하지 않는다. 묶음이 하나 늘면 메뉴판의 칸이 하나 늘고,
 * 그 칸에 넣을 메뉴가 없으면 **빈 제목만 선다.** 화면을 함께 손볼 때 코드에서 한다.
 *
 * ## 그러면 이 화면은 무엇을 하나
 * 묶음마다 **몇 가지가 서 있는지**를 보여 준다. 이것이 실제로 자주 묻는 것이다 — 곁들임이 셋뿐인
 * 것을 아는 사람은 메뉴 담당자뿐이고, 그 사실은 목록을 훑어야만 보인다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '메뉴', '묶음'),
  robots: { index: false, follow: false },
};

export default function FnbCategoryListPage() {
  return (
    <FnbShell sectionId="register" trail={['등록', '메뉴', '묶음']} activeChildId="register-menu">
      <PageHeading title="메뉴 묶음" description="메뉴판이 이 순서대로 세로로 이어 붙습니다." />

      <Panel
        title="먹는 순서"
        description="주된 것 → 곁들임 → 마실 것. 순서를 바꾸는 자리는 두지 않습니다."
        aside={<Badge tone="neutral">읽기 전용</Badge>}
      >
        <ol className="flex flex-col">
          {MENU_CATEGORIES.map((category, index) => {
            const items = MENU_ITEMS.filter((one) => one.categoryId === category.id);
            const selling = items.filter((one) => one.visible);

            return (
              <li
                key={category.id}
                className="flex flex-wrap items-start gap-4 border-b border-border px-6 py-4 last:border-b-0"
              >
                <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{category.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{category.note}</span>
                </span>

                {/*
                  파는 것과 전체를 함께 적는다. 파는 것만 적으면 **내려 둔 것이 있다는 사실**이
                  사라지고, 그때 그 메뉴는 아무도 다시 열지 않는다.
                */}
                <span className="flex shrink-0 items-center gap-2">
                  <Badge tone={selling.length > 0 ? 'ok' : 'wait'}>{selling.length}가지 판매중</Badge>
                  {items.length > selling.length && (
                    <Badge tone="neutral">{items.length - selling.length}가지 내림</Badge>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </Panel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 묶음을 늘리면 메뉴판에 칸이 하나 늘어납니다. 넣을 메뉴가
        없으면 빈 제목만 서게 되므로, 늘리는 일은 화면을 함께 손볼 때 합니다.
      </p>
    </FnbShell>
  );
}
