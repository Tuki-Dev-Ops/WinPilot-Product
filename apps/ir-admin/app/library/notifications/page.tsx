import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SubscriberListView } from './_components/SubscriberListView';

/**
 * Feature: `subscriber.list` · IR Admin · route `/library/notifications`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '자료 | 알림 발송 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrSubscriberListPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', '알림 구독자']} activeChildId="ir-subscribers">
      <SubscriberListView />
    </IrShell>
  );
}
