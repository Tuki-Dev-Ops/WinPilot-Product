import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { todayStamp } from '@/lib/data/product-tags';
import { PopupListView } from './_components/PopupListView';

/**
 * Feature: `popup.list` · B2C Admin · route `/banners/popups`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminPopupListPage() {
  return (
    <AdminShell sectionId="banner" trail={['배너', '팝업']} activeChildId="banner-popup">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <PopupListView today={todayStamp()} />
    </AdminShell>
  );
}
