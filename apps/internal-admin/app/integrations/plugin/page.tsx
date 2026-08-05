import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { PluginSettingsView } from './_components/PluginSettingsView';

/**
 * Feature: `plugin.settings` · Internal Admin · route `/integrations/plugin`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 여기서 켠 것은 고객사 배포에서 **바로 돈다.** 그래서 보이지 않는 조각(분석 스크립트 등)도
 * 목록에서 숨기지 않는다 — 켠 사실을 잊으면 무엇이 밖으로 나가는지 아무도 모른다.
 */
export const metadata: Metadata = {
  title: '연동 | Plugin — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default async function InternalPluginSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;

  return (
    <InternalShell sectionId="integration" trail={['연동', 'Plugin']} activeChildId="integration-plugin">
      <PluginSettingsView {...(tenant ? { initialTenantId: tenant } : {})} />
    </InternalShell>
  );
}
