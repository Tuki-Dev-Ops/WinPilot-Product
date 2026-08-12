import type { Metadata } from 'next';
import { blankFnbNotice } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { NoticeForm } from '@/app/support/notices/_components/NoticeForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `support.notice.create` · F&B Admin · route `/support/notices/new`
 *
 * 고정과 공개를 꺼 둔 채로 열린다 — **적다 만 공지가 홈 띠에 흐르는 것**을 막으려는 것이다.
 */
export const metadata: Metadata = {
  title: adminTitle('고객센터', '공지사항', '새 공지'),
  robots: { index: false, follow: false },
};

export default function FnbNoticeCreatePage() {
  return (
    <FnbShell
      sectionId="support"
      trail={['고객센터', '공지사항', '새 공지']}
      activeChildId="support-notice"
      back={{ href: '/support/notices', label: '공지사항 목록' }}
    >
      <NoticeForm notice={blankFnbNotice()} mode="create" />
    </FnbShell>
  );
}
