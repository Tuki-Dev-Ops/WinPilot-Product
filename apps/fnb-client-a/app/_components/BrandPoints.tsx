import { BRAND_POINTS } from '@winpilot/store';
import { PhotoSlot } from './PhotoSlot';

/**
 * 브랜드가 스스로 말하는 것 셋 — **사진 셋이 나란히.**
 *
 * ## 네모가 아니라 잎 모양이다
 * 이 화면의 다른 카드는 다 둥근 네모다(메뉴 · 매장 · 마케팅). 여기만 모서리를 크게 어긋나게
 * 깎는데, 그 카드들은 **누르는 것**이고 여기 셋은 **읽는 것**이기 때문이다. 같은 모양으로 두면
 * 눌러 보게 되고, 갈 곳이 없어 아무 일도 일어나지 않는다.
 *
 * 마주 보는 두 모서리만 크게 깎는다(왼쪽 위 · 오른쪽 아래). 네 모서리를 다 깎으면 알약이 되어
 * 사진이 잘리는 자리가 커지고, 한 모서리만 깎으면 기울어 보인다.
 *
 * ## 아래 그림자는 사진이 떠 있게 한다
 * 흰 바탕에 사진만 놓으면 배경과 붙어 **잘라 낸 조각**처럼 보인다. 아래에만 옅은 그림자를 두면
 * 바닥에 놓인 것으로 읽힌다 — 사방으로 두르면 그때는 카드가 되어 다시 누를 것처럼 보인다.
 *
 * ## 글이 사진 위에 얹히지 않는다
 * 인테리어 모자이크는 사진 위에 이름을 얹는데, 거기는 칸이 많아 글을 밖에 두면 격자가 무너진다.
 * 여기는 셋뿐이고 설명이 두 줄이라, 사진 아래 제자리를 준다 — 사진을 덜 가린다.
 */
export function BrandPoints() {
  return (
    <ul className="grid w-full grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
      {BRAND_POINTS.map((one) => (
        <li key={one.id} className="flex flex-col items-center gap-5 text-center">
          <span className="w-full overflow-hidden rounded-[4rem_1rem_4rem_1rem] shadow-[0_18px_28px_-24px_var(--color-night)]">
            <PhotoSlot name={one.title} />
          </span>

          <span className="flex flex-col gap-2">
            <span className="text-base font-bold tracking-tight">{one.title}</span>
            <span className="text-sm leading-relaxed text-ink-muted">{one.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
