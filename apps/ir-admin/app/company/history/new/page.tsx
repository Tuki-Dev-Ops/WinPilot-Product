import type { Metadata } from 'next';
import { MILESTONES, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { MilestoneForm } from '@/app/company/history/_components/MilestoneForm';

/**
 * Feature: `milestone.create` · IR Admin · route `/company/history/new`
 */
export const metadata: Metadata = {
  title: '회사 | 연혁 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function MilestoneCreatePage() {
  return (
    <IrShell
      sectionId="company"
      trail={['회사', '연혁', '등록']}
      activeChildId="company-history"
      back={{ href: '/company/history', label: '연혁 목록' }}
    >
      <MilestoneForm mode="create" code={nextSiteId('M', MILESTONES.map((one) => one.id))} />
    </IrShell>
  );
}
