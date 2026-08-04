import type { ReactNode } from 'react';

/**
 * 바로가기 아이콘.
 *
 * 그림을 쓰지 않고 **선으로 직접 그린다** — 아이콘 폰트나 비트맵은 추출 시점에 글리프·픽셀이 되어
 * Figma 에서 벡터로 복원되지 않는다 (docs/spec/05-component.md).
 *
 * 24 격자에 굵기 1.5 로 통일한다. 아이콘마다 굵기가 다르면 한 줄에 놓았을 때
 * 어떤 것은 진하고 어떤 것은 흐려 보여 줄이 고르지 않다.
 *
 * ## 어드민 연동
 * - 카테고리 아이콘은 `b2c-admin` 상품 > 카테고리의 이름으로 고른다 — 새 분류가 생기면 여기에 한 줄 추가한다
 */
const BOX = 'h-9 w-9';

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={BOX}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 리빙 — 소파 */
export function LivingIcon() {
  return (
    <Frame>
      <path d="M4 12.5V10a2 2 0 0 1 4 0v2" />
      <path d="M16 12.5V10a2 2 0 0 1 4 0v2.5" />
      <path d="M4 12.5h16v4.5H4z" />
      <path d="M6.5 17v2M17.5 17v2" />
      <path d="M8 12.5V9.5h8v3" />
    </Frame>
  );
}

/** 패션 — 옷 */
export function FashionIcon() {
  return (
    <Frame>
      <path d="M9 4 12 6.5 15 4l4.5 2.5-1.5 4-2-.8V20H8V9.7l-2 .8-1.5-4z" />
    </Frame>
  );
}

/** 신상품 — 반짝임 */
export function NewIcon() {
  return (
    <Frame>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.3l-1.9-5.5L4.5 10.9 10.1 9z" />
      <path d="M18.5 15.5l.7 1.9 1.8.6-1.8.6-.7 1.9-.7-1.9-1.8-.6 1.8-.6z" />
    </Frame>
  );
}

/** 베스트 — 트로피 */
export function BestIcon() {
  return (
    <Frame>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5V7a3 3 0 0 0 2.6 3M16 5.5h2.5V7a3 3 0 0 1-2.6 3" />
      <path d="M12 13v3.5M9 20h6l-.6-3.5H9.6z" />
    </Frame>
  );
}

/** 상품 — 가격표 */
export function TagIcon() {
  return (
    <Frame>
      <path d="M4 11.4V4.5h6.9l8.6 8.6-6.9 6.9z" />
      <circle cx="8" cy="8" r="1.3" />
    </Frame>
  );
}

/** 포트폴리오 — 사진 */
export function PortfolioIcon() {
  return (
    <Frame>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <circle cx="8.5" cy="10" r="1.4" />
      <path d="M4 16.5 9.5 12l3.5 3 2.5-2 4.5 3.5" />
    </Frame>
  );
}

/** 공지사항 — 확성기 */
export function NoticeIcon() {
  return (
    <Frame>
      <path d="M4 10v4h3l7 4V6l-7 4z" />
      <path d="M17.5 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M6 14v4.5h2.5V14" />
    </Frame>
  );
}

/** FAQ — 물음표 말풍선 */
export function FaqIcon() {
  return (
    <Frame>
      <path d="M20 15a2 2 0 0 1-2 2H9l-4 3.5V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" />
      <path d="M10.2 9.2a1.9 1.9 0 1 1 2.8 1.7c-.6.3-1 .8-1 1.5" />
      <path d="M12 14.6v.05" />
    </Frame>
  );
}

/** 뉴스 — 신문 */
export function NewsIcon() {
  return (
    <Frame>
      <path d="M4 6h12v12.5H5.5A1.5 1.5 0 0 1 4 17z" />
      <path d="M16 9h3v8a1.5 1.5 0 0 1-3 0z" />
      <path d="M6.5 9h7M6.5 12h7M6.5 15h4" />
    </Frame>
  );
}

/** 회사소개 — 건물 */
export function CompanyIcon() {
  return (
    <Frame>
      <path d="M4.5 20V6.5L12 3.5l7.5 3V20" />
      <path d="M3 20h18" />
      <path d="M8.5 9.5h2M13.5 9.5h2M8.5 13h2M13.5 13h2" />
      <path d="M10.5 20v-3.5h3V20" />
    </Frame>
  );
}

/** 문의하기 — 봉투 */
export function ContactIcon() {
  return (
    <Frame>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7.5 12 13l8-5.5" />
    </Frame>
  );
}

/**
 * 카테고리 이름에 맞는 아이콘.
 *
 * 어드민에서 만든 이름은 미리 알 수 없으므로, 익숙한 이름만 짝지어 두고
 * 나머지는 가격표 아이콘으로 떨어뜨린다 — 억지로 다른 그림을 붙이면 뜻이 어긋난다.
 */
const CATEGORY_ICONS: Record<string, () => ReactNode> = {
  리빙: LivingIcon,
  패션: FashionIcon,
  아웃도어: BestIcon,
};

export function categoryIcon(name: string): ReactNode {
  const Icon = CATEGORY_ICONS[name];
  return Icon ? <Icon /> : <TagIcon />;
}
