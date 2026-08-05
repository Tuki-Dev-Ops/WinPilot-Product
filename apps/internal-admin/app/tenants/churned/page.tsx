import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { ChurnListView } from './_components/ChurnListView';

/**
 * Feature: `churn.list` · Internal Admin · route `/tenants/churned`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 떠난 고객사를 목록에서 지우지 않는 이유는 남은 것이 금액이 아니라 **이유**이기 때문이다.
 * 그 이유가 다음 계약의 조건을 정한다.
 */
export const metadata: Metadata = {
  title: '고객사 | 이탈 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalChurnListPage() {
  return (
    <InternalShell sectionId="tenant" trail={['고객사', '이탈']} activeChildId="tenant-churn">
      <ChurnListView />
    </InternalShell>
  );
}
