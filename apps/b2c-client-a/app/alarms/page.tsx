import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY, unreadAlarms } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { AlarmListView } from './_components/AlarmListView';

/**
 * Feature: `alarm.list` · B2C Client (템플릿 A) · route `/alarms`
 *
 * ## 어드민 연동
 * - 주문 알람 ← 운영자가 **'판매'** 상세(`/products/sales/[orderId]`)에서 상태를 바꿀 때 만들어진다
 * - 공지 알람 ← 콘텐츠 > 공지사항 (`/contents/notices`)
 * - 혜택 알람 ← 배너 · 쿠폰 등록
 */
export const metadata: Metadata = { title: `${COPY.alarm.title} — ${CONTENT.seo.title}` };

export default function AlarmListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.alarm.title} description={`${COPY.alarm.unread} ${unreadAlarms()}건`} />
      <AlarmListView alarms={ACCOUNT.alarms} />
    </SiteShell>
  );
}
