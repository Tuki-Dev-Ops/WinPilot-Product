import { OctopusMark } from './OctopusMark';

/**
 * 사진이 들어올 자리 — **아직 사진이 없다.**
 *
 * ## 빈 회색 상자를 두지 않는다
 * 프랜차이즈 사진은 촬영 · 보정 · 계절 교체가 따로 도는 일이라, 어드민에서 올리는 자리가 생기기
 * 전에 주소만 만들어 두면 **깨진 그림이 화면에 선다.** 그렇다고 회색 상자를 두면 화면이 덜
 * 만들어진 것처럼 보인다.
 *
 * ## 글자 한 자에서 문어 그림으로
 * 한때 회색 바탕에 이름 첫 글자만 뒀다. 카드마다 다른 글자가 서서 줄은 구분됐지만, 어느 칸이든
 * **글자가 서 있는 회색 상자**였다 — 무엇을 파는 집인지가 그림에서 드러나지 않았다.
 *
 * 지금은 옅은 브랜드색 바탕에 문어 실루엣(`OctopusMark`)을 깔고 첫 글자를 그 위에 얹는다.
 * 그림이 브랜드를 말하고 글자가 어느 칸인지를 말한다.
 *
 * 무료 사진을 받아 채우지 않는 이유는 그쪽 머리말에 있다 — **다른 집 문어**가 이 브랜드의
 * 얼굴로 서면, 나중에 진짜 사진이 들어와도 그 인상이 먼저 남는다.
 *
 * `aria-hidden` 인 이유: 첫 글자는 그림 대신 놓은 무늬일 뿐 뜻이 없다. 낭독기가 읽으면 카드
 * 이름 앞에 같은 글자가 한 번 더 들린다 — 카드 이름은 바로 아래 줄에 있다.
 *
 * ## 비율이 셋이다
 * `card` 는 격자에 여럿 서는 자리(메뉴 · 마케팅 글), `wide` 는 한 장이 폭을 다 쓰는
 * 자리(인테리어 굴림판)다. 넓은 자리에 4:3 을 쓰면 사진 칸 하나가 화면 높이를 넘어, 아래
 * 설명을 보려면 스크롤을 내려야 한다.
 *
 * `fill` 만 비율이 없다. **칸 크기를 격자가 정하는** 자리(모자이크)에 쓴다 — 거기서 비율을
 * 함께 걸면 둘이 서로 다른 높이를 주장해, 칸마다 사진 아래에 빈 띠가 남는다.
 *
 * 자유롭게 받지 않는 이유는 `Carousel` 의 폭과 같다 — 화면마다 조금씩 다른 값이 생기면 같은
 * 사이트에서 사진 칸이 저마다 다른 모양으로 선다.
 */
const RATIO = {
  card: 'aspect-4/3 text-3xl',
  wide: 'aspect-video text-5xl lg:aspect-21/9',
  fill: 'h-full text-4xl',
} as const;

/** 문어 그림의 크기 — 칸이 클수록 크게. 비율마다 한 번씩 정해 두면 부르는 쪽이 고민하지 않는다. */
const MARK_SIZE = {
  card: 'size-24',
  wide: 'size-40 lg:size-48',
  fill: 'size-28',
} as const;

export function PhotoSlot({ name, ratio = 'card' }: { name: string; ratio?: keyof typeof RATIO }) {
  return (
    <span
      className={`relative flex w-full items-center justify-center overflow-hidden bg-octo-50 ${RATIO[ratio]}`}
    >
      {/*
        문어를 아주 옅게 깐다. 진하게 두면 그림이 **내용**으로 읽혀, 그 칸이 문어 사진인 줄 안다.
        여기서 하는 일은 자리를 채우는 것이지 무엇을 보여 주는 것이 아니다.
      */}
      <OctopusMark className={`absolute text-octo-200 ${MARK_SIZE[ratio]}`} />

      <span aria-hidden className="relative font-black text-octo-700/70">
        {name.slice(0, 1)}
      </span>
    </span>
  );
}
