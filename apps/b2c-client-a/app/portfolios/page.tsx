import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { PortfolioListView } from './_components/PortfolioListView';

/**
 * Feature: `portfolio.list` · B2C Client (템플릿 A) · route `/portfolios`
 *
 * 상단 탭과 격자는 `PortfolioListView` 가 그린다 — 눌러서 바뀌는 부분이라 클라이언트에 둔다.
 *
 * ## 어드민 연동
 * - 목록 · 제목 · 본문 ← `b2c-admin` 콘텐츠 > 포트폴리오 (`/contents/portfolios`)
 * - 고객사 · 기간은 등록 폼의 같은 이름 항목이다
 * - 숨김(`visible: false`)으로 둔 항목은 여기 오지 않는다
 */
export const metadata: Metadata = { title: `${COPY.portfolio.listTitle} — ${CONTENT.seo.title}` };

export default function PortfolioListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.portfolio.listTitle} description={`총 ${CONTENT.portfolios.length}건`} />
      <PortfolioListView items={CONTENT.portfolios} />
    </SiteShell>
  );
}
