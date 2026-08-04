import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { ProductArt } from '@/app/_components/ProductArt';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `portfolio.list` · B2C Client (템플릿 A) · route `/portfolios`
 *
 * **상품 목록과 같은 격자**를 쓴다(`grid-cols-2 lg:grid-cols-4`). 둘 다 '여럿을 훑어 하나를
 * 고르는' 화면이라 배치가 달라야 할 이유가 없고, 다르게 두면 카드 크기와 여백이 화면마다
 * 갈라진다.
 *
 * 카드에는 **사진 · 제목 · 설명 두 줄**만 둔다. 본문 전체를 넣으면 카드 높이가 제각각이 되어
 * 격자가 흐트러지고, 어차피 훑는 단계에서는 다 읽지 않는다. 두 줄을 넘는 것은 `...` 로 자른다.
 *
 * ## 어드민 연동
 * - 목록 · 제목 · 본문 ← `b2c-admin` 콘텐츠 > 포트폴리오 (`/contents/portfolios`)
 * - 고객사 · 기간은 등록 폼의 같은 이름 항목이다
 * - 카드 설명은 본문에서 서식을 걷어낸 평문이다 (계약 단계의 `summary`)
 * - 사진이 없으면 상품 카드와 같은 벡터 그림을 그린다
 */
export const metadata: Metadata = { title: `${COPY.portfolio.listTitle} — ${CONTENT.seo.title}` };

export default function PortfolioListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.portfolio.listTitle} />

      {CONTENT.portfolios.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.portfolio.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CONTENT.portfolios.map((item) => (
            <article key={item.id} className="group flex w-full flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-lg bg-surface">
                <ProductArt
                  kind={item.art.kind}
                  from={item.art.from}
                  to={item.art.to}
                  ink={item.art.ink}
                  className="size-full transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="truncate text-xs text-ink-faint">
                  {item.client} · {item.period}
                </p>
                {/* 제목도 두 줄까지만 — 길이가 제각각이라 자르지 않으면 카드 높이가 들쭉날쭉해진다. */}
                <h2 className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</h2>
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
