import type { Metadata } from 'next';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';
import { ScreenNav } from '../_components/ScreenNav';
import { screenNavItems } from '@/lib/ia-groups';
import { COMMON_FLOWS, JOURNEYS, type NamedFlow } from '@/lib/flow-specs';
import { flowChart } from '@/lib/flow-diagram';

/**
 * Flow Chart — **전체**. 운영자 여정과 어느 화면에서나 같은 상호작용.
 *
 * 화면 하나하나의 흐름은 `/docs/flow-chart/{화면}` 으로 나갔다. 한 장에 열아홉 화면의 흐름을
 * 모두 그리면 "고객사 하나를 붙이려면 어디를 몇 번 거치는가" 하나를 보려는 사람이 문서 전체를
 * 훑어야 한다. 여기서는 화면을 잇는 길만 보여 준다.
 *
 * ## 고객사 배포 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객사의 배포에 나타나지 않는다.
 */
export const metadata: Metadata = { title: 'Flow Chart' };

/** 여정과 공통 상호작용은 모양이 같다 — 한 벌로 그린다. */
function FlowSection({ flow }: { flow: NamedFlow }) {
  return (
    <section id={flow.id} className="flex min-w-0 scroll-mt-6 flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">{flow.title}</h2>
      <p className="text-sm leading-relaxed text-ink-muted">{flow.purpose}</p>
      <Mermaid code={flowChart(flow.title, flow)} title={flow.title} />
    </section>
  );
}

export default function InternalDocsFlowChartPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <ScreenNav base="/docs/flow-chart" items={screenNavItems()} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <DocHeader
          trail={['문서', '개요', '전체']}
          title="Flow Chart — 흐름"
          description="실선은 정상, 점선은 예외, 마름모는 갈림길, 원통은 값이 오는 곳이다. 화면 하나의 흐름은 왼쪽 목록에서 고른다."
        />

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">여정</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            화면 하나가 아니라 <strong className="font-semibold">운영자가 하는 일 하나</strong>를 따라간다. 단계는
            화면 이름으로만 적는다 — 화면 안에서 무엇을 밟는지는 그 화면의 흐름에 이미 있고, 여기까지 적으면 같은
            것이 두 벌이 된다.
          </p>
        </section>

        {JOURNEYS.map((flow) => (
          <FlowSection key={flow.id} flow={flow} />
        ))}

        <section className="flex min-w-0 flex-col gap-3 border-t border-border pt-6">
          <h2 className="text-xl font-bold tracking-tight">공통 상호작용</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            어느 화면에서나 같은 것이다. 화면마다 되풀이해 적으면 열아홉 벌이 되고, 열아홉 벌은 한 번에 고쳐지지 않는다.
          </p>
        </section>

        {COMMON_FLOWS.map((flow) => (
          <FlowSection key={flow.id} flow={flow} />
        ))}
      </div>
    </div>
  );
}
