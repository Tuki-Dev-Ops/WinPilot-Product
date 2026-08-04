import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COPY } from '@winpilot/client-content';
import { Markdown } from '@/app/_components/Markdown';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { DOC_TITLES, docTitle, listDocs, readDoc } from '@/lib/docs';

/**
 * 문서 화면 — `/path`, `/ia` 처럼 **문서 이름이 곧 주소**다.
 *
 * 이 라우트는 마지막에 놓인다: `/products` 같은 실제 화면이 먼저 매칭되고,
 * 남는 한 마디 주소만 여기로 온다. 등록된 문서가 아니면 404 다.
 */
export const metadata: Metadata = { title: COPY.docs.title };

export function generateStaticParams() {
  return Object.keys(DOC_TITLES).map((doc) => ({ doc }));
}

export default async function DocPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const source = readDoc(doc);
  if (!source) notFound();

  const docs = listDocs();

  return (
    <SiteShell>
      <PageTitle title={docTitle(doc)} description={COPY.docs.intro} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <nav className="flex w-full shrink-0 flex-col gap-1 lg:w-56">
          {docs.map((entry) => (
            <a
              key={entry.slug}
              href={`/${entry.slug}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                entry.slug === doc
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'text-ink-muted'
              }`}
            >
              {entry.title}
            </a>
          ))}
        </nav>

        <article className="min-w-0 flex-1">
          <Markdown source={source} />
        </article>
      </div>
    </SiteShell>
  );
}
