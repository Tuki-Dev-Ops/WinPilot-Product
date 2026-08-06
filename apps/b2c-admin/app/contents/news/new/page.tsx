import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { NewsForm } from '@/app/contents/news/_components/NewsForm';
import { NEWS, nextContentId } from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `news.create` · B2C Admin · route `/contents/news/new`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 뉴스 | 상세페이지 (등록) — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminNewsCreatePage() {
  return (
    <AdminShell sectionId="content" trail={['콘텐츠', '뉴스', '상세페이지 (등록)']} activeChildId="content-news" back={{ href: '/contents/news', label: '뉴스 목록' }}>
      {/* 코드·등록일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <NewsForm
        mode="create"
        newsCode={nextContentId('W', NEWS.map((news) => news.id))}
        createdAt={todayStamp()}
      />
    </AdminShell>
  );
}
