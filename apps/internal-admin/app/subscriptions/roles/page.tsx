import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { RoleListView } from './_components/RoleListView';

/**
 * Feature: `role.list` · Internal Admin · route `/subscriptions/roles`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 여기 권한은 **고객사가 자기 콘솔에서 쓰는** 것이다. 이 콘솔에 들어오는 우리 직원의 권한은
 * 설정 · 관리자(`/settings/staff`)에 있다 — 보는 사람이 달라 갈래를 나눴다.
 */
export const metadata: Metadata = {
  title: '구독 | 권한 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalRoleListPage() {
  return (
    <InternalShell sectionId="subscription" trail={['구독', '권한']} activeChildId="subscription-role">
      <RoleListView />
    </InternalShell>
  );
}
