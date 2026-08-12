import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { PopupListView } from '@/app/banners/_components/PopupListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `banner.popup` · F&B Admin · route `/banners/popups`
 *
 * 팝업은 **읽는 것을 막는다** — 배너와 나눠 두는 까닭이 그것이다(목록 머리말).
 */
export const metadata: Metadata = {
  title: adminTitle('배너', '팝업'),
  robots: { index: false, follow: false },
};

export default function FnbPopupListPage() {
  return (
    <FnbShell sectionId="banner" trail={['배너', '팝업']} activeChildId="banner-popup">
      <PopupListView />
    </FnbShell>
  );
}
