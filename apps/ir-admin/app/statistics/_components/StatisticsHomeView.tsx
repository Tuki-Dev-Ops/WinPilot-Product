'use client';

import { PageHeading } from '@winpilot/ui';
import { PAGE_VISITS, SITE_INQUIRIES, VISIT_TREND } from '@winpilot/store';
import { IrPanel, IrSummary } from '@/app/_components/IrPanel';

/**
 * 통계 > 홈.
 *
 * ## 방문과 문의를 같은 줄에서 본다
 * 방문만 보면 늘었는지만 알고, 문의만 보면 왜 늘었는지 모른다. 둘을 한 막대에 겹쳐 두면
 * **방문은 늘었는데 문의는 그대로인 달**이 눈에 띈다 — 그 달이 화면을 고쳐야 하는 달이다.
 *
 * ## 막대를 CSS 로 그린다
 * 그래프 라이브러리를 들이지 않는다. 여기서 필요한 것은 여섯 달의 높낮이뿐이고, 그것 때문에
 * 묶음 크기를 수백 KB 늘리면 **콘솔 첫 화면이 그만큼 늦게 뜬다**.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function StatisticsHomeView() {
  const top = VISIT_TREND.reduce((most, one) => Math.max(most, one.visits), 1);
  const last = VISIT_TREND[VISIT_TREND.length - 1];
  const before = VISIT_TREND[VISIT_TREND.length - 2];
  const gap = last && before ? last.visits - before.visits : 0;
  const waiting = SITE_INQUIRIES.filter((one) => one.state !== '답변완료').length;

  return (
    <>
      <PageHeading title="통계" description="사이트 방문과 문의를 한눈에 봅니다." />

      <IrSummary
        cards={[
          { label: '이번 달 방문', value: last ? last.visits.toLocaleString() : '0', hint: '지난달 대비 ' + (gap >= 0 ? '+' : '') + gap.toLocaleString() },
          { label: '이번 달 문의', value: last ? String(last.inquiries) : '0', hint: '사이트 문의 양식' },
          { label: '답변 대기', value: String(waiting), hint: '아직 답하지 않은 것' },
          { label: '가장 많이 본 화면', value: PAGE_VISITS[0]?.label ?? '-', hint: PAGE_VISITS[0]?.route ?? '' },
        ]}
      />

      <IrPanel title="달마다" description="막대는 방문, 아래 숫자는 그달의 문의입니다.">
        <div className="flex min-w-0 items-end gap-3 overflow-x-auto px-6 py-6">
          {VISIT_TREND.map((one) => (
            <div key={one.id} className="flex min-w-14 flex-1 flex-col items-center gap-2">
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {one.visits.toLocaleString()}
              </span>
              <span
                className="w-full rounded-t bg-brand/80"
                style={{ height: `${Math.round((one.visits / top) * 140)}px` }}
                aria-hidden
              />
              <span className="font-mono text-xs tabular-nums text-ink-faint">{one.month.slice(5)}월</span>
              <span className="font-mono text-xs tabular-nums text-ink">문의 {one.inquiries}</span>
            </div>
          ))}
        </div>
      </IrPanel>
    </>
  );
}
