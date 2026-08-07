import type { Metadata } from 'next';
import { CREDENTIALS, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { CredentialForm } from '@/app/company/credentials/_components/CredentialForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `credential.create` · IR Admin · route `/company/credentials/new`
 */
export const metadata: Metadata = {
  title: '회사 | 특허 및 인증 | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function CredentialCreatePage() {
  return (
    <IrShell
      sectionId="company"
      trail={['회사', '특허 및 인증', '등록']}
      activeChildId="company-credentials"
      back={{ href: '/company/credentials', label: '특허 및 인증 목록' }}
    >
      <CredentialForm
        mode="create"
        code={nextSiteId('C', CREDENTIALS.map((one) => one.id))}
        today={TODAY}
      />
    </IrShell>
  );
}
