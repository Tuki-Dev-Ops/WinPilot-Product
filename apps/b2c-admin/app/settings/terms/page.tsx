import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PolicyEditorView } from '@/app/settings/_components/PolicyEditorView';
import { TERMS } from '@/lib/data/policies';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `terms.settings` · B2C Admin · route `/settings/terms`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '설정 | 서비스 이용약관 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminTermsSettingsPage() {
  return (
    <AdminShell sectionId="settings" trail={['설정', '서비스 이용약관']} activeChildId="settings-terms">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <PolicyEditorView policy={TERMS} today={todayStamp()} />
    </AdminShell>
  );
}
