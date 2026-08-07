import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_BANNERS, findSiteBanner } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { BannerForm } from '@/app/banners/_components/BannerForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `banner.detail` · IR Admin · route `/banners/{bannerId}`
 *
 * 팝업은 `/banners/popups/{popupId}` 로 따로 연다 — 메뉴가 둘이므로 돌아갈 목록도 둘이다.
 */
export const metadata: Metadata = {
  title: '배너 | 메인 비주얼 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 이 자리에 서는 것만 미리 만든다. */
export function generateStaticParams() {
  return SITE_BANNERS.filter((one) => one.slot === '메인 비주얼').map((one) => ({ bannerId: one.id }));
}

export default async function BannerDetailPage({ params }: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = await params;
  const banner = findSiteBanner(bannerId);
  if (!banner) notFound();

  return (
    <IrShell
      sectionId="banner"
      trail={['배너', '메인 비주얼', '수정']}
      activeChildId="banner-hero"
      back={{ href: '/banners', label: '메인 비주얼 목록' }}
    >
      <BannerForm mode="edit" slot="메인 비주얼" code={banner.id} today={TODAY} initial={banner} />
    </IrShell>
  );
}
