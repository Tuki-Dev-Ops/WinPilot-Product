import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { todayStamp } from '@/lib/data/tenants';
import { TenantListView } from './_components/TenantListView';

/**
 * Feature: `tenant.list` · Internal Admin · route `/tenants`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '고객사 | 고객 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalTenantListPage() {
  return (
    <InternalShell sectionId="tenant" trail={['고객사', '고객']} activeChildId="tenant-list">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <TenantListView today={todayStamp()} />
    </InternalShell>
  );
}
