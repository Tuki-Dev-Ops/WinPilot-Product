import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FNB_ADMINS, findFnbAdmin } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { AdminForm } from './_components/AdminForm';
import { adminTitle } from '@/lib/metadata';

/** Feature: `settings.admin.detail` · F&B Admin · route `/settings/admins/{adminId}` */
export const metadata: Metadata = {
  title: adminTitle('설정', '관리자', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 계정이 다섯이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return FNB_ADMINS.map((one) => ({ adminId: one.id }));
}

export default async function FnbStaffDetailPage({ params }: { params: Promise<{ adminId: string }> }) {
  const { adminId } = await params;
  const found = findFnbAdmin(adminId);
  if (!found) notFound();

  return (
    <FnbShell
      sectionId="settings"
      trail={['설정', '관리자', '상세']}
      activeChildId="settings-admin"
      back={{ href: '/settings/admins', label: '관리자 목록' }}
    >
      <AdminForm admin={found} />
    </FnbShell>
  );
}
