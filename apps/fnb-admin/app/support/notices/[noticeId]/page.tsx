import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FNB_NOTICES, findFnbNotice } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { NoticeForm } from '@/app/support/notices/_components/NoticeForm';
import { adminTitle } from '@/lib/metadata';

/** Feature: `support.notice.detail` · F&B Admin · route `/support/notices/{noticeId}` */
export const metadata: Metadata = {
  title: adminTitle('고객센터', '공지사항', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 공지가 넷이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return FNB_NOTICES.map((one) => ({ noticeId: one.id }));
}

export default async function FnbNoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = findFnbNotice(noticeId);
  if (!notice) notFound();

  return (
    <FnbShell
      sectionId="support"
      trail={['고객센터', '공지사항', '상세']}
      activeChildId="support-notice"
      back={{ href: '/support/notices', label: '공지사항 목록' }}
    >
      <NoticeForm notice={notice} />
    </FnbShell>
  );
}
