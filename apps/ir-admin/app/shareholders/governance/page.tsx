import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { GovernanceListView } from './_components/GovernanceListView';

/**
 * Feature: `governance.list` · IR Admin · route `/shareholders/governance`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '주주 | 지배구조 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrGovernanceListPage() {
  return (
    <IrShell sectionId="shareholder" trail={['주주', '지배구조']} activeChildId="shareholder-governance">
      <GovernanceListView />
    </IrShell>
  );
}
