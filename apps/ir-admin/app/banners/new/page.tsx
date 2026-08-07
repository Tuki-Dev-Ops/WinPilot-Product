import type { Metadata } from 'next';
import { SITE_BANNERS, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { BannerForm } from '@/app/banners/_components/BannerForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `banner.create` · IR Admin · route `/banners/new`
 */
export const metadata: Metadata = {
  title: '배너 | 메인 비주얼 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function BannerCreatePage() {
  return (
    <IrShell
      sectionId="banner"
      trail={['배너', '메인 비주얼', '등록']}
      activeChildId="banner-hero"
      back={{ href: '/banners', label: '메인 비주얼 목록' }}
    >
      <BannerForm
        mode="create"
        slot="메인 비주얼"
        code={nextSiteId('B', SITE_BANNERS.map((one) => one.id))}
        today={TODAY}
      />
    </IrShell>
  );
}
