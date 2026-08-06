'use client';

import { Check } from 'lucide-react';
import { Badge } from '@winpilot/ui';
import {
  includedIn,
  type FeatureSurface,
  type PlanFeature,
} from '@/lib/data/plan-features';
import type { PlanRecord } from '@/lib/data/subscriptions';

export type PlanMatrixProps = {
  /** 갈래 순서 — 도메인마다 다르다 */
  groups: readonly string[];
  /** 이 도메인에서 파는 플랜들. 왼쪽부터 낮은 등급 순 */
  plans: PlanRecord[];
  features: PlanFeature[];
};

/** 켜짐/꺼짐을 색만으로 알리지 않는다 — 아이콘 옆에 낭독기가 읽는 말을 둔다. */
function Cell({ on }: { on: boolean }) {
  return (
    <span className="flex items-center justify-center">
      {on ? (
        <Check aria-hidden className="size-4 text-signal-ok" strokeWidth={2} />
      ) : (
        <span aria-hidden className="text-ink-faint">
          —
        </span>
      )}
      <span className="sr-only">{on ? '포함' : '포함 안 함'}</span>
    </span>
  );
}

/** `1fr` + 플랜 수만큼의 열. 조립하면 Tailwind 가 클래스를 못 찾으므로 표로 적어 둔다. */
const GRID: Record<number, string> = {
  1: 'grid-cols-[minmax(0,1fr)_repeat(1,5rem)]',
  2: 'grid-cols-[minmax(0,1fr)_repeat(2,5rem)]',
  3: 'grid-cols-[minmax(0,1fr)_repeat(3,5rem)]',
  4: 'grid-cols-[minmax(0,1fr)_repeat(4,5rem)]',
  5: 'grid-cols-[minmax(0,1fr)_repeat(5,5rem)]',
};

/**
 * 플랜 × 기능 비교표.
 *
 * ## 왜 카드가 아니라 표인가
 * 전에는 플랜마다 카드를 세우고 그 안에 켜지는 권한을 칩으로 늘어놓았다. 플랜이 셋이면
 * **같은 기능 이름이 세 번 나오고**, "스탠다드에는 있고 베이직에는 없는 것" 을 찾으려면
 * 카드 사이를 눈으로 오가야 한다. 계약 자리에서 가장 많이 받는 질문이 그것이다.
 *
 * 행이 기능, 열이 플랜이면 그 질문이 **한 줄 읽기**로 바뀐다.
 *
 * ## 어드민과 웹페이지를 나눠 싣는다
 * 같은 자원이라도 양쪽이 함께 열리지 않는다(`plan-features.ts` 머리말). 한 표에 뭉뚱그리면
 * "고객이 무엇을 볼 수 있는가" 를 답하지 못한다.
 *
 * ## 좁은 화면
 * 표는 자기 상자 안에서만 가로로 스크롤한다. 페이지 전체가 밀리면 사이드바까지 따라 움직인다.
 */
export function PlanMatrix({ plans, features, groups }: PlanMatrixProps) {
  const order = plans.map((plan) => plan.id);
  const cols = GRID[plans.length] ?? GRID[3];

  const surfaces: FeatureSurface[] = ['어드민', '웹페이지'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-160">
        {/* 머리줄 — 플랜 이름과 요금. 스크롤해도 무엇을 보는지 알아야 한다. */}
        <div className={`grid ${cols} items-end gap-x-2 border-b border-border px-6 py-4`}>
          <span className="text-xs uppercase tracking-widest text-ink-faint">기능</span>
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold">{plan.name}</span>
              <span className="whitespace-nowrap text-3xs tabular-nums text-ink-faint">
                {plan.monthly.toLocaleString('ko-KR')}원
              </span>
            </div>
          ))}
        </div>

        {surfaces.map((surface) => {
          const inSurface = features.filter((feature) => feature.surface === surface);
          if (inSurface.length === 0) return null;

          return (
            <section key={surface}>
              <div className="flex items-center gap-2 border-b border-border bg-surface px-6 py-2.5">
                <h3 className="text-sm font-semibold">{surface}</h3>
                <span className="text-xs text-ink-faint">{inSurface.length}개</span>
              </div>

              {groups.map((group) => {
                const inGroup = inSurface.filter((feature) => feature.group === group);
                if (inGroup.length === 0) return null;

                return (
                  <div key={group}>
                    <p className="border-b border-border px-6 py-2 text-xs uppercase tracking-widest text-ink-faint">
                      {group}
                    </p>

                    {inGroup.map((feature) => (
                      <div
                        key={feature.id}
                        className={`grid ${cols} items-center gap-x-2 border-b border-border px-6 py-3 last:border-b-0`}
                      >
                        <div className="min-w-0">
                          <p className="min-w-0 truncate text-sm">{feature.label}</p>
                          {/* 기능 이름만으로는 계약 자리에서 부족하다 — 한 줄 설명을 붙인다. */}
                          <p className="min-w-0 truncate text-xs text-ink-faint">{feature.note}</p>
                        </div>

                        {plans.map((plan) => (
                          <Cell key={plan.id} on={includedIn(feature, plan.id, order)} />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** 기능이 아직 정해지지 않은 도메인에 세우는 자리. 빈 표를 그리면 '기능이 없다' 로 읽힌다. */
export function PlanMatrixEmpty({ domain, note }: { domain: string; note: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Badge tone="wait">기능 미정</Badge>
      <p className="text-sm leading-relaxed text-ink-muted">
        {domain} 의 기능 구성은 아직 정하지 않았습니다.
        <br />
        {note}
      </p>
      <p className="max-w-120 text-xs leading-relaxed text-ink-faint">
        등급과 요금은 초안으로 세워 두었고 판매 종료 상태입니다. 없는 기능을 미리 적어 두면
        계약 자리에서 그것이 있는 것으로 읽히므로, 정해진 뒤에 채웁니다.
      </p>
    </div>
  );
}
