import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionListView } from './_components/SolutionListView';

/**
 * Feature: `solution.list` · IR Admin · route `/solutions`
 *
 * 사이트의 솔루션 상세(`/solutions/*`)가 이 값을 읽는다.
 */
export const metadata: Metadata = {
  title: '솔루션 | 목록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function SolutionListPage() {
  return (
    <IrShell sectionId="solution" trail={['솔루션', '목록']} activeChildId="solution-list">
      <SolutionListView />
    </IrShell>
  );
}
