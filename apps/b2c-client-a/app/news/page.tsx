import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `news.list` · B2C Client (템플릿 A) · route `/news` */
export const metadata: Metadata = { title: `${COPY.news.listTitle} — ${CONTENT.seo.title}` };

export default function NewsListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.news.listTitle} />
      {CONTENT.news.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.news.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {CONTENT.news.map((item) => (
            <article key={item.id} className="flex flex-col gap-2 rounded-xl border border-border px-6 py-5">
              <p className="font-mono text-xs tabular-nums text-ink-faint">{item.publishedAt}</p>
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300"
                >
                  {COPY.news.readOriginal}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
