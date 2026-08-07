import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { DartSettingsView } from './_components/DartSettingsView';

/**
 * Feature: `disclosure.settings` · IR Admin · route `/disclosures/dart`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '공시 | DART 연동 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrDisclosureSettingsPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', 'DART 연동']} activeChildId="ir-dart">
      <DartSettingsView />
    </IrShell>
  );
}
