import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PortfolioForm } from '@/app/contents/portfolios/_components/PortfolioForm';
import { nextContentId, PORTFOLIOS } from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * Feature: `portfolio.create` · B2C Admin · route `/contents/portfolios/new`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 포트폴리오 | 상세페이지 (등록) — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminPortfolioCreatePage() {
  return (
    <AdminShell
      sectionId="content"
      trail={['콘텐츠', '포트폴리오', '상세페이지 (등록)']}
      activeChildId="content-portfolio"
      back={{ href: '/contents/portfolios', label: '포트폴리오 목록' }}
    >
      {/* 코드·등록일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <PortfolioForm
        mode="create"
        portfolioCode={nextContentId('F', PORTFOLIOS.map((item) => item.id))}
        createdAt={todayStamp()}
      />
    </AdminShell>
  );
}
