import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PortfolioListView } from './_components/PortfolioListView';

/**
 * Feature: `portfolio.list` · B2C Admin · route `/contents/portfolios`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 포트폴리오 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminPortfolioListPage() {
  return (
    <AdminShell sectionId="content" trail={['콘텐츠', '포트폴리오']} activeChildId="content-portfolio">
      <PortfolioListView />
    </AdminShell>
  );
}
