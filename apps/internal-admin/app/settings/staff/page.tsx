import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { StaffListView } from './_components/StaffListView';

/**
 * Feature: `internal.staff.list` · Internal Admin · route `/settings/staff`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * **이 콘솔에 들어오는 우리 직원**이다. 고객사가 자기 콘솔에서 쓰는 권한은 구독 · 권한
 * (`/subscriptions/roles`)에 있다 — 보는 사람도 여는 문도 달라 갈래를 나눴다.
 */
export const metadata: Metadata = {
  title: '설정 | 관리자 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalStaffListPage() {
  return (
    <InternalShell sectionId="settings" trail={['설정', '관리자']} activeChildId="settings-staff">
      <StaffListView />
    </InternalShell>
  );
}
