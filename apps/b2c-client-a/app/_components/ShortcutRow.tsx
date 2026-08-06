'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * 바로가기 타일 줄 — **어느 화면 폭에서도 한 줄**이다.
 *
 * 좁은 화면에서 줄바꿈이 일어나면 타일이 두세 줄로 쌓여 히어로 바로 아래가 빽빽해지고,
 * 그만큼 신상품 구획이 화면 밖으로 밀린다. 그래서 넘치는 것은 접지 않고 **다음 장**으로 넘긴다.
 *
 * **가로 스크롤바를 쓰지 않는다.** 스크롤바는 브라우저마다 모양이 다르고 터치 기기에서는
 * 아예 보이지 않아 "더 있다" 가 전달되지 않는다. 장 단위로 밀고 아래에 점으로 표시한다
 * (상품 줄의 `PagedProductRow` 와 같은 규칙).
 *
 * 한 장에 몇 개를 놓을지는 화면 폭이 정한다. 서버에서는 **전부 한 줄**로 그리고(넓은 화면 기준),
 * 브라우저에 올라온 뒤 좁으면 줄인다 — 처음부터 좁게 그리면 넓은 화면에서 서버가 그린 것과
 * 어긋난다.
 *
 * ## 어드민 연동
 * - 앞쪽 타일의 분류 ← `b2c-admin` 상품 > 카테고리 (`/products/categories`)
 * - 뒤쪽 타일(신상품·베스트·공지 등)은 화면 자체를 가리키므로 어드민 값이 아니다
 */
export type ShortcutTile = { id: string; label: string; href: string; icon: ReactNode };

/** 화면 폭별로 한 장에 놓는 개수. 타일이 이보다 적으면 그대로 한 장이다. */
const PER_PAGE = { mobile: 4, tablet: 6, desktop: 10 };

export function ShortcutRow({ tiles, label }: { tiles: ShortcutTile[]; label: string }) {
  const [perPage, setPerPage] = useState(PER_PAGE.desktop);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 639px)');
    const medium = window.matchMedia('(max-width: 1023px)');

    const sync = () => {
      setPerPage(narrow.matches ? PER_PAGE.mobile : medium.matches ? PER_PAGE.tablet : PER_PAGE.desktop);
      // 장 수가 줄면 보고 있던 장이 사라질 수 있다 — 첫 장으로 되돌린다.
      setPage(0);
    };

    sync();
    narrow.addEventListener('change', sync);
    medium.addEventListener('change', sync);
    return () => {
      narrow.removeEventListener('change', sync);
      medium.removeEventListener('change', sync);
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(tiles.length / perPage));
  const safePage = Math.min(page, pageCount - 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <nav aria-label={label} className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safePage * 100}%)` }}
        >
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <div key={pageIndex} className="flex w-full shrink-0 items-start justify-center gap-x-4 sm:gap-x-6">
              {tiles.slice(pageIndex * perPage, (pageIndex + 1) * perPage).map((tile) => (
                <a
                  key={tile.id}
                  href={tile.href}
                  className="group flex w-16 shrink-0 flex-col items-center gap-2 sm:w-20"
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-surface text-ink transition-colors duration-150 group-hover:bg-border sm:size-16">
                    {tile.icon}
                  </span>
                  <span className="w-full min-w-0 truncate text-center text-xs text-ink">{tile.label}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              aria-label={`${pageIndex + 1}번째 묶음 보기`}
              aria-current={pageIndex === safePage}
              onClick={() => setPage(pageIndex)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                pageIndex === safePage ? 'w-5 bg-ink' : 'w-1.5 bg-border-strong'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
