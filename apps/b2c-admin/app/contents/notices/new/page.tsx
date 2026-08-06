import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { NoticeForm } from '@/app/contents/notices/_components/NoticeForm';
import { NOTICES, nextContentId } from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `notice.create` · B2C Admin · route `/contents/notices/new`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 | 상세페이지 (등록) — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminNoticeCreatePage() {
  return (
    <AdminShell
      sectionId="content"
      trail={['콘텐츠', '공지사항', '상세페이지 (등록)']}
      activeChildId="content-notice"
      back={{ href: '/contents/notices', label: '공지사항 목록' }}
    >
      {/* 코드·등록일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <NoticeForm
        mode="create"
        noticeCode={nextContentId('N', NOTICES.map((notice) => notice.id))}
        createdAt={todayStamp()}
      />
    </AdminShell>
  );
}
