import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { KOREA_BOX, KOREA_SHAPES } from '@/lib/geo/korea';
import { DashboardView } from './_components/DashboardView';

/**
 * Feature: `site.dashboard` · IR Admin · route `/`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * ## 지도 경계선을 여기서 넘긴다
 * 시 · 도 경계선은 214KB 짜리 좌표에서 나온다. 그 값과 그것을 다루는 `d3-geo` 는 **서버에만
 * 있어야 한다** — 대시보드에 들어오는 사람마다 214KB 를 내려받게 할 이유가 없다. 여기(서버
 * 컴포넌트)에서 경로 문자열 열일곱 개로 줄여 넘기면 브라우저가 받는 것은 3KB 남짓이다.
 */
export const metadata: Metadata = {
  title: '대시보드 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrSiteDashboardPage() {
  return (
    <IrShell sectionId="dashboard" trail={['대시보드']}>
      <DashboardView shapes={KOREA_SHAPES} box={KOREA_BOX} />
    </IrShell>
  );
}
