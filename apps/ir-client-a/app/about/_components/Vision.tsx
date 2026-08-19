/**
 * 첫째 칸 — **왼쪽에 이름표, 오른쪽에 큰 문장과 갈래 셋**.
 *
 * ## 이름표를 옆에 세운다
 * 다른 칸들은 이름표를 문장 **위에** 둔다. 여기만 옆인 이유: 이 칸이 화면에서 처음 나오는
 * 칸이라, 위에 두면 배너의 이름표와 세로로 나란히 서서 **같은 것이 두 번 적힌 것처럼** 보인다.
 * 옆으로 빼면 층이 갈리고, 오른쪽이 통째로 한 덩어리로 읽힌다.
 *
 * ## 번호가 글자 뒤에 옅게 선다
 * `1 · 2 · 3` 은 차례가 아니라 **셋이라는 것**을 말한다. 진하게 두면 번호가 먼저 읽혀 갈래
 * 이름이 부제처럼 밀리므로, 옅은 회색으로 크게 두어 **눈에는 들어오되 읽히지는 않게** 한다.
 *
 * ## 갈래 셋이 없어도 된다
 * 연혁 화면이 이 칸을 **이름표와 문장만**으로 쓴다. 거기는 아래가 목록이라 갈래로 나눌 것이
 * 없는데, 그렇다고 같은 모양을 한 벌 더 만들면 **왼쪽 이름표 너비 하나가 두 곳에 적힌다** —
 * 한쪽을 고치는 날 두 화면의 글이 어긋나 선다.
 *
 * ## 영문 이름과 국문 설명을 나눈다
 * 갈래 이름은 영문, 설명은 국문이다. 둘 다 국문이면 이름과 설명이 같은 무게로 서서 어느 쪽이
 * 이름인지가 흐려진다 — 글자 크기만으로 나누면 좁은 화면에서 그 차이가 사라진다.
 */
export type VisionPillar = { no: string; name: string; body: string[] };

export function Vision({ label, statement, pillars }: { label: string; statement: string; pillars?: VisionPillar[] }) {
  return (
    <section className="grid grid-cols-1 gap-10 border-t border-border pt-12 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-16 lg:pt-20">
      <p className="text-sm font-bold tracking-widest text-ink-faint">{label}</p>

      <div className="flex flex-col gap-14 lg:gap-20">
        <h2 className="max-w-3xl text-balance text-2xl font-bold leading-[1.45] tracking-tight lg:text-[2rem]">
          {statement}
        </h2>

        {pillars && (
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {pillars.map((one) => (
              <li key={one.name} className="flex items-start gap-4">
                <span aria-hidden className="font-mono text-4xl font-bold leading-none tabular-nums text-border-strong">
                  {one.no}
                </span>
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-bold tracking-tight">{one.name}</p>
                  {/*
                  줄을 배열로 받는다. 한 문장으로 두고 브라우저가 접게 하면 칸 너비마다 접히는
                  자리가 달라 **셋의 줄 수가 서로 어긋난다** — 나란히 선 칸에서 그 어긋남은
                  글자보다 먼저 보인다.
                */}
                  {one.body.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-ink-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
