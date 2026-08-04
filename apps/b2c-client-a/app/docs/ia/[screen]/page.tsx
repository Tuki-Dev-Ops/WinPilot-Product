import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '@/app/docs/_components/DocHeader';
import { ScreenNav } from '@/app/docs/_components/ScreenNav';
import { groupOf, koOf, screenNavItems } from '@/lib/ia-groups';
import { screenMap, screenPaths, type CrossLike } from '@/lib/ia-diagram';
import { pages } from '@/pages.manifest';

/**
 * 화면 하나의 IA — 그 화면이 놓인 자리와 드나드는 길.
 *
 * 전체 도면에서 한 화면을 찾아 눈으로 따라가는 일을 없앤다. 갈래 안의 이웃만이 아니라
 * **갈래를 넘어 들어오고 나가는 길**까지 여기서 그린다 — 그 길은 어느 갈래 도면에도 없어서,
 * 모르는 사람은 없는 줄 안다(상품 상세에서 결제로 바로 가는 길 같은 것).
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
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
                  <td className="w-40 px-5 py-3 align-top">
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

export default async function IaScreenPage({ params }: { params: Promise<{ screen: string }> }) {
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
          description={
            group
              ? `${group.label} 갈래에 놓인 화면이다. ${group.purpose}`
              : '어느 갈래에도 들지 않는다 — 모든 갈래가 이 화면에서 갈라진다.'
          }
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
            empty="이 화면으로 들어오는 정해진 길이 없다 — 헤더·푸터에서 바로 열리거나 주소로 들어온다."
          />
          <PathTable
            title="나가는 길"
            paths={outOf}
            empty="이 화면에서 이어지는 다음 화면이 없다 — 읽고 나면 돌아 나간다."
          />
        </section>

        {group && (
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">값이 오는 곳</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              이 프로젝트에는 서버가 없다. 화면이 읽는 것은 공유 패키지의 시드와 주소의 질의문자열뿐이다.
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
              {group.label} 갈래의 규칙
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
          <a className="text-brand-700 underline underline-offset-2 dark:text-brand-300" href={`/docs/flow-chart/${screen}`}>
            이 화면의 흐름
          </a>
          <a className="text-brand-700 underline underline-offset-2 dark:text-brand-300" href={`/docs/fsd/${screen}`}>
            기능 명세
          </a>
          <a className="text-brand-700 underline underline-offset-2 dark:text-brand-300" href={`/docs/page-view/${screen}`}>
            화면 캡처
          </a>
        </section>
      </div>
    </div>
  );
}
