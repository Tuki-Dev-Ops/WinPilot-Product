import type { Metadata } from 'next';
import { Badge } from '@winpilot/ui';
import { IR_COMPANY, MEETINGS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `meeting.list` · IR Client (템플릿 A) · route `/meetings`
 *
 * 안건을 전부 적는다. 목록에서 줄이면 주주가 **무엇을 의결하는지 모른 채** 참석 여부를
 * 정하게 된다 — 이 화면에서 줄여도 되는 값이 아니다.
 */
export const metadata: Metadata = { title: `주주총회 — ${IR_COMPANY.name}` };

export default function IrMeetingListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="주주총회" description="소집 공고와 안건입니다." />

      <div className="flex flex-col gap-4">
        {MEETINGS.map((one) => (
          <section key={one.id} className="flex flex-col gap-3 rounded-xl border border-border px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={one.state === '예정' ? 'brand' : 'neutral'}>{one.state}</Badge>
              <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{one.title}</h2>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{one.heldAt}</span>
            </div>

            <p className="text-sm text-ink-muted">{one.place}</p>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-widest text-ink-faint">안건</p>
              <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
                {one.agenda.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            {one.electronicVote && (
              <a href={IR_ROUTES.voting} className="w-fit text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300">
                전자투표 안내
              </a>
            )}
          </section>
        ))}
      </div>
    </IrSiteShell>
  );
}
