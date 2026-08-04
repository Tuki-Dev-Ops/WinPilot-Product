import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '@/app/docs/_components/DocHeader';
import { ScreenNav } from '@/app/docs/_components/ScreenNav';
import { koOf, screenNavItems } from '@/lib/ia-groups';
import { findFlow } from '@/lib/flow-specs';
import { flowChart } from '@/lib/flow-diagram';
import { pages } from '@/pages.manifest';

/**
 * 화면 하나의 흐름 — 어디서 들어와 무엇을 밟고 어디서 갈리는가.
 *
 * 도면 아래에 같은 내용을 글로 한 번 더 적는다. 도면은 훑기에 좋고 글은 옮겨 적기에 좋아서,
 * 이 문서를 보고 만드는 사람이 도면을 손으로 다시 풀어 쓰는 일을 없앤다.
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
  return { title: `흐름 — ${koOf(screen)}` };
}

/** 목록 한 덩이. 비었을 때 자리를 지우지 않고 왜 비었는지 적는다 — 빈 자리와 없음은 다른 말이다. */
function List({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-ink-muted">{empty}</p>
      ) : (
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {items.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-ink-muted">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function FlowChartScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const page = pages.find((item) => item.id === screen);
  const flow = findFlow(screen);
  if (!page || !flow) notFound();

  const label = koOf(screen);

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <ScreenNav base="/docs/flow-chart" items={screenNavItems()} active={screen} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <DocHeader
          trail={['문서', '개요', 'Flow Chart']}
          title={`흐름 — ${label}`}
          description="실선은 정상, 점선은 예외, 마름모는 갈림길, 원통은 값이 오는 곳이다."
          aside={<span className="font-mono text-xs text-ink-muted">{page.route}</span>}
        />

        <Mermaid code={flowChart(label, flow)} title={`흐름 — ${label}`} />

        <section className="flex min-w-0 flex-col gap-5">
          <List
            title="들어오는 길"
            items={flow.entries}
            empty="정해진 길이 없다 — 주소로 바로 들어온다."
          />
          <List title="밟는 차례" items={flow.steps} empty="열어서 읽는 화면이라 밟는 차례가 없다." />
          <List
            title="갈림길"
            items={flow.branches.map((branch) => `${branch.question} — 아니면 ${branch.block}`)}
            empty="갈리는 자리가 없다."
          />
          <List
            title="예외"
            items={flow.exceptions.map((exception) => exception.label)}
            empty="예외로 빠지는 자리가 없다."
          />
          <List
            title="값이 오는 곳"
            items={flow.data}
            empty="바깥에서 읽어 오는 값이 없다 — 주소만 보고 그린다."
          />
          <List title="나가는 길" items={flow.exits} empty="이어지는 다음 화면이 없다 — 읽고 나면 돌아 나간다." />
        </section>

        <section className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-5 text-sm">
          <a className="text-brand-700 underline underline-offset-2 dark:text-brand-300" href={`/docs/ia/${screen}`}>
            이 화면의 IA
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
