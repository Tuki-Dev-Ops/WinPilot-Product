import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { InquiryListView } from './_components/InquiryListView';

/**
 * Feature: `inquiry.list` · B2C Admin · route `/inquiries`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '문의 | 목록 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminInquiryListPage() {
  return (
    <AdminShell sectionId="inquiry" trail={['문의', '목록']} activeChildId="inquiry-list">
      <InquiryListView />
    </AdminShell>
  );
}
