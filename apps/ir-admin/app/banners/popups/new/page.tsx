import type { Metadata } from 'next';
import { SITE_BANNERS, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { BannerForm } from '@/app/banners/_components/BannerForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `popup.create` · IR Admin · route `/banners/popups/new`
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function PopupCreatePage() {
  return (
    <IrShell
      sectionId="banner"
      trail={['배너', '팝업', '등록']}
      activeChildId="banner-popup"
      back={{ href: '/banners/popups', label: '팝업 목록' }}
    >
      <BannerForm
        mode="create"
        slot="팝업"
        code={nextSiteId('B', SITE_BANNERS.map((one) => one.id))}
        today={TODAY}
      />
    </IrShell>
  );
}
