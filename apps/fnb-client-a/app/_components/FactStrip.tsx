import { FNB_BRAND, formatManwon, franchiseCostTotal, openStores } from '@winpilot/store';

/**
 * 첫 화면 바로 아래의 **숫자 띠** — 브랜드색으로 채운 가로 판.
 *
 * ## 프랜차이즈 사이트가 여기서 답하는 것
 * 자리를 보고 있는 사람이 첫 화면을 지나며 재는 것은 셋뿐이다 — **몇 곳이나 하고 있나 · 얼마
 * 드나 · 얼마나 걸리나.** 그 셋을 아래로 내려 두면 창업안내 화면까지 내려간 사람만 답을 얻는데,
 * 실제로는 그 답을 보고 나서 내려갈지 말지를 정한다.
 *
 * ## 왜 색을 채운 띠인가
 * 흰 바탕에 카드 셋으로 두면 아래 칸들과 같은 층으로 읽힌다. 이 셋은 **읽는 것이 아니라 눈에
 * 부딪히는 것**이라, 첫 화면과 본문 사이에서 색이 한 번 갈려야 한다.
 *
 * 검정(첫 화면) → 적갈(이 띠) → 흰색(본문)으로 이어지면 색이 밝아지는 차례가 되어, 아래로
 * 내려갈수록 읽는 자리에 가까워지는 것이 색으로 드러난다.
 *
 * ## 숫자를 손으로 적지 않는다
 * 셋 다 store 에서 계산해 온다. 매장이 한 곳 늘거나 평당 단가가 오르면 여기와 창업안내가 같이
 * 움직인다 — 손으로 적어 두면 **첫 화면에만 옛 숫자가 남고**, 그 자리는 아무도 다시 안 본다.
 */
export function FactStrip() {
  const facts = [
    { label: '운영 중인 가맹점', value: `${openStores().length}곳`, note: `${FNB_BRAND.foundedYear}년 첫 매장 이후` },
    { label: '창업 비용', value: formatManwon(franchiseCostTotal()), note: '33㎡ 기준 · 임차료 별도' },
    { label: '개점까지', value: '약 3개월', note: '상담 신청부터 시식 영업까지' },
  ];

  return (
    <section className="bg-octo-600 text-white">
      {/*
        칸 사이에 흰 선을 넣는다(`divide`). 색이 같은 판 위에서 셋을 가르는 방법이 여백뿐이면
        넓은 화면에서 셋이 한 덩이로 보이고, 좁은 화면에서는 세로로 접히며 경계가 사라진다.
      */}
      <div className="mx-auto grid w-full max-w-320 grid-cols-1 divide-y divide-white/20 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map((one) => (
          <div key={one.label} className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <p className="text-xs font-medium tracking-wide text-white/70">{one.label}</p>
            <p className="text-2xl font-black tabular-nums tracking-tight lg:text-3xl">{one.value}</p>
            <p className="text-xs leading-relaxed text-white/60">{one.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
