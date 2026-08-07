import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { MeetingListView } from './_components/MeetingListView';

/**
 * Feature: `meeting.list` · IR Admin · route `/shareholders/meetings`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '주주 | 주주총회 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrMeetingListPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', '주주총회']} activeChildId="ir-meetings">
      <MeetingListView />
    </IrShell>
  );
}
