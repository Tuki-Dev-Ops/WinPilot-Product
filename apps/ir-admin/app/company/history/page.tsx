import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { MilestoneListView } from './_components/MilestoneListView';

/**
 * Feature: `milestone.list` · IR Admin · route `/company/history`
 *
 * 사이트의 연혁 화면이 이 값을 읽는다. **B2C 어드민의 회사 > 연혁과 같은 값**이다 —
 * 한 회사의 연혁이 두 벌이 되면 안 되므로 그쪽과 원본을 나눠 갖지 않는다.
 */
export const metadata: Metadata = {
  title: '회사 | 연혁 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function MilestoneListPage() {
  return (
    <IrShell sectionId="company" trail={['회사', '연혁']} activeChildId="company-history">
      <MilestoneListView />
    </IrShell>
  );
}
