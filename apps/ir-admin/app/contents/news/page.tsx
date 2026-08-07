import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { NewsListView } from './_components/NewsListView';

/**
 * Feature: `news.list` · IR Admin · route `/contents/news`
 *
 * 사이트의 CS CENTER > 뉴스와 홈 마지막 칸이 같은 값을 읽는다. 홈은 다섯 장 남짓만 흘리고,
 * 전체는 뉴스 화면에 선다.
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function NewsPage() {
  return (
    <IrShell sectionId="content" trail={['콘텐츠', '뉴스']} activeChildId="content-news">
      <NewsListView />
    </IrShell>
  );
}
