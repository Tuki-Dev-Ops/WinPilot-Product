import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COPY } from '@winpilot/client-content';
import { DocShell, DocTabs } from '@/app/_components/DocShell';
import { Markdown } from '@/app/_components/Markdown';
import { DOC_GROUPS, TAB_GROUPS, groupTabs, listGroupDocs, readDoc } from '@/lib/docs';
import { pages } from '@/pages.manifest';

/**
 * 묶음 안의 문서 한 장 — `/ia/purchase` · `/feature/products` · `/page-view/cart`.
 *
 * 고르는 자리는 묶음의 모양을 따른다. 갈래 묶음은 **위 탭**, 화면별 묶음은 **왼쪽 목록**이다.
 * 화면은 26개라 탭으로 두면 줄이 넘치고, 갈래는 일곱이라 목록으로 두면 자리가 남는다.
 *
 * 화면별 묶음에서 왼쪽에 다른 화면을 세워 두는 이유: 한 화면을 보다가 옆 화면의 같은 항목을
 * 보는 일이 잦아서(예: 이 화면의 예외 처리는 저 화면과 같은가) 매번 목록으로 돌아가게 두지 않는다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: COPY.docs.title };

export function generateStaticParams() {
  const screens = Object.keys(DOC_GROUPS).flatMap((doc) =>
    listGroupDocs(doc).map((entry) => ({ doc, sub: entry.slug })),
  );
  // 갈래 묶음의 `index` 는 묶음 자체(`/ia`)가 그리므로 한 마디 더 붙이지 않는다.
  const tabs = Object.keys(TAB_GROUPS).flatMap((doc) =>
    listGroupDocs(doc)
      .filter((entry) => entry.slug !== 'index')
      .map((entry) => ({ doc, sub: entry.slug })),
  );

  return [...screens, ...tabs];
}

export default async function DocGroupPage({ params }: { params: Promise<{ doc: string; sub: string }> }) {
  const { doc, sub } = await params;

  const source = readDoc(sub, doc);
  if (!source) notFound();

  if (TAB_GROUPS[doc]) {
    return (
      <DocShell active={`/${doc}`}>
        <DocTabs tabs={groupTabs(doc)} active={`/${doc}/${sub}`} />
        <article className="min-w-0">
          <Markdown source={source} />
        </article>
      </DocShell>
    );
  }

  if (!DOC_GROUPS[doc]) notFound();

  const entries = listGroupDocs(doc);

  return (
    <DocShell active={`/${doc}`}>
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <nav
          aria-label={DOC_GROUPS[doc]}
          className="-mx-4 flex shrink-0 gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:w-52 lg:flex-col lg:px-0 lg:pb-0"
        >
          {entries.map((entry) => {
            const page = pages.find((item) => item.id === entry.slug);
            const on = entry.slug === sub;
            return (
              <a
                key={entry.slug}
                href={`/${doc}/${entry.slug}`}
                aria-current={on ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  on
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'text-ink-muted hover:bg-surface hover:text-ink'
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
