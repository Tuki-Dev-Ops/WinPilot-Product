import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COPY } from '@winpilot/client-content';
import { DocShell } from '@/app/_components/DocShell';
import { Markdown } from '@/app/_components/Markdown';
import { PageTitle } from '@/app/_components/SiteShell';
import { DOC_GROUPS, DOC_TITLES, docTitle, listGroupDocs, readDoc } from '@/lib/docs';
import { pages } from '@/pages.manifest';

/**
 * 문서 화면 — `/ia`, `/flow` 처럼 **문서 이름이 곧 주소**다.
 *
 * 이름이 묶음(`feature`·`non-functional`·`page-view`)이면 그 묶음의 **목록**을 그린다.
 * 묶음 안의 한 장은 `/feature/products` 처럼 한 마디 더 붙는다.
 *
 * 이 라우트는 마지막에 놓인다: `/products` 같은 실제 화면이 먼저 매칭되고,
 * 남는 한 마디 주소만 여기로 온다. 등록된 문서가 아니면 404 다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: COPY.docs.title };

export function generateStaticParams() {
  return [...Object.keys(DOC_TITLES), ...Object.keys(DOC_GROUPS)].map((doc) => ({ doc }));
}

export default async function DocPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;

  // 묶음이면 목록을 그린다 — 묶음 자체에는 본문이 없다.
  if (DOC_GROUPS[doc]) {
    const entries = listGroupDocs(doc);

    return (
      <DocShell active={`/${doc}`}>
        <PageTitle title={DOC_GROUPS[doc]} description={`화면 ${entries.length}개`} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const page = pages.find((item) => item.id === entry.slug);
            return (
              <a
                key={entry.slug}
                href={`/${doc}/${entry.slug}`}
                className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4 hover:border-border-strong"
              >
                <span className="text-sm font-medium">{page?.name ?? entry.slug}</span>
                <span className="font-mono text-xs text-ink-faint">{page?.route ?? `/${entry.slug}`}</span>
              </a>
            );
          })}
        </div>
      </DocShell>
    );
  }

  const source = readDoc(doc);
  if (!source) notFound();

  return (
    <DocShell active={`/${doc}`}>
      <PageTitle title={docTitle(doc)} description={COPY.docs.intro} />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </DocShell>
  );
}
