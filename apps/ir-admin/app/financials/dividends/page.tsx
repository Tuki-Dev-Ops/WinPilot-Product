import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { DividendListView } from './_components/DividendListView';

/**
 * Feature: `dividend.list` · IR Admin · route `/financials/dividends`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '재무 | 배당 정보 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrDividendListPage() {
  return (
    <IrShell sectionId="financial" trail={['재무', '배당 정보']} activeChildId="financial-dividend">
      <DividendListView />
    </IrShell>
  );
}
