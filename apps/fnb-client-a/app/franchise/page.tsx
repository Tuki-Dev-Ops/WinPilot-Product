import type { Metadata } from 'next';
import {
  FRANCHISE_COSTS,
  FRANCHISE_COST_BASIS,
  FRANCHISE_STEPS,
  formatManwon,
  franchiseCostTotal,
} from '@winpilot/store';
import { ApplyCta } from '@/app/_components/ApplyCta';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { SectionLabel } from '@/app/_components/SectionLabel';
import { FranchiseTabs } from '@/app/franchise/_components/FranchiseTabs';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * Feature: `franchise.detail` · F&B Client (템플릿 A) · route `/franchise`
 *
 * ## 비용을 먼저 적는다 — 절차보다 앞에
 * 국내 프랜차이즈 창업 안내를 보면 대개 `브랜드 경쟁력 → 지원 사항 → 절차` 를 지나 맨 끝에
 * `상담 문의` 가 있고, 비용은 **적혀 있지 않다.** 전화해서 물으라는 것인데, 그러면 아직 마음을
 * 못 정한 사람은 전화하지 않고 창을 닫는다.
 *
 * 여기서는 표로 적는다. 숫자를 보고 물러나는 사람은 어차피 계약까지 가지 않을 사람이고, 그
 * 사람과 상담하는 시간이 실제 비용이다.
 *
 * ## 빠진 것을 함께 적는다
 * `임차료 · 권리금 별도` 를 표 아래 작은 글씨로 두면 나중에 분쟁이 된다. 합계 바로 옆에 같은
 * 크기로 적는다 — 이 표에서 가장 큰 오해가 그것이기 때문이다.
 *
 * ## 자주 묻는 것은 옆 탭으로 뺐다
 * 한때 이 화면 맨 아래에 있었다. 그런데 **물어볼 것이 생겨서 다시 온 사람**은 비용 표와 절차를
 * 이미 읽었고, 그 둘을 두 번 지나야 물음에 닿았다. 지금은 `가맹점 개설문의` 탭이 맡는다.
 *
 * ## 어드민 연동
 * - 절차 · 비용 ← `@winpilot/store` 의 `FRANCHISE_STEPS` · `FRANCHISE_COSTS`
 */
export const metadata: Metadata = { title: '창업 안내' };

export default function FranchiseSettingsPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Franchise"
        title={
          <>
            처음 여시는 분이 <Accent>가장 많습니다</Accent>
          </>
        }
        description="얼마가 드는지, 문 여는 날까지 얼마나 걸리는지 먼저 적어 둡니다."
      />
      <FranchiseTabs />

      <div className="flex flex-col gap-16">
        {/* ── 비용 ── 가장 먼저 온다(머리말) */}
        <section className="flex flex-col gap-6">
          <SectionLabel>창업 비용</SectionLabel>

          <div className="overflow-hidden rounded-2xl border border-border">
            <ul className="flex flex-col">
              {FRANCHISE_COSTS.map((one) => (
                <li
                  key={one.id}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border px-6 py-4"
                >
                  <span className="w-28 shrink-0 text-sm font-medium">{one.name}</span>
                  <span className="w-28 shrink-0 font-mono text-sm tabular-nums">{formatManwon(one.amount)}</span>
                  <span className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">{one.note}</span>
                </li>
              ))}
            </ul>

            {/*
              합계와 **빠진 것**을 같은 줄에 둔다. 빠진 것을 아래 작은 글씨로 내리면 합계만 읽고
              가는 사람이 생기고, 그 사람은 나중에 임차료를 듣고 속았다고 여긴다.
            */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 bg-surface px-6 py-5">
              <span className="flex items-baseline gap-4">
                <span className="text-sm font-semibold">합계</span>
                <span className="font-mono text-xl font-bold tabular-nums">
                  {formatManwon(franchiseCostTotal())}
                </span>
              </span>
              <span className="text-sm font-medium text-ink-muted">
                임차료 · 권리금 · 철거비는 포함되지 않습니다
              </span>
            </div>
          </div>

          <p className="text-xs text-ink-faint">{FRANCHISE_COST_BASIS}</p>
        </section>

        {/* ── 절차 ── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>개점까지</SectionLabel>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FRANCHISE_STEPS.map((one, index) => (
              <li key={one.name} className="flex flex-col gap-2 rounded-xl border border-border px-5 py-5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{`STEP ${index + 1}`}</span>
                  <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-xs tabular-nums text-ink-muted">
                    {one.period}
                  </span>
                </span>
                <span className="text-sm font-semibold">{one.name}</span>
                <span className="text-sm leading-relaxed text-ink-muted">{one.desc}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 상담 ── */}
        <ApplyCta title="보고 계신 자리가 있으신가요" withPhone>
          번호만 남겨 주시면 하루 안에 연락드립니다. 첫 통화에서는 아무것도 정하지 않습니다 — 무엇이 궁금한지 먼저 듣습니다.
        </ApplyCta>
      </div>
    </FnbSiteShell>
  );
}

