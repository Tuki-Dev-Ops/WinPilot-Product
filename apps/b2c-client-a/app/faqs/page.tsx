import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `faq.list` · B2C Client (템플릿 A) · route `/faqs` */
export const metadata: Metadata = { title: `${COPY.faq.listTitle} — ${CONTENT.seo.title}` };

export default function FaqListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.faq.listTitle} />
      {CONTENT.faqs.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.faq.empty}</p>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border">
          {CONTENT.faqs.map((faq) => (
            <details key={faq.id} className="border-b border-border last:border-b-0">
              <summary className="flex cursor-pointer items-center gap-3 px-6 py-4">
                <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                  {faq.categoryName}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium">{faq.question}</span>
              </summary>
              <div className="border-t border-border bg-surface px-6 py-4">
                <RichBody html={faq.answer} />
              </div>
            </details>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
