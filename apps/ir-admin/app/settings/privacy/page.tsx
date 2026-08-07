import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { PrivacySettingsView } from './_components/PrivacySettingsView';

/**
 * Feature: `settings.privacy` · IR Admin · route `/settings/privacy`
 *
 * 적힌 것과 서버가 실제로 하는 일이 어긋나면 그대로 법 위반이다.
 */
export const metadata: Metadata = {
  title: '설정 | 개인정보 처리방침 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function PrivacySettingsPage() {
  return (
    <IrShell sectionId="settings" trail={['설정', '개인정보 처리방침']} activeChildId="settings-privacy">
      <PrivacySettingsView />
    </IrShell>
  );
}
