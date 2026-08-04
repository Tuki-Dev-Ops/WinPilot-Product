import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `profile.settings` · B2C Client (템플릿 A) · route `/company`
 *
 * 연혁으로 가는 링크는 본문에 두지 않는다 — 헤더의 회사소개 메뉴가 이미 두 갈래를 보여주므로
 * 본문에 또 두면 같은 길이 두 군데가 되고, 어느 쪽이 정식 경로인지 흐려진다.
 *
 * ## 어드민 연동
 * - 회사 소개 본문 · 대표자 · 설립일 ← `b2c-admin` 회사 > 회사 소개 (`/company`)
 * - 회사명은 설정 > 공급자 정보의 값과 같은 것을 쓴다
 */
export const metadata: Metadata = { title: `${COPY.company.title} — ${CONTENT.seo.title}` };

export default function CompanyPage() {
  const { company } = CONTENT;

  return (
    <SiteShell>
      <PageTitle
        title={COPY.company.title}
        description={`${COPY.company.ceoLabel} ${company.ceo} · ${COPY.company.foundedLabel} ${company.foundedAt}`}
      />

      <section id={SLOT.companyIntro} data-ssot-cid={cid('profile.settings', 'SiteCompanyBody')}>
        <RichBody html={company.intro} />
      </section>
    </SiteShell>
  );
}
