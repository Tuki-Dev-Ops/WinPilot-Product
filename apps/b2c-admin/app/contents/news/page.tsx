import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { NewsListView } from './_components/NewsListView';

/**
 * Feature: `news.list` · B2C Admin · route `/contents/news`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminNewsListPage() {
  return (
    <AdminShell sectionId="content" trail={['콘텐츠', '뉴스']} activeChildId="content-news">
      <NewsListView />
    </AdminShell>
  );
}
