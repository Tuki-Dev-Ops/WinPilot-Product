import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `terms.settings` · B2C Client (템플릿 A) · route `/terms`
 *
 * ## 어드민 연동
 * - 본문 · 버전 · 시행일 ← `b2c-admin` 설정 > 약관 정보의 **서비스 이용약관** (store `TERMS`)
 */
export const metadata: Metadata = { title: `${CONTENT.terms.label} — ${CONTENT.seo.title}` };

export default function TermsSettingsPage() {
  const { terms } = CONTENT;

  return (
    <SiteShell>
      <PageTitle
        title={terms.label}
        description={`${COPY.policy.versionLabel} v${terms.version} · ${COPY.policy.effectiveLabel} ${terms.effectiveAt}`}
      />
      <section id={SLOT.policyBody} data-ssot-cid={cid('terms.settings', 'SiteTermsBody')}>
        <RichBody html={terms.body} />
      </section>
    </SiteShell>
  );
}
