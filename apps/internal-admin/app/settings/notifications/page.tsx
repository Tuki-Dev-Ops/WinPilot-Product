import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { AlarmSettingsView } from './_components/AlarmSettingsView';

/**
 * Feature: `alarm.settings` · Internal Admin · route `/settings/notifications`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 통계·결제가 만들어 내는 신호(만료 임박·연체)를 **받을 곳**이다. 신호를 내는 화면마다
 * 알림 조건을 박아 두면 같은 규칙이 화면 수만큼 늘어나고, 늘어난 규칙은 한 번에 고쳐지지 않는다.
 */
export const metadata: Metadata = {
  title: '설정 | 알림 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalAlarmSettingsPage() {
  return (
    <InternalShell sectionId="settings" trail={['설정', '알림']} activeChildId="settings-alarm">
      <AlarmSettingsView />
    </InternalShell>
  );
}
