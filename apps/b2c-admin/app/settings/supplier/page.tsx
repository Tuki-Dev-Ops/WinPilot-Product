import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { SupplierSettingsView } from './_components/SupplierSettingsView';

/**
 * Feature: `supplier.settings` · B2C Admin · route `/settings/supplier`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '설정 | 공급자 정보 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminSupplierSettingsPage() {
  return (
    <AdminShell sectionId="settings" trail={['설정', '공급자 정보']} activeChildId="settings-supplier">
      <SupplierSettingsView />
    </AdminShell>
  );
}
