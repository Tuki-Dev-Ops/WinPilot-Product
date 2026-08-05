import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { ContactListView } from './_components/ContactListView';

/**
 * Feature: `contact.list` · Internal Admin · route `/tenants/contacts`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 고객사 레코드에는 담당자가 한 명만 적혀 있지만 실제로는 결제 담당과 기술 담당이 다르다.
 * 한 칸에 눌러 담으면 누구에게 연락할지 매번 묻게 되고, 급할 때 그 물음이 가장 비싸다.
 */
export const metadata: Metadata = {
  title: '고객사 | 담당자 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalContactListPage() {
  return (
    <InternalShell sectionId="tenant" trail={['고객사', '담당자']} activeChildId="tenant-contact">
      <ContactListView />
    </InternalShell>
  );
}
