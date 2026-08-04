import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { todayStamp } from '@/lib/data/product-tags';
import { BannerListView } from './_components/BannerListView';

/**
 * Feature: `banner.list` · B2C Admin · route `/banners`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '배너 | 메인 비주얼 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminBannerListPage() {
  return (
    <AdminShell sectionId="banner" trail={['배너', '메인 비주얼']} activeChildId="banner-visual">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <BannerListView today={todayStamp()} />
    </AdminShell>
  );
}
