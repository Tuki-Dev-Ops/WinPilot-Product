import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { ContactForm } from './_components/ContactForm';

/**
 * Feature: `inquiry.create` · IR Client (템플릿 A) · route `/support/contact`
 *
 * 주소가 `/contact` 에서 여기로 옮겨 왔다 — 헤더가 네 갈래로 서면서 이 화면이 **CS CENTER**
 * 아래에 들었기 때문이다. 주소가 갈래를 따라가지 않으면, 주소만 보고는 어느 메뉴에서 왔는지
 * 알 수 없다.
 */
export const metadata: Metadata = { title: `문의하기 — ${IR_COMPANY.name}` };

export default function InquiryCreatePage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="문의하기" description={`${IR_COMPANY.irEmail} · ${IR_COMPANY.irPhone}`} />

      <ContactForm />
    </IrSiteShell>
  );
}
