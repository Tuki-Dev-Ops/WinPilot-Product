import type { Metadata } from 'next';
import { Badge, PageHeading, Panel } from '@winpilot/ui';
import { MENU_CATEGORIES, MENU_ITEMS } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `menu.categories` · F&B Admin · route `/menus/categories`
 *
 * ## 순서 변경 기능을 제공하지 않는 이유
 * 고객 사이트 메뉴 목록(`/menu`)이 이 순서대로 표시된다. 카테고리 순서는 임의 배열이 아니라
 * **주문 순서**를 따른다 — 주 요리를 정하고, 곁들임을 더하고, 음료를 고른다. 순서를 변경하면
 * 실제 주문 흐름과 다른 구성이 표시된다.
 *
 * 카테고리 추가와 삭제도 제공하지 않는다. 카테고리가 늘면 고객 사이트 메뉴 목록에 영역이
 * 하나 늘고, 해당 영역에 등록된 메뉴가 없으면 **제목만 표시된다.** 화면 개선과 함께 수행한다.
 *
 * ## 본 화면의 역할
 * 카테고리별 등록 건수를 제공한다. 운영 중 가장 자주 확인하는 정보이며 목록 화면에서는
 * 개별 항목을 세어야 확인할 수 있다.
 *
 * **프론트엔드 전용** — 데이터 원본은 `@winpilot/store` 다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '메뉴', '카테고리'),
  robots: { index: false, follow: false },
};

export default function FnbCategoryListPage() {
  return (
    <FnbShell sectionId="register" trail={['등록', '메뉴', '카테고리']} activeChildId="register-menu">
      <PageHeading title="메뉴 카테고리" description="고객 사이트 메뉴 목록이 이 순서대로 표시됩니다." />

      <Panel
        title="카테고리 노출 순서"
        description="주 요리 → 곁들임 → 음료 순으로 고정합니다. 순서 변경 기능은 제공하지 않습니다."
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
                  판매중 건수와 비노출 건수를 함께 표시한다. 판매중만 표시하면 비노출 메뉴의
                  존재가 드러나지 않아 해당 메뉴를 다시 확인하지 않게 된다.
                */}
                <span className="flex shrink-0 items-center gap-2">
                  <Badge tone={selling.length > 0 ? 'ok' : 'wait'}>판매중 {selling.length}건</Badge>
                  {items.length > selling.length && (
                    <Badge tone="neutral">비노출 {items.length - selling.length}건</Badge>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </Panel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">운영 안내</Badge> 카테고리를 추가하면 고객 사이트 메뉴 목록에 영역이
        하나 늘어납니다. 등록된 메뉴가 없으면 제목만 표시되므로 화면 개선과 함께 수행합니다.
      </p>
    </FnbShell>
  );
}
