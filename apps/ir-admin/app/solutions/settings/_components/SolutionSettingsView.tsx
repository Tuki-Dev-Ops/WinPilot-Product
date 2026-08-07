'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { SITE_SERVICES } from '@winpilot/store';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * 솔루션 > 설정.
 *
 * ## 차례를 여기서 바꾸지 못하게 둔 이유
 * 이 여섯은 홈 화면의 회전 무대에 **시계 방향으로** 놓이고, 그 순서가 곧 공정의 차례다 —
 * 컨설팅으로 진단하고, 인프라를 깔고, MES 로 현장을 표준화하고, ERP 로 자원을 잇고, CRM 으로
 * 고객을 받고, DXP 로 그 고객이 만나는 화면을 만든다. 여기서 순서를 바꾸면 그림이 **없는
 * 공정 흐름**을 그린다. 제품 메뉴의 차례와 달리 이건 취향이 아니라 그림의 뜻이다.
 *
 * 그래서 보여 주기만 하고, 바꾸는 일은 그림을 함께 손볼 때 코드에서 한다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `SITE_SERVICES` 다.
 */
export function SolutionSettingsView() {
  return (
    <>
      <PageHeading title="솔루션 설정" description="홈 화면 무대에 서는 여섯의 차례입니다." />

      <IrPanel title="공정의 차례" description="홈 무대에 시계 방향으로 이 순서대로 놓입니다.">
        <ol className="flex flex-col">
          {SITE_SERVICES.map((one) => (
            <li
              key={one.id}
              className="flex flex-wrap items-start gap-4 border-b border-border px-6 py-4 last:border-b-0"
            >
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-ink-faint">
                {one.no}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{one.name}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                  {one.body.join(' ')}
                </span>
              </span>

              <span className="shrink-0 font-mono text-xs text-ink-faint">{one.href}</span>
            </li>
          ))}
        </ol>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 차례를 바꾸는 자리는 두지 않습니다 — 이 순서는 홈 그림이
        그리는 공정의 흐름이라, 순서만 바꾸면 그림이 없는 흐름을 그립니다.
      </p>
    </>
  );
}
