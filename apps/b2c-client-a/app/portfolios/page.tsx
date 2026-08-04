import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `portfolio.list` · B2C Client (템플릿 A) · route `/portfolios` */
export const metadata: Metadata = { title: `${COPY.portfolio.listTitle} — ${CONTENT.seo.title}` };

export default function PortfolioListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.portfolio.listTitle} />
      {CONTENT.portfolios.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.portfolio.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CONTENT.portfolios.map((item) => (
            <article key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-border">
              <div className="flex aspect-[16/9] items-center justify-center bg-surface">
                <span className="text-xs text-ink-faint">{item.title}</span>
              </div>
              <div className="flex flex-col gap-2 px-6 py-5">
                <p className="text-xs text-ink-faint">
                  {item.client} · {item.period}
                </p>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <RichBody html={item.body} />
              </div>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
