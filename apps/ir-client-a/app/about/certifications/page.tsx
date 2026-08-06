import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { CredentialListView } from './_components/CredentialListView';

/**
 * Feature: `credential.list` · IR Client (템플릿 A) · route `/about/certifications`
 *
 * **등록번호를 반드시 적는다.** 특허와 인증은 밖에서 조회할 수 있는 값이고, 번호가 없으면
 * 확인할 방법이 없어 적어 둔 뜻이 없다.
 *
 * 고르고 찾는 일은 브라우저에서 일어나므로(`CredentialListView`) 이 화면은 껍데기와 제목만
 * 갖는다 — 목록이 스무 줄이 되어도 서버를 다시 부를 일이 없다.
 */
export const metadata: Metadata = { title: `특허 및 인증 — ${IR_COMPANY.name}` };

export default function CredentialListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle
        title="특허 및 인증"
        description="등록번호로 확인하실 수 있습니다. 구분을 고르거나 번호로 찾아보세요."
      />

      <CredentialListView />
    </IrSiteShell>
  );
}
