import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { todayStamp } from '@/lib/data/product-tags';
import { SeoSettingsView } from './_components/SeoSettingsView';

/**
 * Feature: `seo.settings` · B2C Admin · route `/settings/seo`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '설정 | SEO 정보 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminSeoSettingsPage() {
  return (
    <AdminShell sectionId="settings" trail={['설정', 'SEO 정보']} activeChildId="settings-seo">
      {/* 사이트맵의 lastmod 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <SeoSettingsView today={todayStamp()} />
    </AdminShell>
  );
}
