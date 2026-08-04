import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COPY } from '@winpilot/client-content';
import { DocShell } from '@/app/_components/DocShell';
import { Markdown } from '@/app/_components/Markdown';
import { DOC_GROUPS, listGroupDocs, readDoc } from '@/lib/docs';
import { pages } from '@/pages.manifest';

/**
 * 묶음 안의 문서 한 장 — `/feature/products` · `/page-view/cart`.
 *
 * 왼쪽에 같은 묶음의 다른 화면을 세워 둔다. 화면 하나를 보다가 옆 화면의 같은 항목을 보는 일이
 * 잦아서(예: 이 화면의 예외 처리는 저 화면과 같은가), 매번 목록으로 돌아가게 두지 않는다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: COPY.docs.title };

export function generateStaticParams() {
  return Object.keys(DOC_GROUPS).flatMap((doc) =>
    listGroupDocs(doc).map((entry) => ({ doc, sub: entry.slug })),
  );
}

export default async function DocGroupPage({ params }: { params: Promise<{ doc: string; sub: string }> }) {
  const { doc, sub } = await params;
  if (!DOC_GROUPS[doc]) notFound();

  const source = readDoc(sub, doc);
  if (!source) notFound();

  const entries = listGroupDocs(doc);

  return (
    <DocShell active={`/${doc}`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <nav aria-label={DOC_GROUPS[doc]} className="flex w-full shrink-0 flex-col gap-1 lg:w-56">
          {entries.map((entry) => {
            const page = pages.find((item) => item.id === entry.slug);
            const on = entry.slug === sub;
            return (
              <a
                key={entry.slug}
                href={`/${doc}/${entry.slug}`}
                aria-current={on ? 'page' : undefined}
                className={`truncate rounded-lg px-3 py-2 text-sm ${
                  on
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'text-ink-muted hover:bg-surface'
                }`}
              >
                {page?.name ?? entry.slug}
              </a>
            );
          })}
        </nav>

        <article className="min-w-0 flex-1">
          <Markdown source={source} />
        </article>
      </div>
    </DocShell>
  );
}
