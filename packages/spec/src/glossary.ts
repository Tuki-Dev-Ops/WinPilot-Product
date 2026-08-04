/**
 * 용어 사전 (Ubiquitous Language).
 *
 * 싱크가 깨지는 첫 번째 원인은 레이아웃이 아니라 **단어**다.
 * Client 에서 `product`, Admin 에서 `item` 으로 쓰기 시작하면 두 구현을 기계적으로 짝지을 방법이 사라진다.
 * 여기 등록된 정규 용어만 엔티티·컴포넌트·라우트에 쓸 수 있고, `banned` 는 검사기가 막는다.
 *
 * 도메인이 확정되면 이 표를 채운다 — 아래는 예시 시드다.
 */
export type GlossaryEntry = {
  canonical: string;
  ko: string;
  banned: string[];
  note?: string;
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    canonical: 'site',
    ko: '사이트',
    banned: ['landing', 'homepage', 'main', 'index'],
    note: '제품을 소개하는 진입 영역. 라우트는 `/` 지만 엔티티명은 site 로 통일한다.',
  },
  {
    canonical: 'product',
    ko: '상품',
    banned: ['item', 'goods', 'merchandise', 'article', 'sku'],
    note: '판매/등록 단위. Admin 에서도 동일하게 product 를 쓴다.',
  },
  {
    canonical: 'user',
    ko: '사용자',
    banned: ['member', 'client', 'customer', 'account'],
    note: "'client' 는 뷰 이름과 충돌하므로 엔티티명으로 쓸 수 없다.",
  },
  {
    canonical: 'order',
    ko: '주문',
    banned: ['purchase', 'transaction', 'deal'],
    note: "어드민 메뉴에는 '판매' 로 적히지만 자원은 같은 주문이다 — 엔티티는 order 하나로 쓴다.",
  },
  { canonical: 'cart', ko: '장바구니', banned: ['basket', 'bag'] },
  {
    canonical: 'coupon',
    ko: '쿠폰',
    banned: ['voucher', 'promo'],
    note: '고객 화면에서는 쿠폰함으로 묶어 보여준다. 발급·회수하는 어드민 화면은 아직 없다.',
  },
  { canonical: 'alarm', ko: '알람', banned: ['alert', 'push'] },
  {
    canonical: 'staff',
    ko: '관리자',
    banned: ['manager', 'operator'],
    note: "운영 권한을 가진 사용자. 'admin' 은 뷰 접두어(AdminXxxPage)와 겹쳐 엔티티명으로 쓰지 않는다.",
  },
  { canonical: 'grade', ko: '등급', banned: ['tier', 'rank', 'level'] },
  { canonical: 'category', ko: '카테고리', banned: ['group', 'section', 'taxonomy'] },
  { canonical: 'notice', ko: '공지사항', banned: ['announcement', 'notification'] },
  { canonical: 'faq', ko: 'FAQ', banned: ['qna', 'question'] },
  { canonical: 'news', ko: '뉴스', banned: ['article', 'press'] },
  { canonical: 'portfolio', ko: '포트폴리오', banned: ['work', 'case'] },
  {
    canonical: 'profile',
    ko: '회사 소개',
    banned: ['about', 'intro'],
    note: '단일 자원. 목록이 아니라 편집 화면 하나로 존재한다.',
  },
  { canonical: 'milestone', ko: '연혁', banned: ['history', 'timeline'] },
  {
    canonical: 'banner',
    ko: '배너',
    banned: ['slide', 'hero', 'carousel'],
    note: "메인 비주얼. 'main' 은 site 의 금지어이므로 라우트에도 쓰지 않는다 — `/banners` 를 쓴다.",
  },
  { canonical: 'popup', ko: '팝업', banned: ['overlay', 'lightbox'] },
  {
    canonical: 'tenant',
    ko: '고객사',
    banned: ['org', 'workspace'],
    note: "우리 제품을 쓰는 회사. 'customer'/'client' 는 각각 user 와 뷰 이름에 이미 묶여 있어 쓰지 않는다.",
  },
  { canonical: 'analytics', ko: '통계', banned: ['stat', 'stats', 'metric', 'report'] },
  { canonical: 'pageview', ko: '페이지 조회', banned: ['pv', 'hit', 'impression'] },
  { canonical: 'revenue', ko: '매출', banned: ['income', 'turnover', 'profit'] },
  { canonical: 'invoice', ko: '요금', banned: ['bill', 'charge', 'fee'] },
  { canonical: 'inquiry', ko: '문의', banned: ['contact', 'question', 'ticket'] },
  { canonical: 'supplier', ko: '공급자', banned: ['vendor', 'provider'] },
  { canonical: 'seo', ko: 'SEO', banned: [] },
  { canonical: 'terms', ko: '이용약관', banned: ['tos', 'agreement'] },
  { canonical: 'privacy', ko: '개인정보 처리방침', banned: ['gdpr'] },
  { canonical: 'oauth', ko: 'OAuth', banned: ['sso'] },
  { canonical: 'payment', ko: '결제', banned: ['pg', 'billing', 'checkout'] },
];

const BANNED_INDEX: ReadonlyMap<string, string> = new Map(
  GLOSSARY.flatMap((entry) => entry.banned.map((word) => [word.toLowerCase(), entry.canonical] as const)),
);

const CANONICAL_SET: ReadonlySet<string> = new Set(GLOSSARY.map((entry) => entry.canonical));

/** 금지어라면 정규 용어를 돌려준다. 아니면 null. */
export function canonicalFor(word: string): string | null {
  return BANNED_INDEX.get(word.toLowerCase()) ?? null;
}

export function isCanonical(word: string): boolean {
  return CANONICAL_SET.has(word.toLowerCase());
}

/** 식별자(PascalCase/kebab-case/camelCase) 안에 섞인 금지어를 찾는다. */
export function findBannedWords(identifier: string): Array<{ found: string; canonical: string }> {
  const words = identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

  const hits: Array<{ found: string; canonical: string }> = [];
  for (const word of new Set(words)) {
    const canonical = canonicalFor(word);
    if (canonical) hits.push({ found: word, canonical });
  }
  return hits;
}
