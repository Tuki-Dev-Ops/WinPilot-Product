import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { PeriodStatsView } from './_components/PeriodStatsView';

/**
 * Feature: `statistics.period` · IR Admin · route `/statistics/period`
 *
 * 달마다의 방문과 문의를 나란히 본다. 숫자는 아직 **씨앗**이다.
 */
export const metadata: Metadata = {
  title: '통계 | 기간별 분석 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function PeriodStatsPage() {
  return (
    <IrShell sectionId="statistics" trail={['통계', '기간별 분석']} activeChildId="statistics-period">
      <PeriodStatsView />
    </IrShell>
  );
}
