import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { LocaleSettingsView } from './_components/LocaleSettingsView';

/**
 * Feature: `locale.settings` · IR Admin · route `/settings/locales`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '설정 | 국문 · 영문 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrLocaleSettingsPage() {
  return (
    <IrShell sectionId="settings" trail={['설정', '국문 · 영문']} activeChildId="settings-locale">
      <LocaleSettingsView />
    </IrShell>
  );
}
