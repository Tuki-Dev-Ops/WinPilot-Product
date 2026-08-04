import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { StaffListView } from './_components/StaffListView';

/**
 * Feature: `staff.list` · B2C Admin · route `/users/admins`
 *
 * 엔티티는 `staff` 다 — 'admin' 은 뷰 접두어(AdminXxxPage)와 겹쳐 엔티티명으로 쓰지 않는다
 * (packages/spec/src/glossary.ts).
 */
export const metadata: Metadata = {
  title: '사용자 | 관리자 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminStaffListPage() {
  return (
    <AdminShell sectionId="user" trail={['사용자', '관리자']} activeChildId="user-admin">
      <StaffListView />
    </AdminShell>
  );
}
