import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { DashboardView } from './_components/DashboardView';

/**
 * Feature: `site.dashboard` · IR Admin · route `/`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '대시보드 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrSiteDashboardPage() {
  return (
    <IrShell sectionId="dashboard" trail={['대시보드']}>
      <DashboardView />
    </IrShell>
  );
}
