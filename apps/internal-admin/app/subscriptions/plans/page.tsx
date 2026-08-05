import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { PlanListView } from './_components/PlanListView';

/**
 * Feature: `plan.list` · Internal Admin · route `/subscriptions/plans`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 여기서 정한 플랜이 고객사의 배포에서 무엇을 열지를 정한다 — 플랜이 권한을 켠다.
 */
export const metadata: Metadata = {
  title: '구독 | 플랜 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalPlanListPage() {
  return (
    <InternalShell sectionId="subscription" trail={['구독', '플랜']} activeChildId="subscription-plan">
      <PlanListView />
    </InternalShell>
  );
}
