import type { Metadata } from 'next';
import { Badge, PageHeading, Panel } from '@winpilot/ui';
import {
  FRANCHISE_COSTS,
  FRANCHISE_COST_BASIS,
  FRANCHISE_STEPS,
  formatManwon,
  franchiseCostTotal,
} from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `settings.franchise` · F&B Admin · route `/settings/franchise`
 *
 * ## 여기서 고치지 못하게 둔 이유
 * 창업 비용과 절차는 **정보공개서에 신고한 값**이다. 사이트에 적힌 값과 신고한 값이 다르면
 * 그것은 문구 오류가 아니라 가맹사업법 문제가 된다 — 어드민에서 숫자만 고칠 수 있게 두면
 * 담당자가 신고 절차를 모른 채 고치게 되고, 그 사실은 분쟁이 나서야 드러난다.
 *
 * 그래서 보여 주기만 한다. 값을 바꾸는 일은 신고를 함께 갱신할 때 코드에서 한다.
 *
 * ## 그러면 이 화면은 무엇을 하나
 * **사이트에 지금 무엇이 적혀 있는지**를 한자리에서 보여 준다. 창업 상담 전화를 받는 사람이 가장
 * 자주 확인하는 것이 그것이다 — 신청자는 이 표를 읽고 전화하므로, 받는 쪽이 같은 표를 보고 있어야
 * 말이 어긋나지 않는다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export const metadata: Metadata = {
  title: adminTitle('창업', '비용 · 절차'),
  robots: { index: false, follow: false },
};

export default function FnbFranchiseSettingsPage() {
  return (
    <FnbShell sectionId="franchise" trail={['창업', '비용 · 절차']} activeChildId="franchise-cost">
      <PageHeading
        title="창업 비용 · 절차"
        description="사이트 창업 안내에 지금 적혀 있는 값입니다. 상담 전화를 받으실 때 이 표를 보세요."
      />

      <Panel
        title="창업 비용"
        description={FRANCHISE_COST_BASIS}
        aside={<Badge tone="neutral">읽기 전용</Badge>}
      >
        <ul className="flex flex-col">
          {FRANCHISE_COSTS.map((one) => (
            <li
              key={one.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border px-6 py-4 last:border-b-0"
            >
              <span className="w-28 shrink-0 text-sm font-medium">{one.name}</span>
              <span className="w-28 shrink-0 font-mono text-sm tabular-nums">{formatManwon(one.amount)}</span>
              <span className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">{one.note}</span>
            </li>
          ))}
        </ul>

        {/*
          합계와 **빠진 것**을 같은 줄에 둔다. 사이트에서도 같은 모양으로 서 있으므로, 전화를
          받는 사람이 신청자와 같은 것을 보게 된다.
        */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-border bg-surface px-6 py-5">
          <span className="flex items-baseline gap-4">
            <span className="text-sm font-semibold">합계</span>
            <span className="font-mono text-lg font-bold tabular-nums">{formatManwon(franchiseCostTotal())}</span>
          </span>
          <span className="text-sm font-medium text-ink-muted">임차료 · 권리금 · 철거비는 포함되지 않습니다</span>
        </div>
      </Panel>

      <Panel title="개점까지" description="상담 신청부터 시식 영업까지의 차례와 기간입니다.">
        <ol className="flex flex-col">
          {FRANCHISE_STEPS.map((one, index) => (
            <li
              key={one.name}
              className="flex flex-wrap items-start gap-4 border-b border-border px-6 py-4 last:border-b-0"
            >
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{one.name}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{one.desc}</span>
              </span>

              <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 font-mono text-xs tabular-nums text-ink-muted">
                {one.period}
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 이 값들은 정보공개서에 신고한 것과 같아야 합니다. 여기서
        숫자만 고칠 수 있게 두면 신고를 갱신하지 않은 채 사이트만 바뀌므로, 고치는 일은 신고를 함께
        갱신할 때 합니다.
      </p>
    </FnbShell>
  );
}
