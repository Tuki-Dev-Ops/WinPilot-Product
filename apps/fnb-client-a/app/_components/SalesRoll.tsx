import { storeSalesRows } from '@winpilot/store';
import { Marquee } from './Marquee';

/**
 * 매장별 월 매출이 끝없이 흐르는 줄.
 *
 * ## 성장 판에서 떼어 냈다
 * 한때 검은 판 안, 붉은 숫자 셋 바로 아래 있었다. 그 자리에서는 **셋과 이 줄이 같은 값으로**
 * 읽혔다 — 위는 브랜드 전체를 요약한 숫자이고 여기는 매장 하나하나의 실적인데, 한 판에 있으면
 * 둘의 층이 사라진다.
 *
 * 흰 판으로 나오면서 갈린다. 검은 판은 `이 브랜드가 이만큼 돈다` 를 말하고, 이 줄은 **`자리가
 * 다르면 숫자도 다르다`** 를 말한다 — 뒤엣것이 상담에서 자리를 함께 보자고 말하는 근거다.
 *
 * ## 순위표가 아니다
 * 좌석이 적은 곳부터 세운다(`storeSalesRows`). 매출 많은 곳부터 두면 맨 뒤 매장이 못하는
 * 곳으로 읽히고, 무엇보다 **큰 매장이 무조건 낫다**로 읽힌다 — 첫 장사를 검토하는 사람에게
 * 그것은 틀린 안내다.
 *
 * ## 왜 흐르나
 * 한 줄에 다 세우면 매장이 늘 때마다 글자가 작아지거나 줄이 접힌다. 이 줄이 하는 일은 숫자
 * 하나를 읽히는 것이 아니라 **여럿이 저마다 다르게 돈다**는 인상을 남기는 것이라, 흐르면 몇
 * 곳이 되든 같은 모양이다. 어떻게 이어 붙는지는 `Marquee` 머리말에 있다.
 */
export function SalesRoll() {
  return (
    <Marquee
      items={storeSalesRows().map((one) => ({
        id: one.id,
        node: (
          <span className="flex flex-col items-center gap-1 whitespace-nowrap">
            <span className="text-xs text-ink-faint">
              {one.name} · {one.seats}석
            </span>
            <span className="font-mono text-lg font-bold tabular-nums lg:text-xl">{one.monthly}</span>
          </span>
        ),
      }))}
    />
  );
}
