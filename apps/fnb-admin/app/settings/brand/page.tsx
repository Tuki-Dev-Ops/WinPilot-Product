import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { BrandSettingsView } from './_components/BrandSettingsView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `settings.brand` · F&B Admin · route `/settings/brand`
 *
 * 사이트의 첫 화면과 푸터가 이 값을 읽는다.
 */
export const metadata: Metadata = {
  title: adminTitle('설정', '브랜드 정보'),
  robots: { index: false, follow: false },
};

export default function FnbBrandSettingsPage() {
  return (
    <FnbShell sectionId="settings" trail={['설정', '브랜드 정보']} activeChildId="settings-brand">
      <BrandSettingsView />
    </FnbShell>
  );
}
