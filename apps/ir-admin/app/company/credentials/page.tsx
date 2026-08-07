import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { CredentialListView } from './_components/CredentialListView';

/**
 * Feature: `credential.list` · IR Admin · route `/company/credentials`
 *
 * **등록번호를 반드시 적는다.** 특허와 인증은 밖에서 조회할 수 있는 값이고, 번호가 없으면
 * 확인할 방법이 없어 적어 둔 뜻이 없다.
 */
export const metadata: Metadata = {
  title: '회사 | 특허 및 인증 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function CredentialPage() {
  return (
    <IrShell sectionId="company" trail={['회사', '특허 및 인증']} activeChildId="company-credentials">
      <CredentialListView />
    </IrShell>
  );
}
