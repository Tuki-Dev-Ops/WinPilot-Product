import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { FinancialListView } from './_components/FinancialListView';

/**
 * Feature: `financial.list` · IR Admin · route `/financials`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '재무 | 재무 정보 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrFinancialListPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', '재무']} activeChildId="ir-financials">
      <FinancialListView />
    </IrShell>
  );
}
