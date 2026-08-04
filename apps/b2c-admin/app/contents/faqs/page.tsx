import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { FaqListView } from './_components/FaqListView';

/**
 * Feature: `faq.list` · B2C Admin · route `/contents/faqs`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | FAQ — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminFaqListPage() {
  return (
    <AdminShell sectionId="content" trail={['콘텐츠', 'FAQ']} activeChildId="content-faq">
      <FaqListView />
    </AdminShell>
  );
}
