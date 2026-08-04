import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { InquirySettingsView } from './_components/InquirySettingsView';

/**
 * Feature: `inquiry.settings` · B2C Admin · route `/inquiries/settings`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '문의 | 설정 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminInquirySettingsPage() {
  return (
    <AdminShell sectionId="inquiry" trail={['문의', '설정']} activeChildId="inquiry-settings">
      <InquirySettingsView />
    </AdminShell>
  );
}
