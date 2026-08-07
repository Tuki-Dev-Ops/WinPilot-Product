import type { Metadata } from 'next';
import { MEDIA_CLIPS, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { NewsForm } from '@/app/contents/news/_components/NewsForm';

/**
 * Feature: `news.create` · IR Admin · route `/contents/news/new`
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function NewsCreatePage() {
  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', '뉴스', '등록']}
      activeChildId="content-news"
      back={{ href: '/contents/news', label: '뉴스 목록' }}
    >
      <NewsForm mode="create" code={nextSiteId('MC', MEDIA_CLIPS.map((one) => one.id))} />
    </IrShell>
  );
}
