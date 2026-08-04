import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { MilestoneListView } from './_components/MilestoneListView';

/**
 * Feature: `milestone.list` · B2C Admin · route `/company/history`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '회사 | 연혁 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminMilestoneListPage() {
  return (
    <AdminShell sectionId="company" trail={['회사', '연혁']} activeChildId="company-history">
      <MilestoneListView />
    </AdminShell>
  );
}
