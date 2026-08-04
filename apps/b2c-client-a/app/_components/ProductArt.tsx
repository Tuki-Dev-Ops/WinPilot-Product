import type { ProductArtKind } from '@winpilot/client-content';

/**
 * 상품 그림 — 사진이 없을 때 그 자리를 지키는 **벡터 그림**.
 *
 * 회색 네모에 이름만 적어 두면 어떤 상품인지 짐작할 수 없고, 목록 전체가 한 덩어리로 보인다.
 * 종류별로 다른 도형을 그리면 훑는 것만으로 무엇이 있는지 잡힌다.
 *
 * 전부 `viewBox="0 0 200 200"` 한 좌표계에서 그린다 — 종류마다 크기가 다르면 카드 안에서
 * 어떤 것은 크고 어떤 것은 작아 보여 목록이 들쭉날쭉해진다.
 *
 * ## 어드민 연동
 * - 운영자가 상품 등록에서 **대표 이미지**를 올리면 그 사진이 이 그림을 대체한다
 * - 그림 종류는 상품 > 카테고리에서 정한 분류로 고른다 (store `productArt`)
 */
export function ProductArt({
  kind,
  from,
  to,
  ink,
  className = '',
}: {
  kind: ProductArtKind;
  from: string;
  to: string;
  ink: string;
  className?: string;
}) {
  // 그러데이션 id 는 색으로 만든다 — 한 화면에 같은 색이 여럿 있어도 정의는 하나면 된다.
  const gradientId = `art-${from.slice(1)}-${to.slice(1)}`;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <g fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <Shape kind={kind} ink={ink} />
      </g>
    </svg>
  );
}

function Shape({ kind, ink }: { kind: ProductArtKind; ink: string }) {
  switch (kind) {
    case 'shirt':
      return (
        <>
          <path d="M72 58 L60 66 L52 90 L68 98 L68 148 L132 148 L132 98 L148 90 L140 66 L128 58 L112 58 a12 12 0 0 1 -24 0 Z" />
          <path d="M88 58 a12 12 0 0 0 24 0" opacity="0.45" />
        </>
      );

    case 'chair':
      return (
        <>
          <path d="M68 62 h64 v52 h-64 Z" />
          <path d="M60 114 h80" />
          <path d="M70 114 L64 152 M130 114 L136 152" />
          <path d="M76 62 v-6 a24 24 0 0 1 48 0 v6" opacity="0.45" />
        </>
      );

    case 'lamp':
      return (
        <>
          <path d="M74 92 L84 56 h32 l10 36 Z" />
          <path d="M100 92 v52" />
          <path d="M78 148 h44" />
          <path d="M92 104 a8 8 0 0 0 16 0" opacity="0.45" />
        </>
      );

    case 'mug':
      return (
        <>
          <path d="M64 66 h64 v58 a18 18 0 0 1 -18 18 h-28 a18 18 0 0 1 -18 -18 Z" />
          <path d="M128 80 h14 a14 14 0 0 1 0 28 h-14" />
          <path d="M78 50 v-8 M100 50 v-12 M122 50 v-8" opacity="0.45" />
        </>
      );

    case 'bedding':
      return (
        <>
          <path d="M46 96 h108 v46 h-108 Z" />
          <path d="M46 96 a20 20 0 0 1 20 -20 h68 a20 20 0 0 1 20 20" />
          <path d="M64 96 v-8 a10 10 0 0 1 10 -10 h52 a10 10 0 0 1 10 10 v8" opacity="0.45" />
          <path d="M56 142 v10 M144 142 v10" />
        </>
      );

    case 'bag':
      return (
        <>
          <path d="M62 78 h76 l8 68 h-92 Z" />
          <path d="M82 78 v-10 a18 18 0 0 1 36 0 v10" />
          <path d="M84 100 v10 M116 100 v10" opacity="0.45" />
        </>
      );

    case 'shoe':
      return (
        <>
          <path d="M50 122 h44 l18 -14 22 6 18 12 v14 h-102 Z" />
          <path d="M50 122 v-16 h20 l10 16" />
          <path d="M96 122 l10 -8 M112 118 l8 8" opacity="0.45" />
        </>
      );

    case 'bottle':
      return (
        <>
          <path d="M84 62 h32 v14 l10 16 v58 a10 10 0 0 1 -10 10 h-32 a10 10 0 0 1 -10 -10 v-58 l10 -16 Z" />
          <path d="M84 108 h32" opacity="0.45" />
          <path d="M88 50 h24" />
        </>
      );

    case 'box':
    default:
      return (
        <>
          <path d="M100 54 L154 80 v46 L100 152 L46 126 V80 Z" />
          <path d="M46 80 L100 106 L154 80" />
          <path d="M100 106 v46" />
          <circle cx="100" cy="80" r="4" fill={ink} stroke="none" opacity="0.5" />
        </>
      );
  }
}
