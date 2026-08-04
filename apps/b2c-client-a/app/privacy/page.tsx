import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `privacy.settings` · B2C Client (템플릿 A) · route `/privacy`
 *
 * ## 어드민 연동
 * - 본문 · 버전 · 시행일 ← `b2c-admin` 설정 > 약관 정보의 **개인정보 처리방침** (store `PRIVACY`)
 * - 문의 폼과 회원가입의 동의 문구가 이 문서를 가리킨다
 */
export const metadata: Metadata = { title: `${CONTENT.privacy.label} — ${CONTENT.seo.title}` };

export default function PrivacySettingsPage() {
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
