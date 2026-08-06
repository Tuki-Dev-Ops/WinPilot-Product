import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { DnsSettingsView } from './_components/DnsSettingsView';

/**
 * Feature: `dns.settings` · Internal Admin · route `/integrations/dns`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 인증서는 DNS 로 발급받으므로 한 화면에 둔다 — 자물쇠가 안 붙는 원인이 이 표의 두 줄이다.
 *
 * 우리가 **값을 만들어 주고 확인만** 한다. 실제 등록은 고객사가 자기 도메인 관리 화면에서
 * 하므로 이 화면에는 저장이 없다 — 없는 권한을 있는 것처럼 그리면 눌러 놓고 왜 안 되는지 찾는다.
 */
export const metadata: Metadata = {
  title: '연동 | DNS / SSL — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default async function InternalDnsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;

  return (
    <InternalShell sectionId="integration" trail={['연동', 'DNS / SSL']} activeChildId="integration-dns">
      <DnsSettingsView {...(tenant ? { initialTenantId: tenant } : {})} />
    </InternalShell>
  );
}
