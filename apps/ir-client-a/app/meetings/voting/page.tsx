import type { Metadata } from 'next';
import { IR_COMPANY, MEETINGS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `meeting.settings` · IR Client (템플릿 A) · route `/meetings/voting`
 *
 * ## 여기서 투표하지 않는다
 * 전자투표는 예탁결제원의 시스템에서 한다. 이 화면은 **어디로 가서 무엇을 준비해야 하는지**를
 * 적는 자리다 — 투표 단추를 흉내 내 두면 눌러 놓고 표가 들어간 줄 안다.
 */
export const metadata: Metadata = { title: `전자투표 안내 — ${IR_COMPANY.name}` };

export default function IrMeetingSettingsPage() {
  const next = MEETINGS.find((one) => one.state === '예정' && one.electronicVote);

  return (
    <IrSiteShell back={{ href: IR_ROUTES.meetings, label: '주주총회' }}>
      <IrPageTitle
        title="전자투표 안내"
        description="총회에 오지 않아도 의결권을 행사하실 수 있습니다."
      />

      {next ? (
        <section className="flex flex-col gap-2 rounded-xl border border-border px-6 py-5">
          <p className="text-sm font-medium">{next.title}</p>
          <p className="font-mono text-xs tabular-nums text-ink-muted">{next.heldAt}</p>
        </section>
      ) : (
        <p className="rounded-xl border border-border px-6 py-10 text-center text-sm text-ink-muted">
          지금 전자투표를 받는 총회가 없습니다.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">준비하실 것</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
          <li>공동인증서 또는 간편인증 수단</li>
          <li>주주 본인 명의의 계좌 정보</li>
          <li>의결권 행사 기간 확인 — 총회일 전날까지입니다</li>
        </ol>
      </section>

      <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
        전자투표는 한국예탁결제원 전자투표시스템에서 진행됩니다. 이 화면에서는 투표하실 수 없습니다.
      </p>
    </IrSiteShell>
  );
}
