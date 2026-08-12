'use client';

import { INTERIOR_PLANS, formatManwon, interiorCost, type InteriorPlan } from '@winpilot/store';
import { Carousel } from '@/app/_components/Carousel';
import { PhotoSlot } from '@/app/_components/PhotoSlot';

/** 한 평이 몇 ㎡ 인가. 자리를 보러 다니는 사람은 부동산에서 ㎡ 로 듣는다. */
const SQM_PER_PYEONG = 3.3;

/**
 * 평형별 안 — **한 장씩 크게 넘어간다.**
 *
 * ## 세 칸으로 깔지 않는다
 * 넓은 화면에서 셋을 나란히 두면 카드마다 폭이 3분의 1이라 사진 자리를 넣을 데가 없고, 무엇보다
 * **굴릴 것이 남지 않는다** — 셋이 다 보이는데 흐르게 두면 움직임이 뜻 없이 눈만 끈다.
 *
 * 한 장이 폭을 다 쓰면 사진이 첫 화면처럼 서고, 그 아래 숫자가 함께 읽힌다. 자리를 보고 있는
 * 사람은 세 안을 **동시에 견주지 않는다** — 자기 평수에 맞는 하나를 먼저 보고, 그다음 위아래를
 * 넘겨 본다.
 *
 * ## 사진 자리를 비워 두지 않는다
 * 이 화면의 머리말은 오래도록 `사진 대신 숫자를 세운다` 였다. 지금도 그렇다 — 숫자가 먼저 오고
 * 사진은 그 뒤를 받친다. 다만 완성 매장 사진이 들어올 자리는 잡아 둔다(`PhotoSlot`), 자리가
 * 없으면 사진이 생기는 날 배치를 다시 짜야 한다.
 *
 * ## 굴리는 규칙은 `Carousel` 이 갖는다
 * 멈춤 · 밑줄 · 움직임 끈 사람 처리까지 홈의 대표 메뉴와 같은 것을 쓴다. 두 벌로 두면 한쪽만
 * 고쳐지는 날이 온다.
 */
export function PlanCarousel() {
  return (
    <Carousel
      width="hero"
      slides={INTERIOR_PLANS.map((one) => ({ id: one.id, node: <PlanSlide plan={one} /> }))}
    />
  );
}

function PlanSlide({ plan }: { plan: InteriorPlan }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border">
      <PhotoSlot name={plan.name} ratio="wide" />

      {/*
        넓은 화면에서 왼쪽에 이름 · 값, 오른쪽에 설명과 숫자를 둔다. 한 줄로 이어 두면 폭이 넓을
        때 값과 설명 사이가 화면 반만큼 벌어져 둘이 같은 카드의 것으로 읽히지 않는다.
      */}
      <div className="flex flex-1 flex-col gap-6 px-6 py-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-8">
        <div className="flex shrink-0 flex-col gap-1 lg:w-64">
          <p className="text-lg font-bold tracking-tight">{plan.name}</p>
          <p className="font-mono text-xs tabular-nums text-ink-faint">
            {plan.pyeong}평 · 약 {Math.round(plan.pyeong * SQM_PER_PYEONG)}㎡
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{formatManwon(interiorCost(plan))}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="text-sm leading-relaxed text-ink-muted">{plan.desc}</p>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            <Cell label="좌석" value={`${plan.seats}석`} />
            <Cell label="공사" value={`${plan.weeks}주`} />
          </dl>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {plan.fits.map((fit) => (
              <li key={fit} className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                {fit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** 숫자 한 칸 — 값은 고정폭이다. 세 안을 넘겨 볼 때 자릿수가 같은 자리에 서야 견줘진다. */
function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-canvas px-4 py-3">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="font-mono text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
