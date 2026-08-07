import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { PopupListView } from './_components/PopupListView';

/**
 * Feature: `popup.list` · IR Admin · route `/banners/popups`
 *
 * 들어오자마자 뜨는 창이다. 메인 비주얼과 값은 한 벌이고 `slot` 으로 갈린다.
 */
export const metadata: Metadata = {
  title: '배너 | 팝업 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function PopupListPage() {
  return (
    <IrShell sectionId="banner" trail={['배너', '팝업']} activeChildId="banner-popup">
      <PopupListView />
    </IrShell>
  );
}
