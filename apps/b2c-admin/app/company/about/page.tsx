import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { CompanyProfileForm } from './_components/CompanyProfileForm';

/**
 * Feature: `profile.settings` · B2C Admin · route `/company/about`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '회사 | 소개 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminProfileSettingsPage() {
  return (
    <AdminShell sectionId="company" trail={['회사', '소개']} activeChildId="company-about">
      <CompanyProfileForm />
    </AdminShell>
  );
}
