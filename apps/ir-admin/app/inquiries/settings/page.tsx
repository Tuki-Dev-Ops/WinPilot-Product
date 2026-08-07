import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { InquirySettingsView } from './_components/InquirySettingsView';

/**
 * Feature: `inquiry.settings` · IR Admin · route `/inquiries/settings`
 *
 * 문의 양식이 무엇을 묻고 어디로 보낼지를 정한다.
 */
export const metadata: Metadata = {
  title: '문의 | 설정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function InquirySettingsPage() {
  return (
    <IrShell sectionId="inquiry" trail={['문의', '설정']} activeChildId="inquiry-settings">
      <InquirySettingsView />
    </IrShell>
  );
}
