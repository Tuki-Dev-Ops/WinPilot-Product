import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FNB_POPUPS, findFnbPopup } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { PopupForm } from './_components/PopupForm';
import { adminTitle } from '@/lib/metadata';

/** Feature: `banner.popup.detail` · F&B Admin · route `/banners/popups/{popupId}` */
export const metadata: Metadata = {
  title: adminTitle('배너', '팝업', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 팝업이 셋이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return FNB_POPUPS.map((one) => ({ popupId: one.id }));
}

export default async function FnbPopupDetailPage({ params }: { params: Promise<{ popupId: string }> }) {
  const { popupId } = await params;
  const found = findFnbPopup(popupId);
  if (!found) notFound();

  return (
    <FnbShell
      sectionId="banner"
      trail={['배너', '팝업', '상세']}
      activeChildId="banner-popup"
      back={{ href: '/banners/popups', label: '팝업 목록' }}
    >
      <PopupForm popup={found} />
    </FnbShell>
  );
}
