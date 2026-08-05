import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { ActivityListView } from './_components/ActivityListView';

/**
 * Feature: `activity.list` · Internal Admin · route `/tenants/activities`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 언제 누구와 무엇을 했는지를 남긴다. **사람 머리에만 있으면 담당자가 바뀌는 순간 사라진다** —
 * 그러면 다음 사람이 같은 것을 다시 묻고, 고객사는 우리가 아무것도 기억하지 못한다고 느낀다.
 */
export const metadata: Metadata = {
  title: '고객사 | 활동 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalActivityListPage() {
  return (
    <InternalShell sectionId="tenant" trail={['고객사', '활동']} activeChildId="tenant-activity">
      <ActivityListView />
    </InternalShell>
  );
}
