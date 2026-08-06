import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { DisclosureListView } from './_components/DisclosureListView';

/**
 * Feature: `disclosure.list` · IR Admin · route `/disclosures`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '공시 | 공시 관리 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrDisclosureListPage() {
  return (
    <IrShell sectionId="disclosure" trail={['공시', '공시 관리']} activeChildId="disclosure-list">
      <DisclosureListView />
    </IrShell>
  );
}
