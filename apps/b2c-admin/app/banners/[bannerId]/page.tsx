import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { BannerForm } from '@/app/banners/_components/BannerForm';
import { BANNERS, findBanner } from '@/lib/data/banners';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `banner.detail` · B2C Admin · route `/banners/{bannerId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '배너 | 메인 비주얼 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 배너만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return BANNERS.map((banner) => ({ bannerId: banner.id }));
}

export default async function AdminBannerDetailPage({ params }: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = await params;
  const banner = findBanner(bannerId);
  if (!banner) notFound();

  return (
    <AdminShell
      sectionId="banner"
      trail={['배너', '메인 비주얼', '상세페이지 (수정)']}
      activeChildId="banner-visual"
      back={{ href: '/banners', label: '메인 비주얼 목록' }}
    >
      <BannerForm
        mode="edit"
        bannerCode={banner.id}
        createdAt={banner.createdAt}
        today={todayStamp()}
        order={banner.order}
        initial={{
          title: banner.title,
          subtitle: banner.subtitle,
          badge: banner.badge,
          linkUrl: banner.linkUrl,
          startAt: banner.startAt,
          endAt: banner.endAt,
          visible: banner.visible,
        }}
      />
    </AdminShell>
  );
}
