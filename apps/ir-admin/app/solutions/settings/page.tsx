import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionSettingsView } from './_components/SolutionSettingsView';

/**
 * Feature: `solution.settings` · IR Admin · route `/solutions/settings`
 *
 * 홈 화면의 회전 무대에 서는 여섯 서비스의 차례를 정한다.
 */
export const metadata: Metadata = {
  title: '솔루션 | 설정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function SolutionSettingsPage() {
  return (
    <IrShell sectionId="solution" trail={['솔루션', '설정']} activeChildId="solution-settings">
      <SolutionSettingsView />
    </IrShell>
  );
}
