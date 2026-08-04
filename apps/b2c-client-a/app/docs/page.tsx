import type { Metadata } from 'next';
import { COPY } from '@winpilot/client-content';
import { DocShell } from '@/app/_components/DocShell';
import { PageTitle } from '@/app/_components/SiteShell';
import { DOC_GROUPS, TAB_GROUPS, listDocs, listGroupDocs } from '@/lib/docs';
import { pages } from '@/pages.manifest';

/**
 * 문서 목록 — 이 템플릿이 따르는 문서와 **화면 목록**을 한 곳에서 보여준다.
 *
 * 화면 목록은 `pages.manifest.ts` 에서 읽는다. 템플릿 A~F 가 같은 매니페스트를 쓰므로
 * 이 표가 곧 "6개 템플릿이 같아야 하는 화면 목록" 이다.
 *
 * ## 어드민 연동
 * - **없다.** 이 화면은 저장소의 문서를 그대로 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: COPY.docs.title };

export default function DocsIndexPage() {
  const docs = listDocs();

  return (
    <DocShell active="/docs">
      <PageTitle title={COPY.docs.title} description={COPY.docs.intro} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">문서</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* IA 는 갈래 묶음이라 한 장짜리 목록에 들지 않는다 — 맨 앞에 따로 세운다. */}
          {[...Object.entries(TAB_GROUPS).map(([slug, title]) => ({ slug, title })), ...docs].map((entry) => (
            <a
              key={entry.slug}
              href={`/${entry.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4 hover:border-border-strong"
            >
              <span className="text-sm font-medium">{entry.title}</span>
              <span className="truncate font-mono text-xs text-ink-faint">/{entry.slug}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">화면별 문서</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          화면 하나가 문서 하나다. 기능·비기능 명세는 `pnpm docs:build`, 캡처는 `pnpm docs:capture` 로 만든다.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(DOC_GROUPS).map(([slug, title]) => (
            <a
              key={slug}
              href={`/${slug}`}
              className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4 hover:border-border-strong"
            >
              <span className="text-sm font-medium">{title}</span>
              <span className="font-mono text-xs text-ink-faint">
                /{slug} · {listGroupDocs(slug).length}장
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">화면</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          템플릿 A~F 가 공유하는 화면 목록입니다. 경로와 이름이 같고 배치만 다릅니다.
        </p>
        <div className="flex flex-col overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs text-ink-faint">
            <span className="col-span-2">순번</span>
            <span className="col-span-4">이름</span>
            <span className="col-span-6">경로</span>
          </div>
          {pages.map((page) => (
            <a
              key={page.id}
              href={page.sampleUrl ?? page.route}
              className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3 last:border-b-0 hover:bg-surface"
            >
              <span className="col-span-2 font-mono text-sm tabular-nums text-ink-faint">{page.order}</span>
              <span className="col-span-4 min-w-0 truncate text-sm">{page.name}</span>
              <span className="col-span-6 min-w-0 truncate font-mono text-xs text-ink-muted">
                {page.sampleUrl ?? page.route}
              </span>
            </a>
          ))}
        </div>
      </section>
    </DocShell>
  );
}
