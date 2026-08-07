import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { StatisticsHomeView } from './_components/StatisticsHomeView';

/**
 * Feature: `statistics.home` · IR Admin · route `/statistics`
 *
 * 방문과 문의를 한 화면에서 나란히 본다.
 */
export const metadata: Metadata = {
  title: '통계 | 홈 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function StatisticsHomePage() {
  return (
    <IrShell sectionId="statistics" trail={['통계', '홈']} activeChildId="statistics-home">
      <StatisticsHomeView />
    </IrShell>
  );
}
