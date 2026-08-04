import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { PopupForm } from '@/app/banners/popups/_components/PopupForm';
import { findPopup, POPUPS } from '@/lib/data/banners';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `popup.detail` · B2C Admin · route `/banners/popups/{popupId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 팝업만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return POPUPS.map((popup) => ({ popupId: popup.id }));
}

export default async function AdminPopupDetailPage({ params }: { params: Promise<{ popupId: string }> }) {
  const { popupId } = await params;
  const popup = findPopup(popupId);
  if (!popup) notFound();

  return (
    <AdminShell sectionId="banner" trail={['배너', '팝업', '상세페이지 (수정)']} activeChildId="banner-popup">
      <PopupForm
        mode="edit"
        popupCode={popup.id}
        createdAt={popup.createdAt}
        today={todayStamp()}
        initial={{
          title: popup.title,
          body: popup.body,
          linkUrl: popup.linkUrl,
          startAt: popup.startAt,
          endAt: popup.endAt,
          position: popup.position,
          width: popup.width,
          todayClose: popup.todayClose,
          visible: popup.visible,
        }}
      />
    </AdminShell>
  );
}
