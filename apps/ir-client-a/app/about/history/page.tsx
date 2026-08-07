import type { Metadata } from 'next';
import { IR_COMPANY, MILESTONES, milestoneDate, sortMilestones } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `milestone.list` · IR Client (템플릿 A) · route `/about/history`
 *
 * ## 해를 왼쪽에 크게 세운다
 * 연혁에서 사람이 먼저 찾는 것은 사건이 아니라 **언제**다 — "그게 몇 년이었지" 로 들어와
 * 그 해의 줄만 읽는다. 그래서 해를 왼쪽 기둥에 크게 한 번 세우고, 같은 해의 일은 그 오른쪽에
 * 묶어 둔다. 줄마다 해를 되풀이하면 **몇 해에 걸친 이야기인지**가 사라진다.
 *
 * ## 세로선 하나로 잇는다
 * 줄마다 구분선을 그으면 끊긴 칸 여럿으로 보인다. 연혁이 말하려는 것은 그 반대 — 하나로
 * 이어져 여기까지 왔다는 것이다. 왼쪽에 선을 세우고 해마다 점을 찍으면 눈이 그 선을 따라
 * 내려가며 흐름을 읽는다.
 *
 * ## 위가 최신이다
 * `sortMilestones` 가 최신순으로 준다. 오래된 것부터 쌓으면 **지금 무엇을 하는 회사인지**가
 * 맨 아래에 있게 되는데, 여기 오는 사람의 절반은 첫 화면만 보고 나간다.
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 의 `MILESTONES` 다. **B2C Admin 의 회사 > 연혁**이 그 값을
 *   고치고 있어, 여기에 따로 두면 같은 회사의 연혁이 두 벌이 된다.
 * - 숨김(`visible: false`)인 것은 여기 오지 않는다.
 */
export const metadata: Metadata = { title: `연혁 — ${IR_COMPANY.name}` };

export default function MilestoneListPage() {
  const rows = sortMilestones(MILESTONES.filter((one) => one.visible));

  /*
    해마다 묶는다. 배열의 차례를 그대로 지키려고 `Map` 을 쓴다 — 평범한 객체는 **숫자처럼 생긴
    키를 오름차순으로 재배열**해서, 최신순으로 정렬해 둔 것이 2019 부터로 뒤집힌다.
  */
  const byYear = new Map<string, typeof rows>();
  for (const one of rows) {
    const box = byYear.get(one.year);
    if (box) box.push(one);
    else byYear.set(one.year, [one]);
  }

  const years = [...byYear.entries()];

  return (
    <IrSiteShell>
      <IrPageTitle title="연혁" description={`${IR_COMPANY.foundedAt.slice(0, 4)}년부터 지나온 자리입니다.`} />

      {years.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <ol className="flex flex-col">
          {years.map(([year, items], index) => (
            <li key={year} className="flex gap-6 sm:gap-10">
              {/* 해 — 이 화면에서 눈이 가장 먼저 닿는 자리라 가장 크다. */}
              <span className="w-14 shrink-0 pt-6 text-right sm:w-20">
                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{year}</span>
              </span>

              {/*
                세로선과 점. 선을 묶음마다 그어 이어 붙이는 이유: 하나의 긴 선을 바깥에 두면
                **마지막 묶음 아래로 선이 삐져나온다** — 그 길이를 맞추려면 줄 높이를 알아야
                하고, 글의 길이는 값마다 다르다. 마지막 묶음만 점 아래를 덮어 끝을 맺는다.
              */}
              <span aria-hidden className="relative flex w-px shrink-0 justify-center bg-border">
                <span className="absolute top-8 size-3 -translate-y-1/2 rounded-full bg-brand-500 ring-4 ring-canvas" />
                {index === years.length - 1 && <span className="absolute inset-x-0 bottom-0 top-8 bg-canvas" />}
              </span>

              <ul className="flex min-w-0 flex-1 flex-col gap-5 py-6">
                {items.map((one) => (
                  <li key={one.id} className="flex flex-col gap-1">
                    {/* 월만 남긴다 — 해는 왼쪽 기둥이 이미 말했다. */}
                    <span className="font-mono text-xs tabular-nums text-ink-faint">
                      {one.month ? `${one.month}월` : milestoneDate(one)}
                    </span>
                    <span className="text-base font-medium leading-relaxed">{one.title}</span>
                    {one.description && (
                      <span className="text-sm leading-relaxed text-ink-muted">{one.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </IrSiteShell>
  );
}
