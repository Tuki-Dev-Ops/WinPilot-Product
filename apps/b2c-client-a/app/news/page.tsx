import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `news.list` · B2C Client (템플릿 A) · route `/news`
 *
 * ## 어드민 연동
 * - 목록 ← `b2c-admin` 콘텐츠 > 뉴스 (`/contents/news`)
 * - 어드민에서는 **요약과 원문 링크**만 관리한다 — 본문 전체는 언론사 쪽에 있다
 * - 숨김(`visible: false`)으로 둔 뉴스는 여기 오지 않는다
 */
export const metadata: Metadata = { title: `${COPY.news.listTitle} — ${CONTENT.seo.title}` };

export default function NewsListPage() {
  return (
    <SiteShell>
      <SupportShell>
        <SupportHeading title={COPY.news.listTitle} />

        {CONTENT.news.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.news.empty}</p>
        ) : (
          <div className="flex flex-col">
            {CONTENT.news.map((item) => (
              <a
                key={item.id}
                href={ROUTES.newsDetail(item.id)}
                className="flex items-center gap-3 border-b border-border px-1 py-4 hover:bg-surface"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{item.publishedAt}</span>
              </a>
            ))}
          </div>
        )}
      </SupportShell>
    </SiteShell>
  );
}
