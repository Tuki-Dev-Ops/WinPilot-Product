import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternalShell } from '@/app/_components/InternalShell';
import { CONSOLE_DOMAINS, CONSOLE_ROLES, findConsoleRole } from '@/lib/data/permissions';
import { RoleDetailView } from '../_components/RoleDetailView';

/**
 * Feature: `role.detail` · Internal Admin · route `/subscriptions/roles/{roleId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 목록(`/subscriptions/roles`)에서는 **역할이 몇 개이고 누가 무엇을 맡는지**를 읽고, 여기서는
 * **그 역할이 자원마다 어디까지 하는지**를 켜고 끈다. 자원 열다섯 × 동작 넷은 목록 밑에
 * 펼치기에도 모달에 담기에도 크다.
 */
export const metadata: Metadata = {
  title: '구독 | 권한 | 상세 — WinPilot Internal',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 역할이 템플릿 열둘뿐이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return CONSOLE_DOMAINS.flatMap((domain) => CONSOLE_ROLES[domain].map((role) => ({ roleId: role.id })));
}

export default async function InternalRoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const found = findConsoleRole(roleId);
  if (!found) notFound();

  return (
    <InternalShell
      sectionId="subscription"
      trail={['구독', '권한', `${found.domain} · ${found.role.label}`]}
      activeChildId="subscription-role"
      back={{ href: '/subscriptions/roles', label: '권한 목록' }}
    >
      <RoleDetailView domain={found.domain} role={found.role} />
    </InternalShell>
  );
}
