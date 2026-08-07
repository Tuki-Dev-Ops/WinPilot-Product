import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { NoticeListView } from './_components/NoticeListView';

/**
 * Feature: `notice.list` · IR Admin · route `/contents/notices`
 *
 * 회사 홈페이지의 공지다. **B2C 쇼핑몰의 공지와 다른 값**이다 — 배송 공지가 IR 사이트에
 * 서면 안 된다(`site.ts` 머리말).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function NoticeListPage() {
  return (
    <IrShell sectionId="content" trail={['콘텐츠', '공지사항']} activeChildId="content-notices">
      <NoticeListView />
    </IrShell>
  );
}
