import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { SupportListView } from './_components/SupportListView';

/**
 * Feature: `support.list` · B2C Admin · route `/support`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 여기 문의는 **이 고객사가 스페이스플래닝에게** 보내는 것이다. 고객이 이 고객사에게 보낸 문의는
 * 위쪽 갈래(`/inquiries`)에 있다 — 받는 쪽도 답하는 쪽도 달라 메뉴를 갈랐다.
 */
export const metadata: Metadata = {
  title: '고객 지원 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminSupportListPage() {
  return (
    <AdminShell sectionId="support" trail={['고객 지원']}>
      <SupportListView />
    </AdminShell>
  );
}
