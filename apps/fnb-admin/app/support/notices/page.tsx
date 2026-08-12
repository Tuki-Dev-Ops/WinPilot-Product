import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { NoticeListView } from './_components/NoticeListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `support.notices` · F&B Admin · route `/support/notices`
 *
 * 사이트의 홈 공지 띠와 고객센터 공지사항이 이 목록을 읽는다.
 *
 * 요청받은 갈래 표에는 없던 화면이다. 그런데 **사이트가 이 값을 읽고 있어**, 여기서 빼면
 * 공지를 고칠 자리가 어디에도 없어진다. 고객센터 아래가 제자리다.
 */
export const metadata: Metadata = {
  title: adminTitle('고객센터', '공지사항'),
  robots: { index: false, follow: false },
};

export default function FnbNoticeListPage() {
  return (
    <FnbShell sectionId="support" trail={['고객센터', '공지사항']} activeChildId="support-notice">
      <NoticeListView />
    </FnbShell>
  );
}
