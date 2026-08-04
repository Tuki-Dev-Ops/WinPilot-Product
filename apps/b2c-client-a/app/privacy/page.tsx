import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `privacy.settings` · B2C Client (템플릿 A) · route `/privacy` */
export const metadata: Metadata = { title: `${CONTENT.privacy.label} — ${CONTENT.seo.title}` };

export default function PrivacyPage() {
  const { privacy } = CONTENT;

  return (
    <SiteShell>
      <PageTitle
        title={privacy.label}
        description={`${COPY.policy.versionLabel} v${privacy.version} · ${COPY.policy.effectiveLabel} ${privacy.effectiveAt}`}
      />
      <section id={SLOT.policyBody} data-ssot-cid={cid('privacy.settings', 'SitePrivacyBody')}>
        <RichBody html={privacy.body} />
      </section>
    </SiteShell>
  );
}
