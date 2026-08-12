import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { ServiceSettingsView } from './_components/ServiceSettingsView';

/**
 * Feature: `service.settings` · IR Admin · route `/services/settings`
 *
 * 서비스 둘이 사이트 어디에 어떤 말로 서는지를 한자리에서 보여 준다. 고치는 자리가 아닌 이유는
 * 그쪽 머리말에 있다.
 */
export const metadata: Metadata = {
  title: '서비스 | 설정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function IrServiceSettingsPage() {
  return (
    <IrShell sectionId="service" trail={['서비스', '설정']} activeChildId="service-settings">
      <ServiceSettingsView />
    </IrShell>
  );
}
