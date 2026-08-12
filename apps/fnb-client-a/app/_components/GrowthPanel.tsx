import { GROWTH_FIGURES } from '@winpilot/store';

/**
 * 성장률 — **숫자 셋과 매장별 매출 줄.**
 *
 * ## 어두운 판 위에 붉은 판을 얹는다
 * 홈에서 유일하게 어두운 칸이다(첫 화면 다음으로). 흰 바탕에 두면 위아래 칸과 같은 층으로
 * 읽히는데, 이 칸은 **말 거는 상대가 바뀌는 자리**다 — 위까지는 드시러 오는 분, 여기부터는
 * 차리려는 분이다. 색이 바뀌는 것이 그 경계를 말한다.
 *
 * 숫자 셋을 다시 브랜드색 판에 얹는 이유: 어두운 판에 흰 글씨로만 두면 셋이 배경에 잠긴다.
 * 색을 깔면 이 칸에서 **먼저 읽어야 할 것**이 어디인지가 색 하나로 정해진다.
 *
 * 경고색(`signal-danger`)이 아니라 적갈이다. 검은 판 위의 새빨간 상자는 **경보처럼** 읽혀,
 * 좋은 숫자를 적어 둔 자리에 맞지 않았다.
 *
 * ## 화면에 고지 문구가 없다
 * 한때 숫자 판 아래에 `위 숫자는 예시입니다…` 한 줄이 있었다. 뺐다.
 *
 * 값 자체는 여전히 예시다(`GROWTH_FIGURES` 머리말). 가맹사업법은 예상 매출을 **정보공개서와
 * 예상매출액 산정서**로 서면 제공하게 하므로, 실제 숫자를 여기 올릴 때는 그 서류와 같은
 * 값이어야 한다 — 다르면 그 차이가 그대로 분쟁이 된다.
 *
 * 고지를 화면 어디에 둘지는 이 조각이 정할 일이 아니다. 다시 세우려면 이 판 아래 한 줄이
 * 들어갈 자리가 있다.
 *
 * ## 매장별 매출은 여기 없다
 * 흰 판으로 내보냈다(`SalesRoll`). 한 판에 두었더니 브랜드 전체를 요약한 숫자 셋과 매장
 * 하나하나의 실적이 **같은 값으로** 읽혔다 — 둘은 답하는 물음이 다르다.
 */
export function GrowthPanel() {
  return (
    <div className="flex w-full flex-col gap-10">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-3">
        {GROWTH_FIGURES.map((one) => (
          <div key={one.id} className="flex flex-col gap-2 bg-octo-600 px-6 py-8 text-center">
            <p className="text-xs font-medium tracking-wide text-white/80">{one.label}</p>
            <p className="text-3xl font-black tabular-nums tracking-tight text-white">{one.value}</p>
            <p className="text-xs leading-relaxed text-white/70">{one.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
