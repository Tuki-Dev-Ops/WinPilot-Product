import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { NoticeForm } from '@/app/contents/notices/_components/NoticeForm';
import { findNotice, NOTICES } from '@/lib/data/contents';

/**
 * Feature: `notice.detail` · B2C Admin · route `/contents/notices/{noticeId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 공지만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return NOTICES.map((notice) => ({ noticeId: notice.id }));
}

export default async function AdminNoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = findNotice(noticeId);
  if (!notice) notFound();

  return (
    <AdminShell
      sectionId="content"
      trail={['콘텐츠', '공지사항', '상세페이지 (수정)']}
      activeChildId="content-notice"
      back={{ href: '/contents/notices', label: '공지사항 목록' }}
    >
      <NoticeForm
        mode="edit"
        noticeCode={notice.id}
        createdAt={notice.createdAt}
        initial={{
          title: notice.title,
          body: notice.body,
          pinned: notice.pinned,
          visible: notice.visible,
        }}
      />
    </AdminShell>
  );
}
