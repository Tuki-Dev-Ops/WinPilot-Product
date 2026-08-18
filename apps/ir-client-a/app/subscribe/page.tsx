import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { IR_ROUTES } from '@/lib/navigation';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { SubscribeForm } from './_components/SubscribeForm';

/**
 * Feature: `subscriber.create` · IR Client (템플릿 A) · route `/subscribe`
 *
 * ## 어드민 연동
 * - 신청은 `ir-admin` 자료 > 알림 발송의 구독자 목록에 **확인 전** 상태로 쌓인다
 */
export const metadata: Metadata = { title: `공시 구독 — ${IR_COMPANY.name}` };

export default function SubscriberSignupPage() {
  return (
    <IrSiteShell hero={<PageHero title="공시 구독" />}>

      <IrSubNav current={IR_ROUTES.subscribe} />

      <SubscribeForm />
    </IrSiteShell>
  );
}
