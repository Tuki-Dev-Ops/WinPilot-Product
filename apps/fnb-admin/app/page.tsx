import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { DashboardView } from '@/app/_components/DashboardView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `dashboard` · F&B Admin · route `/`
 *
 * 무엇을 보여 주고 무엇을 안 보여 주는지는 `DashboardView` 머리말에 있다.
 */
export const metadata: Metadata = {
  title: adminTitle('대시보드'),
  robots: { index: false, follow: false },
};

export default function FnbSiteDashboardPage() {
  return (
    <FnbShell sectionId="dashboard" trail={['대시보드']}>
      {/*
        오늘을 화면이 정해서 넘긴다 — 조각 안에서 부르면 미리 만들어 두는 화면에서 빌드한 날이
        굳는다(`DashboardView` 머리말).
      */}
      <DashboardView today={new Date().toISOString().slice(0, 10)} />
    </FnbShell>
  );
}
