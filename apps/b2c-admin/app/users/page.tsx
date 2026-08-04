import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { UserListView } from './_components/UserListView';

/**
 * Feature: `user.list` · B2C Admin · route `/users`
 *
 * 껍데기는 서버 컴포넌트로 두고(metadata 를 내보내야 하므로) 상호작용은
 * `UserListView` 가 맡는다 — 탭 전환 · 검색 · 추가 모달 전부 클라이언트 상태다.
 */
export const metadata: Metadata = {
  title: '사용자 | 사용자 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminUserListPage() {
  return (
    <AdminShell sectionId="user" trail={['사용자', '사용자']} activeChildId="user-list">
      <UserListView />
    </AdminShell>
  );
}
