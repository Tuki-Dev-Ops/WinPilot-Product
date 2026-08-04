import type { Metadata } from 'next';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '@/app/docs/_components/DocHeader';
import { ScreenNav } from '@/app/docs/_components/ScreenNav';
import { IA_GROUPS, screenNavItems } from '@/lib/ia-groups';
import { siteMap } from '@/lib/ia-diagram';
import { pages } from '@/pages.manifest';

/**
 * IA — **전체**. 앱 전체를 감싼 도면 한 장과 갈래 목록.
 *
 * 화면 하나하나의 IA 는 `/docs/ia/{화면}` 으로 나갔다. 한 장에 26개 화면과 갈래를 넘는 선까지
 * 그리면 도면이 화면보다 커져서, "이 화면은 어디서 들어오고 어디로 나가나" 하나를 보려는
 * 사람이 도면 전체를 훑어야 한다. 전체는 갈래까지만 보여 준다.
 *
 * 도면은 `lib/ia-groups.ts` 에서 만들어진다 — 화면을 하나 늘렸을 때 고칠 곳이 하나여야
 * 도면이 화면을 따라온다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: 'IA' };

export default function DocsIaPage() {
  const routeOf = new Map(pages.map((page) => [page.id, page.route]));

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <ScreenNav base="/docs/ia" items={screenNavItems()} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <DocHeader
          trail={['문서', '개요', '전체']}
          title="IA — 정보 구조"
          description="지금 이 템플릿에 실제로 있는 화면의 구조다. 계획이 아니라 현황이며, 화면을 늘리면 도면이 함께 자란다. 화면 하나의 IA 는 왼쪽 목록에서 고른다."
        />

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">전체 사이트맵</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            홈에서 <strong className="font-semibold">갈래로만</strong> 잇는다. 화면끼리의 선은 갈래 안에서만 그어 선이
            서로 넘지 않게 한다. 갈래를 넘는 이동(상품 상세 → 결제 같은 것)은 화면 하나를 볼 때만 꺼내 그린다 —
            여기에 전부 그으면 도면이 그물이 되어 아무것도 읽히지 않는다.
          </p>
          <Mermaid code={siteMap()} title="전체 사이트맵" />
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">갈래</h2>
          <div className="min-w-0 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-160 border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-2.5 text-left align-top text-xs font-medium text-ink-faint">갈래</th>
                  <th className="px-3 py-2.5 text-right align-top text-xs font-medium text-ink-faint">화면</th>
                  <th className="px-5 py-2.5 text-left align-top text-xs font-medium text-ink-faint">하는 일</th>
                </tr>
              </thead>
              <tbody>
                {IA_GROUPS.map((group) => (
                  <tr key={group.id} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-3 align-top font-medium">{group.label}</td>
                    <td className="px-3 py-3 text-right align-top tabular-nums text-ink-muted">
                      {group.screens.length}개
                    </td>
                    <td className="min-w-0 px-5 py-3 align-top leading-relaxed text-ink-muted">{group.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {IA_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="flex min-w-0 scroll-mt-6 flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">{group.label}</h2>
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
