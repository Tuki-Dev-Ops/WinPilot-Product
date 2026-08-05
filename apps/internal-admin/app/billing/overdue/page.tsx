import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { todayStamp } from '@/lib/data/tenants';
import { OverdueListView } from './_components/OverdueListView';

/**
 * Feature: `overdue.list` · Internal Admin · route `/billing/overdue`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 예정 목록과 화면을 나눈 이유는 그것 하나다 — 섞으면 급한 것이 묻힌다.
 */
export const metadata: Metadata = {
  title: '결제 | 연체 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalOverdueListPage() {
  return (
    <InternalShell sectionId="billing" trail={['결제', '연체']} activeChildId="billing-overdue">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <OverdueListView today={todayStamp()} />
    </InternalShell>
  );
}
