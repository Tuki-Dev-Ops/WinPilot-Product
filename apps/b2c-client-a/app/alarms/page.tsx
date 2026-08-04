import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY, unreadAlarms } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { AlarmListView } from './_components/AlarmListView';

/** Feature: `alarm.list` · B2C Client (템플릿 A) · route `/alarms` */
export const metadata: Metadata = { title: `${COPY.alarm.title} — ${CONTENT.seo.title}` };

export default function AlarmListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.alarm.title} description={`${COPY.alarm.unread} ${unreadAlarms()}건`} />
      <AlarmListView alarms={ACCOUNT.alarms} />
    </SiteShell>
  );
}
