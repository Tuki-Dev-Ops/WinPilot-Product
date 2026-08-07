import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CREDENTIALS, findCredential } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { CredentialForm } from '@/app/company/credentials/_components/CredentialForm';
import { TODAY } from '@/lib/today';

/**
 * Feature: `credential.detail` · IR Admin · route `/company/credentials/{credentialId}`
 */
export const metadata: Metadata = {
  title: '회사 | 특허 및 인증 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return CREDENTIALS.map((one) => ({ credentialId: one.id }));
}

export default async function CredentialDetailPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;
  const credential = findCredential(credentialId);
  if (!credential) notFound();

  return (
    <IrShell
      sectionId="company"
      trail={['회사', '특허 및 인증', '수정']}
      activeChildId="company-credentials"
      back={{ href: '/company/credentials', label: '특허 및 인증 목록' }}
    >
      <CredentialForm mode="edit" code={credential.id} today={TODAY} initial={credential} />
    </IrShell>
  );
}
