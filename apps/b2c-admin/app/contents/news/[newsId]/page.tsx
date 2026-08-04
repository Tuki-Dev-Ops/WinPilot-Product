import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { NewsForm } from '@/app/contents/news/_components/NewsForm';
import { findNews, NEWS } from '@/lib/data/contents';

/**
 * Feature: `news.detail` · B2C Admin · route `/contents/news/{newsId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 뉴스만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return NEWS.map((news) => ({ newsId: news.id }));
}

export default async function AdminNewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = await params;
  const news = findNews(newsId);
  if (!news) notFound();

  return (
    <AdminShell sectionId="content" trail={['콘텐츠', '뉴스', '상세페이지 (수정)']} activeChildId="content-news">
      <NewsForm
        mode="edit"
        newsCode={news.id}
        createdAt={news.createdAt}
        initial={{
          title: news.title,
          press: news.press,
          url: news.url,
          publishedAt: news.publishedAt,
          summary: news.summary,
          visible: news.visible,
        }}
      />
    </AdminShell>
  );
}
