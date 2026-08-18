import type { LucideIcon } from 'lucide-react';

/**
 * 기업정보 — **흰 바탕 위 실선 격자**.
 *
 * ## 표를 카드로 바꿨다
 * 같은 값이 표 일곱 줄로 서 있었다. 표는 **줄끼리 견주는** 자리에 맞는데, 회사 정보는 서로
 * 견줄 값이 아니다 — 대표이사와 설립일을 나란히 놓고 크기를 재는 사람은 없다. 하나씩 집어
 * 가는 값이라 카드가 맞다.
 *
 * ## 파란 띠였다
 * 화면 끝까지 닿는 브랜드 파랑 위에 흰 카드를 얹었다. 훑어 내리는 눈을 한 번 멈추게 하려던
 * 것인데, 이 화면에서 색을 가진 칸이 여기 하나뿐이라 **회사 소개 한가운데에 배너가 낀 것처럼**
 * 보였다. 배경을 흰색으로 내리고, 멈추게 하는 일은 색이 아니라 **격자**에 맡긴다.
 *
 * 그러면 흰 카드를 흰 바탕에 둘 수 없다. 카드마다 테두리를 두르는 대신 **선을 한 겹으로 공유**
 * 한다(`gap-px` + 바탕색 `bg-border`) — 카드마다 테두리를 두르면 칸과 칸 사이에 선이 두 줄
 * 겹쳐 격자가 지저분해진다.
 *
 * ## 첫 칸은 값이 아니라 이름표다
 * 칸이 모두 값이면 무엇에 대한 값인지가 위 제목에만 남는다. 첫 칸을 이름표로 두면 옆으로 훑다가
 * 중간에 들어온 눈도 여기가 무엇인지 안다. 배경이 흰색이 되면서 **이 칸 하나만 브랜드 색**을
 * 갖는다 — 색을 아주 버리면 격자가 회사 소개가 아니라 사양표로 읽힌다.
 *
 * ## 이름이 크고 값이 작았다
 * `회사명` 이 굵은 16px, `스페이스플래닝` 이 옅은 14px 이었다. 찾는 사람이 보려는 것은 값인데
 * 이름이 먼저 읽혔다 — 이름은 값을 찾아가는 길일 뿐이다. 뒤집어서 이름을 작게, 값을 굵게 둔다.
 *
 * ## `dl` 로 적는다
 * 이름과 값이 짝을 이루는 목록이다. `ul` + `li` 로 두면 낭독기에 **항목 여덟**으로만 들리고,
 * 어느 글자가 이름이고 어느 글자가 값인지는 화면을 보는 사람에게만 남는다.
 */
export type Fact = { label: string; value: string; icon: LucideIcon };

export function CompanyFacts({ headline, facts }: { headline: string; facts: Fact[] }) {
  return (
    <section className="bg-canvas py-16 text-ink lg:py-20">
      <div className="mx-auto flex w-full max-w-320 flex-col gap-10 px-6">
        <h2 className="max-w-3xl text-2xl font-bold leading-[1.4] tracking-tight lg:text-3xl">{headline}</h2>

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {/*
            이름표 칸. 값 칸과 **같은 격자 안에** 두어 크기가 저절로 맞는다 — 따로 세우면
            줄이 바뀔 때마다 이 칸만 어긋난다.
          */}
          <div className="flex flex-col items-center justify-center gap-4 bg-brand-700 px-6 py-10 text-center text-white">
            <span aria-hidden className="h-px w-8 bg-white/40" />
            <p className="text-base font-bold leading-relaxed">기업정보</p>
            <span aria-hidden className="h-px w-8 bg-white/40" />
          </div>

          {facts.map((one) => (
            /*
              `dt`·`dd` 는 형제라 한 칸으로 묶으려면 사이에 `div` 가 필요하다. `dl` 이 격자일 때
              그 `div` 를 두는 것은 표준이 허락하는 하나뿐인 감싸기다.
            */
            <div key={one.label} className="flex flex-col gap-3 bg-canvas px-6 py-7">
              <one.icon aria-hidden className="size-5 shrink-0 text-brand-700" strokeWidth={1.5} />
              <dt className="text-xs font-semibold tracking-wide text-ink-faint">{one.label}</dt>
              <dd className="text-base font-bold leading-relaxed tracking-tight">{one.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
