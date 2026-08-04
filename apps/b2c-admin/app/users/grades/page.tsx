import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { GradeListView } from './_components/GradeListView';

/**
 * Feature: `grade.list` · B2C Admin · route `/users/grades`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '사용자 | 등급 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminGradeListPage() {
  return (
    <AdminShell sectionId="user" trail={['사용자', '등급']} activeChildId="user-grade">
      <GradeListView />
    </AdminShell>
  );
}
