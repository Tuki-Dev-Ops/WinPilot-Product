import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { DIRECTIONS } from '@/lib/data/site';

/**
 * Feature: `site.directions` · IR Client (템플릿 A) · route `/support/directions`
 *
 * ## 지도를 붙이지 않았다
 * 지도는 남의 서버에서 오는 스크립트다 — 그것이 멈추면 **주소조차 못 읽는 화면**이 된다.
 * 그래서 글로 적은 길을 먼저 두고, 지도는 나중에 그 아래에 더한다.
 *
 * 오는 길을 수단별로 가르는 이유: 지하철로 오는 사람에게 주차 안내는 읽을 필요가 없는 줄이다.
 */
export const metadata: Metadata = { title: `오시는 길 — ${IR_COMPANY.name}` };

export default function SiteDirectionsPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="오시는 길" description={IR_COMPANY.address} />

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-xl border border-border px-6 py-5">
          <h2 className="text-base font-semibold tracking-tight">본사</h2>
          <p className="text-sm leading-relaxed">{IR_COMPANY.address}</p>
          <p className="font-mono text-xs tabular-nums text-ink-muted">{IR_COMPANY.irPhone}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">오시는 방법</h2>
          <dl className="flex flex-col">
            {DIRECTIONS.map((one) => (
              <div key={one.kind} className="flex flex-col gap-1 border-b border-border py-4 first:pt-0 last:border-b-0 sm:flex-row sm:gap-8">
                <dt className="w-20 shrink-0 text-sm font-medium">{one.kind}</dt>
                <dd className="min-w-0 text-sm leading-relaxed text-ink-muted">{one.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </IrSiteShell>
  );
}
