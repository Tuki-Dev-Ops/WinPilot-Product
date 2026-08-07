import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { StockSettingsView } from './_components/StockSettingsView';

/**
 * Feature: `stock.settings` · IR Admin · route `/financials/stock`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '재무 | 주가 연동 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrStockSettingsPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', '주가 연동']} activeChildId="ir-stock">
      <StockSettingsView />
    </IrShell>
  );
}
