import type { Metadata } from 'next';
import { SITE_NOTICES, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { NoticeForm } from '@/app/contents/notices/_components/NoticeForm';

/**
 * Feature: `notice.create` · IR Admin · route `/contents/notices/new`
 *
 * 코드는 서버가 정할 값이라 화면 밖에서 세어 넘긴다 — 폼 안에서 세면 화면을 다시 그릴 때마다
 * 코드가 흔들린다.
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 공지사항 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function NoticeCreatePage() {
  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', '공지사항', '등록']}
      activeChildId="content-notices"
      back={{ href: '/contents/notices', label: '공지사항 목록' }}
    >
      <NoticeForm mode="create" code={nextSiteId('N', SITE_NOTICES.map((one) => one.id))} />
    </IrShell>
  );
}
