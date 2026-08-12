import { INTERIOR_GALLERY } from '@winpilot/store';
import { PhotoSlot } from '@/app/_components/PhotoSlot';

/**
 * 칸 크기가 도는 차례 — **여덟이 한 묶음이고, 그 묶음이 격자를 빈틈없이 채운다.**
 *
 * ## 넓이를 맞춰야 구멍이 없다
 * 처음에는 일곱 개짜리 차례였다. 크기가 섞여 보기에는 좋았는데 **넓이의 합이 열일곱 칸**이라
 * 네 칸짜리 격자에서 나머지가 남았고, 마지막 줄에 흰 구멍이 그대로 보였다. `grid-flow-dense`
 * 가 뒤의 작은 칸을 끌어올려 주지만, 그것은 **중간의 구멍**을 메울 뿐 총량이 모자란 것을
 * 만들어 내지는 못한다.
 *
 * 지금은 넓이의 합이 열여섯 칸이다 — 큰 칸(2×2) 둘, 두 칸짜리 둘, 한 칸짜리 넷. 네 열이면
 * 정확히 네 줄, 두 열이면 정확히 여덟 줄로 **떨어진다.** 묶음을 되풀이해도 떨어진 채로 남는다.
 *
 * 그래서 사진은 **여덟의 배수**로 둔다. 아홉 장을 넣으면 아홉째가 새 묶음을 열면서 그 줄부터
 * 다시 구멍이 생긴다 — 늘릴 때는 여덟씩 늘린다.
 *
 * ## 그래도 규칙적으로 보이지 않는다
 * 큰 칸 둘이 대각선으로 놓인다(왼쪽 위 · 왼쪽 아래). 같은 줄에 나란히 두면 격자가 위아래
 * 두 덩이로 갈려 무늬가 아니라 **두 칸짜리 표**로 읽힌다.
 *
 * 눈으로 보이는 차례와 낭독기가 읽는 차례는 갈릴 수 있다(`dense`). 여기 있는 것이 사진이라
 * 읽는 차례에 뜻이 없어 괜찮다 — 순서가 뜻을 갖는 목록(공지 · 절차)에는 쓰지 않는다.
 *
 * ## 좁은 화면에서도 떨어진다
 * 두 열일 때 `col-span-2` 는 줄 전체를 먹지만, 그때도 합이 여덟 줄로 떨어져 구멍이 없다.
 * 한 열(모바일)에서는 전부 폭을 다 쓰고 `row-span` 만 높이로 남는다.
 */
const TILES = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  'sm:col-span-2',
  'sm:col-span-2 sm:row-span-2',
  'sm:row-span-2',
  '',
  '',
];

/**
 * 완성 매장 사진 모자이크 — **아직 사진이 없는 자리들.**
 *
 * 평형별 안이 숫자로 답한 다음에 온다. 자리를 보고 있는 사람은 **얼마 드는지를 먼저** 묻고,
 * 그 다음에야 어떻게 생겼는지를 본다 — 차례를 뒤집으면 예뻐 보인다는 말만 남는다.
 *
 * 크기를 섞는 까닭: 여덟 칸을 같은 크기로 깔면 사진 목록이 아니라 **표**로 보인다. 크기가
 * 다르면 눈이 큰 칸에 먼저 가고, 그 다음은 스스로 고른다 — 사진을 보는 방식이 그렇다.
 */
export function PhotoMosaic() {
  return (
    <ul className="grid auto-rows-[8rem] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[10rem] lg:grid-cols-4">
      {INTERIOR_GALLERY.map((one, index) => (
        <li
          key={one.id}
          className={`relative overflow-hidden rounded-2xl border border-border ${TILES[index % TILES.length]}`}
        >
          <PhotoSlot name={one.name} ratio="fill" />

          {/*
            글을 사진 위 아래쪽에 얹는다. 아래에 따로 두면 칸 높이를 격자가 정하는 자리라 글이
            들어갈 만큼이 남는지 알 수 없다 — 짧은 칸에서는 글이 잘린다.

            검은 그러데이션을 까는 것은 사진이 밝든 어둡든 흰 글씨가 읽히게 하려는 것이다.
            지금은 회색 칸이지만 사진이 들어오면 그때가 진짜다.
          */}
          <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-night/80 to-transparent px-4 pb-3 pt-8">
            <span className="text-sm font-semibold text-white">{one.name}</span>
            <span className="text-xs leading-relaxed text-white/70">{one.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
