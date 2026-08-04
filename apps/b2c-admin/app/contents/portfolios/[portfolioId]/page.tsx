import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { PortfolioForm } from '@/app/contents/portfolios/_components/PortfolioForm';
import { findPortfolio, PORTFOLIOS } from '@/lib/data/contents';

/**
 * Feature: `portfolio.detail` · B2C Admin · route `/contents/portfolios/{portfolioId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '콘텐츠 | 포트폴리오 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 포트폴리오만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return PORTFOLIOS.map((item) => ({ portfolioId: item.id }));
}

export default async function AdminPortfolioDetailPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = await params;
  const portfolio = findPortfolio(portfolioId);
  if (!portfolio) notFound();

  return (
    <AdminShell
      sectionId="content"
      trail={['콘텐츠', '포트폴리오', '상세페이지 (수정)']}
      activeChildId="content-portfolio"
    >
      <PortfolioForm
        mode="edit"
        portfolioCode={portfolio.id}
        createdAt={portfolio.createdAt}
        initial={{
          title: portfolio.title,
          client: portfolio.client,
          period: portfolio.period,
          body: portfolio.body,
          visible: portfolio.visible,
        }}
      />
    </AdminShell>
  );
}
