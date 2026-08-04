import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PolicyEditorView } from '@/app/settings/_components/PolicyEditorView';
import { PRIVACY } from '@/lib/data/policies';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `privacy.settings` · B2C Admin · route `/settings/privacy`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '설정 | 개인정보 처리방침 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminPrivacySettingsPage() {
  return (
    <AdminShell sectionId="settings" trail={['설정', '개인정보 처리방침']} activeChildId="settings-privacy">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <PolicyEditorView policy={PRIVACY} today={todayStamp()} />
    </AdminShell>
  );
}
