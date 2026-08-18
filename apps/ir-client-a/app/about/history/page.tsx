import type { Metadata } from 'next';
import { IR_COMPANY, MILESTONES, milestoneDate, sortMilestones } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { YearNav } from './_components/YearNav';

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
 * ## 왼쪽에 연도 기둥을 세운다
 * 해가 늘수록 아래로 길어져, `2019` 를 보려면 화면을 여러 번 굴려야 했다. 왼쪽에 연도만 모아
 * 두면 **몇 해짜리 이야기인지**가 한눈에 들어오고 원하는 해로 바로 뛴다.
 *
 * 자바스크립트 없이 **닻(`#year-2026`)**으로 뛴다. 주소에 남으므로 뒤로 가기가 듣고, 특정
 * 해를 그대로 공유할 수 있다 — 굴려서 옮기는 것으로 만들면 그 둘을 다 잃는다.
 *
 * 지금 보고 있는 해를 켜는 일만 브라우저가 한다(`YearNav`). 누르는 순간 바로 켜고 그 뒤로는
 * 화면이 켠다 — 누름만으로 켜면 굴려 내려간 뒤에도 옛 해가 켜져 있고, 보는 것만으로 켜면
 * 부드러운 스크롤이 도는 동안 눌린 것인지 알 수 없다.
 *
 * 머리띠가 `sticky` 라 그냥 뛰면 제목이 그 밑에 깔린다. `scroll-mt-28` 로 그만큼 비운다.
 *
 * ## 점이 두 가지다
 * 맨 위(가장 최근)만 **채운 점**이고 나머지는 **속이 빈 점**이다. 연혁에서 눈이 먼저 찾는 것은
 * 지금 어디까지 왔는가이고, 점이 전부 같으면 그 자리가 목록 안에서 사라진다.
 *
 * 선은 마지막 묶음에서 **서서히 옅어진다.** 전에는 바탕색 조각으로 아래를 덮어 잘랐는데,
 * 그 방식은 바탕이 흰색일 때만 맞는다 — 칸 색이 바뀌면 덮은 자리가 네모로 드러난다.
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
    <IrSiteShell hero={<PageHero title="연혁" />}>

      {years.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/*
            연도 기둥. 좁은 화면에서는 가로로 눕혀 한 줄로 민다 — 세로로 두면 본문이 연도 수만큼
            아래로 밀린다. 넓은 화면에서는 따라 붙어(`sticky`) 어느 해를 보든 옆에 남는다.
          */}
          <aside className="shrink-0 lg:sticky lg:top-24 lg:h-fit lg:w-28">
            <p className="mb-3 text-xs font-medium text-ink-faint">연도</p>
            {/*
              여기만 client 다. 지금 보고 있는 해를 켜려면 화면의 자리를 알아야 하는데, 그것은
              브라우저만 안다. 목록(`ol`)은 서버가 그대로 그린다 — 켜는 표시 하나 때문에
              연혁 전체를 브라우저로 넘길 이유가 없다.
            */}
            <YearNav years={years.map(([year, items]) => ({ year, count: items.length }))} />
          </aside>

          <ol className="flex min-w-0 flex-1 flex-col">
            {years.map(([year, items], index) => (
              <li key={year} id={`year-${year}`} className="flex scroll-mt-28 gap-6 sm:gap-10">
                {/* 해 — 이 화면에서 눈이 가장 먼저 닿는 자리라 가장 크다. */}
                <span className="w-14 shrink-0 pt-6 text-right sm:w-20">
                  <span className="font-mono text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{year}</span>
                </span>

                {/*
                  세로선과 점. 선을 묶음마다 그어 이어 붙이는 이유: 하나의 긴 선을 바깥에 두면
                  **마지막 묶음 아래로 선이 삐져나온다** — 그 길이를 맞추려면 줄 높이를 알아야
                  하고, 글의 길이는 값마다 다르다.

                  마지막 묶음의 선은 **점 아래에서 옅어지며 끝난다.** 전에는 바탕색 조각으로
                  덮어 잘랐는데, 그러면 칸 색이 바뀌는 날 덮은 자리가 네모로 드러난다.
                */}
                <span
                  aria-hidden
                  className={`relative flex w-0.5 shrink-0 justify-center rounded-full ${
                    index === years.length - 1
                      ? 'bg-gradient-to-b from-border via-border to-transparent'
                      : 'bg-border'
                  }`}
                >
                  {/*
                    맨 위만 채운 점이다. 후광(`ring`)은 선 위에 점이 얹힌 것처럼 보이게 하는
                    자리라 바탕색으로 두어야 한다 — 색을 주면 점이 두 겹으로 읽힌다.
                  */}
                  {index === 0 ? (
                    <span className="absolute top-8 size-3.5 -translate-y-1/2 rounded-full bg-brand-500 ring-4 ring-canvas">
                      <span className="absolute -inset-1.5 rounded-full bg-brand-500/15" />
                    </span>
                  ) : (
                    <span className="absolute top-8 size-3 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-canvas ring-4 ring-canvas" />
                  )}
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
        </div>
      )}
    </IrSiteShell>
  );
}
