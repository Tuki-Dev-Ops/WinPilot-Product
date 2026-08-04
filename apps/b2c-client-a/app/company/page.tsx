import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `profile.settings` · B2C Client (템플릿 A) · route `/company` */
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

      <a href={ROUTES.companyHistory} className="w-fit text-sm text-brand-700 dark:text-brand-300">
        {COPY.company.historyTitle}
      </a>
    </SiteShell>
  );
}
