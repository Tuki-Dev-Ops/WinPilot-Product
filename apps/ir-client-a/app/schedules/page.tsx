import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { upcomingSchedules } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { IR_ROUTES } from '@/lib/navigation';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `schedule.list` · IR Client (템플릿 A) · route `/schedules`
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 다. `ir-admin` 에서 올린 것이 그대로 여기 선다.
 */
export const metadata: Metadata = { title: `IR 일정 — ${IR_COMPANY.name}` };

export default function ScheduleListPage() {
  return (
    <IrSiteShell hero={<PageHero title="IR 일정" />}>

      <IrSubNav current={IR_ROUTES.schedules} />

      <IrTable
        columns={[{ label: '일자' }, { label: '구분' }, { label: '일정' }, { label: '메모' }]}
        rows={upcomingSchedules('2026-08-06').map((one) => [one.at, one.kind, one.title, one.note || '—'])}
        empty="예정된 일정이 없습니다."
      />
    </IrSiteShell>
  );
}
