import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FNB_BANNERS, findFnbBanner } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { BannerForm } from './_components/BannerForm';
import { adminTitle } from '@/lib/metadata';

/** Feature: `banner.main.detail` · F&B Admin · route `/banners/main/{bannerId}` */
export const metadata: Metadata = {
  title: adminTitle('배너', '메인 비주얼', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 배너가 셋이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return FNB_BANNERS.map((one) => ({ bannerId: one.id }));
}

export default async function FnbBannerDetailPage({ params }: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = await params;
  const found = findFnbBanner(bannerId);
  if (!found) notFound();

  return (
    <FnbShell
      sectionId="banner"
      trail={['배너', '메인 비주얼', '상세']}
      activeChildId="banner-main"
      back={{ href: '/banners/main', label: '메인 비주얼 목록' }}
    >
      <BannerForm banner={found} />
    </FnbShell>
  );
}
