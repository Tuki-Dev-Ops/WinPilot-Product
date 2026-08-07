import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_NOTICES, findSiteNotice } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { NoticeForm } from '@/app/contents/notices/_components/NoticeForm';

/**
 * Feature: `notice.detail` · IR Admin · route `/contents/notices/{noticeId}`
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SITE_NOTICES.map((one) => ({ noticeId: one.id }));
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = findSiteNotice(noticeId);
  if (!notice) notFound();

  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', '공지사항', '수정']}
      activeChildId="content-notices"
      back={{ href: '/contents/notices', label: '공지사항 목록' }}
    >
      <NoticeForm mode="edit" code={notice.id} initial={notice} />
    </IrShell>
  );
}
