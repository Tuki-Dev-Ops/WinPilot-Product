import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { AdminListView } from './_components/AdminListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `settings.admin` · F&B Admin · route `/settings/admins`
 *
 * 안 쓰는 계정이 남아 있는 것이 이 종류의 콘솔에서 가장 흔한 구멍이라, 마지막 접속을 열로 세운다.
 */
export const metadata: Metadata = {
  title: adminTitle('설정', '관리자'),
  robots: { index: false, follow: false },
};

export default function FnbStaffListPage() {
  return (
    <FnbShell sectionId="settings" trail={['설정', '관리자']} activeChildId="settings-admin">
      <AdminListView />
    </FnbShell>
  );
}
