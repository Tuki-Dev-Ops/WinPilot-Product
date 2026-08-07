import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MEDIA_CLIPS, findMediaClip } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { NewsForm } from '@/app/contents/news/_components/NewsForm';

/**
 * Feature: `news.detail` · IR Admin · route `/contents/news/{newsId}`
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return MEDIA_CLIPS.map((one) => ({ newsId: one.id }));
}

export default async function NewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = await params;
  const clip = findMediaClip(newsId);
  if (!clip) notFound();

  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', '뉴스', '수정']}
      activeChildId="content-news"
      back={{ href: '/contents/news', label: '뉴스 목록' }}
    >
      <NewsForm mode="edit" code={clip.id} initial={clip} />
    </IrShell>
  );
}
