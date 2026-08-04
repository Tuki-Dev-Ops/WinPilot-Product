import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PopupForm } from '@/app/banners/popups/_components/PopupForm';
import { POPUPS } from '@/lib/data/banners';
import { nextContentId } from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `popup.create` · B2C Admin · route `/banners/popups/new`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 | 상세페이지 (등록) — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminPopupCreatePage() {
  const today = todayStamp();

  return (
    <AdminShell sectionId="banner" trail={['배너', '팝업', '상세페이지 (등록)']} activeChildId="banner-popup">
      {/* 코드·기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <PopupForm
        mode="create"
        popupCode={nextContentId('P', POPUPS.map((popup) => popup.id))}
        createdAt={today}
        today={today}
      />
    </AdminShell>
  );
}
