import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SupplierSettingsView } from './_components/SupplierSettingsView';

/**
 * Feature: `settings.supplier` · IR Admin · route `/settings/supplier`
 *
 * 사이트 아래에 법이 적으라고 정한 사업자 표시다.
 */
export const metadata: Metadata = {
  title: '설정 | 공급자 정보 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function SupplierSettingsPage() {
  return (
    <IrShell sectionId="settings" trail={['설정', '공급자 정보']} activeChildId="settings-supplier">
      <SupplierSettingsView />
    </IrShell>
  );
}
