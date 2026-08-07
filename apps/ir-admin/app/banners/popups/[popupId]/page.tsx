import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_BANNERS, findSiteBanner } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { BannerForm } from '@/app/banners/_components/BannerForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `popup.detail` · IR Admin · route `/banners/popups/{popupId}`
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 이 자리에 서는 것만 미리 만든다. */
export function generateStaticParams() {
  return SITE_BANNERS.filter((one) => one.slot === '팝업').map((one) => ({ popupId: one.id }));
}

export default async function PopupDetailPage({ params }: { params: Promise<{ popupId: string }> }) {
  const { popupId } = await params;
  const banner = findSiteBanner(popupId);
  if (!banner) notFound();

  return (
    <IrShell
      sectionId="banner"
      trail={['배너', '팝업', '수정']}
      activeChildId="banner-popup"
      back={{ href: '/banners/popups', label: '팝업 목록' }}
    >
      <BannerForm mode="edit" slot="팝업" code={banner.id} today={TODAY} initial={banner} />
    </IrShell>
  );
}
