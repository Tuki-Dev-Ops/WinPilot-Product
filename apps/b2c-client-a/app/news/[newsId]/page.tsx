import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT, COPY, ROUTES, SLOT, cid, findNews } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `news.detail` · B2C Client (템플릿 A) · route `/news/{newsId}`
 *
 * 뉴스 본문은 어드민에서 평문으로 넣는다 — 원문은 언론사 쪽에 있고 여기 있는 것은 요약이라
 * 서식을 붙일 자리가 아니다. 원문 링크는 새 창으로 연다.
 *
 * ## 어드민 연동
 * - 요약 · 원문 링크 ← 콘텐츠 > 뉴스 상세 (`/contents/news/[newsId]`)
 */
export const metadata: Metadata = { title: `${COPY.news.listTitle} — ${CONTENT.seo.title}` };

export function generateStaticParams() {
  return CONTENT.news.map((item) => ({ newsId: item.id }));
}

export default async function NewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = await params;
  const item = findNews(newsId);
  if (!item) notFound();

  return (
    <SiteShell>
      <SupportShell>
        <SupportHeading title={item.title} meta={item.publishedAt} backHref={ROUTES.news} />

        <article
          id={SLOT.articleBody}
          data-ssot-cid={cid('news.detail', 'SiteNewsBody')}
          className="text-sm leading-relaxed text-ink-muted"
        >
          {item.body}
        </article>

        <div className="flex flex-wrap gap-3">
          {item.linkUrl && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white"
            >
              {COPY.news.readOriginal}
            </a>
          )}
        </div>
      </SupportShell>
    </SiteShell>
  );
}
