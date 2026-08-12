import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { BannerListView } from '@/app/banners/_components/BannerListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `banner.main` · F&B Admin · route `/banners/main`
 *
 * 사이트 첫 화면이 이 목록에서 지금 걸리는 것을 골라 세운다.
 */
export const metadata: Metadata = {
  title: adminTitle('배너', '메인 비주얼'),
  robots: { index: false, follow: false },
};

export default function FnbBannerListPage() {
  return (
    <FnbShell sectionId="banner" trail={['배너', '메인 비주얼']} activeChildId="banner-main">
      <BannerListView />
    </FnbShell>
  );
}
