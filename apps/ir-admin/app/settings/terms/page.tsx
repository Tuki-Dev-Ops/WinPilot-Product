import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { TermsSettingsView } from './_components/TermsSettingsView';

/**
 * Feature: `settings.terms` · IR Admin · route `/settings/terms`
 *
 * 약관은 채워 넣는 순간 **효력을 주장할 문서**가 된다. 검토를 지난 글만 건다.
 */
export const metadata: Metadata = {
  title: '설정 | 서비스 이용약관 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function TermsSettingsPage() {
  return (
    <IrShell sectionId="settings" trail={['설정', '서비스 이용약관']} activeChildId="settings-terms">
      <TermsSettingsView />
    </IrShell>
  );
}
