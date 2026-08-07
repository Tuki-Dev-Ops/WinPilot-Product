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
 *
 * 갈래·창구·양식은 한 조각(`ContactForm`)이 함께 갖는다. 갈래를 고르면 양식 머리글이 따라
 * 바뀌므로 **같은 상태를 보는 것들**이고, 나눠 두면 그 상태를 위로 올려 두 곳에 넘겨야 한다.
 */
export const metadata: Metadata = { title: `문의하기 — ${IR_COMPANY.name}` };

export default function InquiryCreatePage() {
  return (
    <IrSiteShell>
      <IrPageTitle
        title="문의하기"
        description="도입 검토부터 기술 지원, 주주 문의까지 이 한 자리에서 받습니다. 갈래를 고르면 담당자에게 바로 갑니다."
      />

      <ContactForm />
    </IrSiteShell>
  );
}
