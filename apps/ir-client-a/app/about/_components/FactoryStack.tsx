/**
 * 공장에서 화면까지 — **네 층을 어두운 띠 하나에**.
 *
 * ## 회사 소개에 왜 이 칸이 있나
 * 위의 `하는 일` 넷은 **무엇을 파는 회사인가**에 답한다. 그것만으로는 이 회사가 공장의 어디에
 * 붙는 회사인지가 남지 않는다 — 소프트웨어 회사는 다들 데이터와 판단을 말하고, 그 말만으로는
 * ERP 를 파는 회사와 광고 도구를 파는 회사가 구별되지 않는다.
 *
 * 제조 쪽 회사 소개가 거의 예외 없이 두는 칸이 이것이다. 이름은 제각각이지만(솔루션 구조 ·
 * 아키텍처 · Layer) 하는 일은 같다 — **설비에서 시작해 화면에서 끝나는 층을 순서대로 보여
 * 준다.** 이 순서가 보이면 "현장에 붙는 회사" 라는 것이 문장 없이 전해진다.
 *
 * ## 왜 어두운가
 * 이 화면에서 색을 가진 칸이 하나도 없으면 사진 · 카드 · 격자가 흰 바탕 위에 끝없이 이어진다.
 * 기업정보 띠가 그 일을 하고 있었는데 흰색으로 내리면서 자리가 비었다. **읽는 칸이 아니라
 * 보는 칸**이라 여기가 어두워지는 편이 맞다 — 첫 화면과 푸터도 같은 검정이라, 화면이
 * 검정으로 열려 검정으로 닫힌다.
 *
 * ## 층을 가로로 눕힌다
 * 솔루션 상세(`OfferingDetail`)는 같은 층을 **세로로 쌓아** 보여 준다. 거기는 아래에서 위로
 * 쌓이는 구조 자체가 설명거리지만, 여기는 회사 소개라 **한눈에 넷이 다 보이는 것**이 먼저다.
 * 세로로 두면 스크롤 네 번에 나눠 읽히고, 그때 넷이 한 줄이라는 것이 사라진다.
 *
 * 좁은 화면에서는 세로로 접힌다. 그때 번호가 차례를 대신한다 — 가로 연결선은 사라지지만
 * `01 → 04` 는 남는다.
 *
 * ## 값이 아니라 화면이 든다
 * `store` 에 두지 않았다. 이 넷은 파는 것이 하나 늘어도 바뀌지 않는 **회사의 자리**이고,
 * 어드민에서 고칠 수 있게 두면 제품 이름이 여기로 올라오는 날이 온다.
 */
export type StackLayer = { name: string; body: string };

export function FactoryStack({
  label,
  headline,
  lead,
  layers,
}: {
  label: string;
  headline: string;
  lead: string;
  layers: StackLayer[];
}) {
  return (
    <section className="bg-night py-20 text-white lg:py-24">
      <div className="mx-auto flex w-full max-w-320 flex-col gap-12 px-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
          <h2 className="max-w-3xl text-2xl font-bold leading-[1.4] tracking-tight lg:text-3xl">{headline}</h2>
          <p className="max-w-2xl text-sm leading-loose text-white/60 lg:text-base">{lead}</p>
        </div>

        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {layers.map((one, index) => (
            <li key={one.name} className="relative flex flex-col gap-4 pt-6">
              {/*
                층마다 위에 짧은 선을 긋고, 넷 사이를 **옅은 선으로 잇는다.** 카드로 감싸지
                않는 이유: 테두리를 두르면 넷이 나란히 놓인 별개의 상자가 되는데, 여기서 말하려는
                것은 넷이 **한 줄로 이어져 있다**는 것이다.

                잇는 선은 마지막 칸에 붙이지 않는다 — 끝에서 선이 화면 밖으로 뻗으면 다섯째가
                잘린 것처럼 보인다.
              */}
              <span aria-hidden className="absolute left-0 top-0 h-px w-8 bg-white/50" />
              {index < layers.length - 1 && (
                <span aria-hidden className="absolute left-8 top-0 hidden h-px bg-white/12 lg:-right-6 lg:block" />
              )}

              <span className="font-mono text-xs font-bold tabular-nums tracking-widest text-white/40">
                {`0${index + 1}`}
              </span>
              <p className="text-lg font-bold tracking-tight">{one.name}</p>
              <p className="text-sm leading-loose text-white/60">{one.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
