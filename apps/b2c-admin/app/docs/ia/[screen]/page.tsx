import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '../../_components/DocHeader';
import { ScreenNav } from '../../_components/ScreenNav';
import { groupOf, koOf, labelOf, screenNavItems } from '@/lib/ia-groups';
import { screenMap, screenPaths, type CrossLike } from '@/lib/ia-diagram';
import { pages } from '@/pages.manifest';

/**
 * 화면 하나의 IA — 그 화면이 놓인 자리와 드나드는 길.
 *
 * 사이드바 도면에서는 목록과 등록·상세의 관계가 보이지 않는다. 등록 화면은 메뉴에 항목이 없어
 * 목록에서만 들어가는데, 그 사실을 모르면 같은 화면을 새로 만들려 든다. 여기서는 그 길까지 그린다.
 *
 * ## 고객 화면 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객 화면에 나타나지 않는다.
 */
export function generateStaticParams() {
  return pages.map((page) => ({ screen: page.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>;
}): Promise<Metadata> {
  const { screen } = await params;
  return { title: `IA — ${koOf(screen)}` };
}

/** 들어오는 길·나가는 길 표. 길이 없을 때 표를 지우지 않고 왜 없는지 한 줄로 적는다. */
function PathTable({ title, paths, empty }: { title: string; paths: CrossLike[]; empty: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{title}</p>

      {paths.length === 0 ? (
        <p className="text-sm leading-relaxed text-ink-muted">{empty}</p>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-120 border-collapse text-sm">
            <tbody>
              {paths.map((path) => (
                <tr key={`${path.screen}-${path.how}`} className="border-b border-border last:border-b-0">
                  <td className="w-44 px-5 py-3 align-top">
                    <a
                      className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
                      href={`/docs/ia/${path.screen}`}
                    >
                      {koOf(path.screen)}
                    </a>
                  </td>
                  <td className="min-w-0 px-5 py-3 align-top leading-relaxed text-ink-muted">{path.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function AdminIaScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const page = pages.find((item) => item.id === screen);
  if (!page) notFound();

  const group = groupOf(screen);
  const { into, outOf } = screenPaths(screen);

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <ScreenNav base="/docs/ia" items={screenNavItems()} active={screen} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <DocHeader
          trail={['문서', '개요', 'IA']}
          title={`IA — ${koOf(screen)}`}
          description={group ? `${labelOf(group)} 갈래에 놓인 화면이다. ${group.purpose}` : '어느 갈래에도 들지 않는다.'}
          aside={<span className="font-mono text-xs text-ink-muted">{page.route}</span>}
        />

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">놓인 자리</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            굵게 칠한 것이 이 화면이다. 갈래 밖의 화면은 <strong className="font-semibold">상자만</strong> 세운다 —
            그쪽 갈래를 통째로 그리면 도면이 두 배가 되고, 이 화면을 보러 온 사람이 옆 갈래의 구조를 다시 읽게 된다.
            원통은 값이 오는 곳이다.
          </p>
          <Mermaid code={screenMap(screen)} title={`IA — ${koOf(screen)}`} />
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">드나드는 길</h2>
          <PathTable
            title="들어오는 길"
            paths={into}
            empty="이 화면으로 들어오는 정해진 길이 없다 — 사이드바나 보조 메뉴에서 바로 연다."
          />
          <PathTable
            title="나가는 길"
            paths={outOf}
            empty="이 화면에서 이어지는 다음 화면이 없다 — 고쳐 저장하면 그 자리에 남는다."
          />
        </section>

        {group && (
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">값이 오는 곳</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              이 프로젝트에는 서버가 없다. 어드민이 만지는 것은 고객 화면과 함께 쓰는 시드와 어드민에만 있는
              시드뿐이다.
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {group.data.map((item) => (
                <li key={item} className="font-mono text-sm leading-relaxed text-ink-muted">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {group && (
          <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-surface px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
              {labelOf(group)} 갈래의 규칙
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {group.notes.map((note) => (
                <li key={note} className="text-sm leading-relaxed text-ink-muted">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-5 text-sm">
          <a
            className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
            href={`/docs/flow-chart/${screen}`}
          >
            이 화면의 흐름
          </a>
          <a className="text-brand-700 underline underline-offset-2 dark:text-brand-300" href={`/docs/fsd/${screen}`}>
            기능 명세
          </a>
          <a
            className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
            href={`/docs/page-view/${screen}`}
          >
            화면 캡처
          </a>
        </section>
      </div>
    </div>
  );
}
