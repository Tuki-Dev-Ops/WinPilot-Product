import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { NoticeListView } from './_components/NoticeListView';

/**
 * Feature: `notice.list` · B2C Admin · route `/contents/notices`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminNoticeListPage() {
  return (
    <AdminShell sectionId="content" trail={['콘텐츠', '공지사항']} activeChildId="content-notice">
      <NoticeListView />
    </AdminShell>
  );
}
