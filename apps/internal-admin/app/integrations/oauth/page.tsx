import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { OauthSettingsView } from './_components/OauthSettingsView';

/**
 * Feature: `oauth.settings` · Internal Admin · route `/integrations/oauth`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 이 화면은 원래 B2C Admin 에 있었다. 고객사가 자기 키를 직접 만지다 로그인을 멈추게 하는 것보다
 * 사내에서만 다루는 편이 안전해 이쪽으로 옮겼다.
 */
export const metadata: Metadata = {
  title: '연동 | OAuth 정보 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default async function InternalOauthSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;

  return (
    <InternalShell sectionId="integration" trail={['연동', 'OAuth 정보']} activeChildId="integration-oauth">
      <OauthSettingsView {...(tenant ? { initialTenantId: tenant } : {})} />
    </InternalShell>
  );
}
