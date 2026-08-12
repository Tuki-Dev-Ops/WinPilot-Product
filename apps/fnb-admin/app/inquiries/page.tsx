import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { InquiryListView } from './_components/InquiryListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `inquiry.list` · F&B Admin · route `/inquiries`
 *
 * 사이트의 창업 상담 신청(`/franchise/apply`)이 여기로 쌓인다. 왜 지우는 자리가 없는지는
 * `InquiryListView` 머리말에 있다.
 */
export const metadata: Metadata = {
  title: adminTitle('창업', '문의 내역'),
  robots: { index: false, follow: false },
};

export default function FnbInquiryListPage() {
  return (
    <FnbShell sectionId="franchise" trail={['창업', '문의 내역']} activeChildId="franchise-inquiry">
      <InquiryListView />
    </FnbShell>
  );
}
