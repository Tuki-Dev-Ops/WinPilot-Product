/**
 * 상품 그림 — **사진이 없을 때 그 자리에 놓는 벡터 그림**의 종류와 색을 정한다.
 *
 * 왜 사진이 아니라 그림인가.
 *   1) 이 프로젝트의 결과물은 Figma 로 복원되는 화면이다. 비트맵은 추출에서 **한 덩어리 이미지**가
 *      되어 벡터로 돌아오지 않는다(docs/spec/05-component.md). SVG 로 그리면 도형 그대로 살아난다.
 *   2) 바깥 CDN 을 물면 추출·스크린샷이 네트워크 상태에 따라 달라져 픽셀 비교가 흔들린다.
 *
 * 운영자가 상품 등록에서 **사진을 올리면 그 사진이 이긴다**(`ProductRecord.imageUrl`).
 * 이 파일은 그때까지의 자리를 지킬 뿐이다.
 *
 * ## 어드민 연동
 * - `imageUrl` ← `b2c-admin` 상품 등록의 **대표 이미지** 업로드
 * - 그림 종류는 카테고리(상품 > 카테고리)로 고른다 — 새 카테고리가 생기면 여기에 한 줄 추가한다
 */
export type ProductArtKind =
  | 'shirt'
  | 'chair'
  | 'lamp'
  | 'mug'
  | 'bedding'
  | 'bag'
  | 'shoe'
  | 'bottle'
  | 'box';

export type ProductArt = {
  kind: ProductArtKind;
  /** 배경 그러데이션의 두 색 */
  from: string;
  to: string;
  /** 도형 색 */
  ink: string;
};

/** 카테고리 이름에 들어가는 말 → 그림 종류. 위에서부터 먼저 걸리는 것을 쓴다. */
const BY_KEYWORD: Array<[string, ProductArtKind]> = [
  ['의류', 'shirt'],
  ['패션', 'shirt'],
  ['상의', 'shirt'],
  ['신발', 'shoe'],
  ['가방', 'bag'],
  ['체어', 'chair'],
  ['의자', 'chair'],
  ['가구', 'chair'],
  ['조명', 'lamp'],
  ['램프', 'lamp'],
  ['주방', 'mug'],
  ['컵', 'mug'],
  ['그라인더', 'mug'],
  ['침구', 'bedding'],
  ['이불', 'bedding'],
  ['텀블러', 'bottle'],
  ['보틀', 'bottle'],
  ['캠핑', 'box'],
  ['리빙', 'box'],
];

/**
 * 색은 **상품 아이디로 정한다** — 목록을 새로 그릴 때마다 색이 바뀌면 같은 상품인지 알 수 없다.
 * 무작위를 쓰지 않는 이유이기도 하다: 픽셀 비교가 매번 어긋난다.
 */
const PALETTE: Array<Pick<ProductArt, 'from' | 'to' | 'ink'>> = [
  { from: '#eef2f7', to: '#dbe3ee', ink: '#5b6b83' },
  { from: '#f3efe9', to: '#e6ddd0', ink: '#8a7355' },
  { from: '#eaf1ee', to: '#d6e5df', ink: '#4f7a6b' },
  { from: '#f2eef5', to: '#e2dbec', ink: '#6f5f8c' },
  { from: '#f5efee', to: '#ecdcd9', ink: '#8c625b' },
  { from: '#eef4f6', to: '#dae8ee', ink: '#4d7286' },
];

function hashOf(value: string): number {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) % 100_000;
  return total;
}

export function productArt(input: { id: string; name: string; categoryName: string }): ProductArt {
  const haystack = `${input.categoryName} ${input.name}`;
  const found = BY_KEYWORD.find(([word]) => haystack.includes(word));
  const tone = PALETTE[hashOf(input.id) % PALETTE.length] ?? PALETTE[0]!;

  return { kind: found?.[1] ?? 'box', ...tone };
}
