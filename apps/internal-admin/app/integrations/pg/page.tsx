import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { PaymentSettingsView } from './_components/PaymentSettingsView';

/**
 * Feature: `payment.settings` · Internal Admin · route `/integrations/pg`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 이 화면도 B2C Admin 에서 옮겨 왔다 — 실결제 전환은 되돌리기 어려워 사내에서만 다룬다.
 */
export const metadata: Metadata = {
  title: '연동 | PG — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default async function InternalPaymentSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;

  return (
    <InternalShell sectionId="integration" trail={['연동', 'PG']} activeChildId="integration-pg">
      <PaymentSettingsView {...(tenant ? { initialTenantId: tenant } : {})} />
    </InternalShell>
  );
}
