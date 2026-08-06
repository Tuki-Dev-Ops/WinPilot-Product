import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { SubscribeForm } from './_components/SubscribeForm';

/**
 * Feature: `subscriber.create` · IR Client (템플릿 A) · route `/subscribe`
 *
 * ## 어드민 연동
 * - 신청은 `ir-admin` 자료 > 알림 발송의 구독자 목록에 **확인 전** 상태로 쌓인다
 */
export const metadata: Metadata = { title: `공시 구독 — ${IR_COMPANY.name}` };

export default function IrSubscriberCreatePage() {
  return (
    <IrSiteShell>
      <IrPageTitle
        title="공시 구독"
        description="새 공시가 나가면 메일로 알려 드립니다. 신청 후 확인 메일의 링크를 눌러 주세요."
      />

      <SubscribeForm />
    </IrSiteShell>
  );
}
