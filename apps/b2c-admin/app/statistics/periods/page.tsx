import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PeriodAnalysisView } from './_components/PeriodAnalysisView';

/**
 * Feature: `analytics.list` · B2C Admin · route `/statistics/periods`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '통계 | 기간별 분석 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsListPage() {
  return (
    <AdminShell sectionId="analytics" trail={['통계', '기간별 분석']} activeChildId="analytics-periods">
      <PeriodAnalysisView />
    </AdminShell>
  );
}
