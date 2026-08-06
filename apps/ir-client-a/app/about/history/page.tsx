import type { Metadata } from 'next';
import { IR_COMPANY, MILESTONES, milestoneDate, sortMilestones } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `milestone.list` · IR Client (템플릿 A) · route `/about/history`
 *
 * ## 세로선 하나로 잇는다
 * 전에는 줄마다 아래에 구분선을 그었다. 그러면 **끊긴 칸이 여럿**으로 보이는데, 연혁이
 * 말하려는 것은 그 반대다 — 하나로 이어져 여기까지 왔다는 것. 왼쪽에 선을 한 줄 세우고 해마다
 * 점을 찍으면, 눈이 그 선을 따라 내려가며 흐름을 읽는다.
 *
 * ## 연도를 한 번만 적는다
 * 같은 해의 일이 셋이면 연도가 세 번 적힌다. 그러면 훑는 눈이 **몇 해에 걸친 이야기인지**를
 * 세지 못한다. 해가 바뀌는 줄에만 연도를 크게 적고, 나머지는 월만 남긴다.
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 의 `MILESTONES` 다. **B2C Admin 의 회사 > 연혁**이 그 값을
 *   고치고 있어, 여기에 따로 두면 같은 회사의 연혁이 두 벌이 된다.
 * - 숨김(`visible: false`)인 것은 여기 오지 않는다.
 */
export const metadata: Metadata = { title: `연혁 — ${IR_COMPANY.name}` };

export default function MilestoneListPage() {
  const rows = sortMilestones(MILESTONES.filter((one) => one.visible));

  return (
    <IrSiteShell>
      <IrPageTitle title="연혁" description="회사가 지나온 자리입니다." />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <ol className="flex flex-col">
          {rows.map((one, index) => {
            /* 바로 위 줄과 해가 다르면 그때만 연도를 크게 적는다. */
            const opensYear = index === 0 || rows[index - 1]?.year !== one.year;

            return (
              <li key={one.id} className="flex gap-6">
                <span className="w-16 shrink-0 pt-5 text-right">
                  {opensYear && (
                    <span className="block font-mono text-lg font-bold tabular-nums tracking-tight">{one.year}</span>
                  )}
                </span>

                {/*
                  세로선과 점. 선을 `<li>` 마다 그어 이어 붙이는 이유: 하나의 긴 선을 바깥에 두면
                  **마지막 줄 아래로 선이 삐져나온다** — 그 길이를 맞추려면 줄 높이를 알아야 하고,
                  글의 길이는 값마다 다르다. 마지막 줄만 선을 반만 긋는 것으로 끝을 맺는다.
                */}
                <span aria-hidden className="relative flex w-px shrink-0 justify-center bg-border">
                  <span className="absolute top-6 size-2.5 -translate-y-1/2 rounded-full bg-brand-500 ring-4 ring-canvas" />
                  {index === rows.length - 1 && <span className="absolute inset-x-0 top-6 bottom-0 bg-canvas" />}
                </span>

                <span className="min-w-0 flex-1 py-5">
                  <span className="block font-mono text-xs tabular-nums text-ink-faint">{milestoneDate(one)}</span>
                  <span className="mt-1 block text-base font-medium">{one.title}</span>
                  {one.description && (
                    <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{one.description}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </IrSiteShell>
  );
}
