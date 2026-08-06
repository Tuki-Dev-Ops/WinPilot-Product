import type { Metadata } from 'next';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';
import { ScreenNav } from '../_components/ScreenNav';
import { IA_GROUPS, labelOf, screenNavItems } from '@/lib/ia-groups';
import { siteMap } from '@/lib/ia-diagram';
import { pages } from '@/pages.manifest';

/**
 * IA — **전체**. 사이드바를 감싼 도면 한 장과 갈래 목록.
 *
 * 화면 하나하나의 IA 는 `/docs/ia/{화면}` 으로 나갔다. 한 장에 스물세 개 화면을 다 그리면 도면이
 * 화면보다 커져서, "이 상세 화면은 어디서 들어가나" 하나를 보려는 사람이 도면 전체를 훑어야 한다.
 *
 * **도면을 손으로 적지 않고 메뉴에서 만든다.** 메뉴가 곧 구조이므로 메뉴를 고치면 도면이
 * 따라와야 한다. 따로 적으면 메뉴에 항목을 더했을 때 도면만 옛것이 된다.
 *
 * ## 고객사 배포 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객사의 배포에 나타나지 않는다.
 */
export const metadata: Metadata = { title: 'IA' };

export default function InternalDocsIaPage() {
  const routeOf = new Map(pages.map((page) => [page.id, page.route]));

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <ScreenNav base="/docs/ia" items={screenNavItems()} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <DocHeader
          trail={['문서', '개요', '전체']}
          title="IA — 정보 구조"
          description="사이드바가 곧 구조다. 도면은 메뉴 정의(lib/navigation/internal-menu.ts)에서 만들어지므로 메뉴를 고치면 도면이 따라온다. 화면 하나의 IA 는 왼쪽 목록에서 고른다."
        />

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">사이드바</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            사이드바는 <strong className="font-semibold">최상위만</strong> 노출한다. 세부 뎁스를 사이드바에 펼치면
            자원 수가 늘수록 무너지므로, 세부는 본문 왼쪽 보조 메뉴에 그 섹션의 것만 둔다. 도면도 같은 이유로
            최상위까지만 그린다 — 갈래 안쪽은 화면 하나를 볼 때 펼친다.
          </p>
          <Mermaid code={siteMap()} title="사내 어드민 사이드바" />
        </section>

        {IA_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="flex min-w-0 scroll-mt-6 flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">{labelOf(group)}</h2>
            <p className="text-sm leading-relaxed text-ink-muted">{group.purpose}</p>

            <div className="min-w-0 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-160 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-2.5 text-left align-top text-xs font-medium text-ink-faint">화면</th>
                    <th className="px-3 py-2.5 text-left align-top text-xs font-medium text-ink-faint">경로</th>
                    <th className="px-3 py-2.5 text-left align-top text-xs font-medium text-ink-faint">문서</th>
                  </tr>
                </thead>
                <tbody>
                  {group.screens.map((screen) => (
                    <tr key={screen.screen} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3 align-top">
                        <a
                          className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
                          href={`/docs/ia/${screen.screen}`}
                        >
                          {screen.ko}
                        </a>
                      </td>
                      <td className="px-3 py-3 align-top font-mono text-xs text-ink-muted">
                        {routeOf.get(screen.screen)}
                      </td>
                      <td className="flex flex-wrap gap-x-2 px-3 py-3 align-top text-xs">
                        <a
                          className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
                          href={`/docs/flow-chart/${screen.screen}`}
                        >
                          흐름
                        </a>
                        <a
                          className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
                          href={`/docs/fsd/${screen.screen}`}
                        >
                          기능
                        </a>
                        <a
                          className="text-brand-700 underline underline-offset-2 dark:text-brand-300"
                          href={`/docs/page-view/${screen.screen}`}
                        >
                          캡처
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">이 갈래의 규칙</p>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {group.notes.map((note) => (
                  <li key={note} className="text-sm leading-relaxed text-ink-muted">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
