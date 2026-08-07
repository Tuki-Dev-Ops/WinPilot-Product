import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { InquiryListView } from './_components/InquiryListView';

/**
 * Feature: `inquiry.list` · IR Admin · route `/inquiries`
 *
 * 사이트의 문의 양식으로 들어온 것이 여기 쌓인다. **밖에서 들어온 것**이라 메뉴에서도 맨 앞이다.
 */
export const metadata: Metadata = {
  title: '문의 | 목록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function InquiryListPage() {
  return (
    <IrShell sectionId="inquiry" trail={['문의', '목록']} activeChildId="inquiry-list">
      <InquiryListView />
    </IrShell>
  );
}
