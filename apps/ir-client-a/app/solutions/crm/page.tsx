import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IR_COMPANY, findSolution } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `solution.detail` · IR Client (템플릿 A) · route `/solutions/crm`
 *
 * ## 기능을 늘어놓지 않는다
 * 화면 이름을 스무 개 적어 두면 읽는 사람은 **자기 문제가 그중에 있는지**를 판단하지 못한다.
 * 그래서 순서를 뒤집었다 — 무엇이 문제인지 먼저 적고, 어떻게 푸는지, 그래서 무엇이 달라지는지.
 */
export const metadata: Metadata = { title: `CRM — ${IR_COMPANY.name}` };

export default function SolutionCRMPage() {
  const solution = findSolution('crm');
  if (!solution) notFound();

  return (
    <IrSiteShell>
      <IrPageTitle title={solution.name} description={solution.tagline} />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">무엇이 문제인가</h2>
          <p className="text-sm leading-relaxed text-ink-muted">{solution.problem}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">어떻게 푸는가</h2>
          <p className="text-sm leading-relaxed text-ink-muted">{solution.approach}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">무엇이 달라지는가</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {solution.outcomes.map((one) => (
              <li key={one} className="rounded-xl border border-border px-5 py-4 text-sm leading-relaxed">
                {one}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </IrSiteShell>
  );
}
