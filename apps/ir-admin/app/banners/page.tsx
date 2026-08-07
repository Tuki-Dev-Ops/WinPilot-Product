import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { HeroBannerListView } from './_components/HeroBannerListView';

/**
 * Feature: `banner.list` · IR Admin · route `/banners`
 *
 * 첫 화면 위에 기간을 갖고 떴다 사라지는 배너다. 첫 화면의 장(`HERO_SLIDES`)과는 다른 값이다.
 */
export const metadata: Metadata = {
  title: '배너 | 메인 비주얼 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function HeroBannerListPage() {
  return (
    <IrShell sectionId="banner" trail={['배너', '메인 비주얼']} activeChildId="banner-hero">
      <HeroBannerListView />
    </IrShell>
  );
}
