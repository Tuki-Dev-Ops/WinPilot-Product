import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  MENU_ITEMS,
  findMenuCategory,
  findMenuItem,
  formatPrice,
  publicMenuItems,
} from '@winpilot/store';
import { FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { MenuCard } from '@/app/_components/MenuCard';
import { SpicyMark } from '@/app/_components/SpicyMark';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * Feature: `menu.detail` · F&B Client (템플릿 A) · route `/menu/{itemId}`
 *
 * ## 이 화면이 답하는 것은 알레르기다
 * 메뉴판에서 이미 이름 · 값 · 한 줄 설명을 읽었다. 그럼에도 눌러 들어오는 사람은 **더 알아야 할
 * 것이 있는 사람**이고, 외식에서 그것은 대개 알레르기와 열량이다. 그래서 그 둘이 가장 크게 선다.
 *
 * ## 내려 둔 메뉴도 주소로는 열린다
 * `publicMenuItems()` 로 거르지 않고 `findMenuItem()` 으로 찾는다. 품절된 메뉴의 주소를 이미
 * 아는 사람(즐겨찾기 · 공유받은 링크)에게 404 를 보이면 **없어진 것인지 주소가 틀린 것인지**
 * 알 수 없다. 대신 화면 위에 지금 팔지 않는다고 적는다.
 *
 * 미리 만들어 두는 경로는 파는 것만이다(`generateStaticParams`) — 내려 둔 것까지 만들어 두면
 * 그 화면이 검색에 걸린다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ itemId: string }>;
}): Promise<Metadata> {
  const { itemId } = await params;
  const item = findMenuItem(itemId);
  return { title: item?.name ?? '메뉴' };
}

/** 프론트엔드 전용 — 파는 메뉴만 미리 만든다. */
export function generateStaticParams() {
  return publicMenuItems().map((one) => ({ itemId: one.id }));
}

export default async function MenuDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = findMenuItem(itemId);
  if (!item) notFound();

  const category = findMenuCategory(item.categoryId);
  /* 같은 묶음의 다른 것들. 자기 자신과 내려 둔 것은 뺀다. */
  const siblings = MENU_ITEMS.filter(
    (one) => one.categoryId === item.categoryId && one.id !== item.id && one.visible,
  );

  return (
    <FnbSiteShell back={{ href: FNB_ROUTES.menu, label: '메뉴' }}>
      <div className="flex flex-col gap-12">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <span className="flex aspect-4/3 w-full items-center justify-center rounded-2xl bg-surface">
            <span aria-hidden className="text-7xl font-black text-ink-faint">
              {item.name.slice(0, 1)}
            </span>
          </span>

          <div className="flex flex-col gap-5">
            {category && <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{category.name}</p>}

            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <p className="font-mono text-xl tabular-nums">{formatPrice(item.price)}</p>
            </div>

            {/*
              지금 팔지 않는 것을 화면 위쪽에 적는다. 아래에 적으면 값과 설명을 다 읽은 뒤에
              알게 되고, 그때는 이미 매장에 갈 마음을 먹은 뒤다.
            */}
            {!item.visible && (
              <p className="rounded-xl bg-surface px-5 py-4 text-sm leading-relaxed text-ink-muted">
                지금은 팔지 않는 메뉴입니다. 계절 메뉴는 때가 되면 다시 냅니다.
              </p>
            )}

            <p className="text-base leading-loose text-ink-muted">{item.description}</p>

            {(item.tags.length > 0 || item.spicy) && (
              <ul className="flex flex-wrap items-center gap-2">
                {item.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-ink-muted">
                    {tag}
                  </li>
                ))}
                {/* 카드와 같은 표식을 쓴다. 여기는 흰 바탕이라 검은 딱지 대신 테두리로 선다. */}
                {item.spicy && (
                  <li>
                    <SpicyMark level={item.spicy} tone="plain" />
                  </li>
                )}
              </ul>
            )}

            <dl className="mt-2 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              <Fact label="열량" value={`${item.kcal} kcal`} note="1인분 기준" />
              <Fact
                label="알레르기 유발 재료"
                value={item.allergens.length > 0 ? item.allergens.join(' · ') : '해당 없음'}
                note="조리 기구를 함께 써 미량이 섞일 수 있습니다"
              />
            </dl>
          </div>
        </section>

        {siblings.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              같은 {category?.name ?? '카테고리'}
            </h2>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((one) => (
                <li key={one.id}>
                  <MenuCard item={one} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </FnbSiteShell>
  );
}

/** 값 한 칸. `note` 에 **어느 조건의 값인지**를 적는다 — 열량과 알레르기 둘 다 조건이 붙는다. */
function Fact({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-1.5 bg-canvas px-6 py-5">
      <dt className="text-xs uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className="text-sm font-semibold leading-relaxed">{value}</dd>
      <p className="text-xs leading-relaxed text-ink-faint">{note}</p>
    </div>
  );
}
