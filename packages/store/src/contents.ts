/**
 * 콘텐츠 시드 데이터 — **프론트엔드 전용**.
 * 목록과 상세(등록·수정)가 같은 배열을 본다.
 */

/** 공지사항 · 뉴스 · 포트폴리오가 공통으로 갖는 것 */
type ContentBase = {
  id: string;
  title: string;
  createdAt: string;
  visible: boolean;
};

export type NoticeRecord = ContentBase & {
  /** 목록 맨 위에 고정 */
  pinned: boolean;
  /** HTML — RichTextEditor 가 만든다 */
  body: string;
};

export type NewsRecord = ContentBase & {
  /** 언론사·매체 이름 */
  press: string;
  /** 원문 링크 — 뉴스는 본문을 옮겨 싣지 않고 원문으로 보낸다 */
  url: string;
  publishedAt: string;
  summary: string;
};

export type PortfolioRecord = ContentBase & {
  client: string;
  period: string;
  /** HTML — 이미지가 본문 안에 들어간다 */
  body: string;
};

export type FaqCategoryRecord = {
  id: string;
  name: string;
  visible: boolean;
};

export type FaqRecord = {
  id: string;
  categoryId: string;
  question: string;
  /** HTML */
  answer: string;
  visible: boolean;
  createdAt: string;
};

export const NOTICES: NoticeRecord[] = [
  {
    id: 'N-1024',
    title: '추석 연휴 배송 일정 안내',
    createdAt: '2026-08-01',
    visible: true,
    pinned: true,
    body: '<p>추석 연휴 기간 배송이 순차적으로 지연될 수 있습니다.</p><ul><li>9월 24일 15시 이전 결제 건까지 연휴 전 출고</li><li>이후 주문은 9월 30일부터 순차 출고</li></ul>',
  },
  {
    id: 'N-1023',
    title: '개인정보 처리방침 개정 안내',
    createdAt: '2026-07-28',
    visible: true,
    pinned: false,
    body: '<p>2026년 8월 15일부터 개인정보 처리방침이 개정됩니다.</p>',
  },
  {
    id: 'N-1022',
    title: '시스템 점검 안내 (7월 20일 02:00 ~ 04:00)',
    createdAt: '2026-07-18',
    visible: false,
    pinned: false,
    body: '<p>점검 시간 동안 주문·결제가 일시 중단됩니다.</p>',
  },
];

export const NEWS: NewsRecord[] = [
  {
    id: 'W-2041',
    title: 'WinPilot, 자원 중심 어드민 콘솔 공개',
    createdAt: '2026-08-02',
    visible: true,
    press: '테크리포트',
    url: 'https://example.com/news/winpilot-admin-console',
    publishedAt: '2026-08-02',
    summary: '자원 단위로 화면을 나눈 어드민 구조를 소개했습니다.',
  },
  {
    id: 'W-2040',
    title: '디자인 시스템과 코드의 동기화 사례',
    createdAt: '2026-07-27',
    visible: true,
    press: '디자인위클리',
    url: 'https://example.com/news/design-code-sync',
    publishedAt: '2026-07-26',
    summary: '실행 중인 화면을 원본으로 삼는 방식이 다뤄졌습니다.',
  },
  {
    id: 'W-2039',
    title: '커머스 운영 자동화 좌담',
    createdAt: '2026-07-15',
    visible: false,
    press: '커머스인사이트',
    url: 'https://example.com/news/commerce-roundtable',
    publishedAt: '2026-07-14',
    summary: '',
  },
];

export const PORTFOLIOS: PortfolioRecord[] = [
  {
    id: 'F-3012',
    title: '리빙 브랜드 통합 커머스 구축',
    createdAt: '2026-07-30',
    visible: true,
    client: '무드하우스',
    period: '2026.03 ~ 2026.07',
    body: '<h3>과제</h3><p>브랜드 사이트와 판매 채널이 따로 움직이고 있었습니다.</p><h3>결과</h3><p>주문·재고를 한 화면에서 다루도록 통합했습니다.</p>',
  },
  {
    id: 'F-3011',
    title: '아웃도어 편집숍 리뉴얼',
    createdAt: '2026-06-20',
    visible: true,
    client: '트레일노트',
    period: '2026.01 ~ 2026.05',
    body: '<p>카테고리 구조를 2뎁스로 정리하고 상품 등록 흐름을 다시 짰습니다.</p>',
  },
];

export const FAQ_CATEGORIES: FaqCategoryRecord[] = [
  { id: 'FC-01', name: '주문·결제', visible: true },
  { id: 'FC-02', name: '배송', visible: true },
  { id: 'FC-03', name: '교환·반품', visible: true },
  { id: 'FC-04', name: '회원', visible: false },
];

export const FAQS: FaqRecord[] = [
  {
    id: 'FQ-101',
    categoryId: 'FC-01',
    question: '주문 후 결제 수단을 바꿀 수 있나요?',
    answer: '<p>결제 완료 전에는 주문 내역에서 변경할 수 있습니다. 결제가 끝난 뒤에는 취소 후 재주문이 필요합니다.</p>',
    visible: true,
    createdAt: '2026-07-20',
  },
  {
    id: 'FQ-102',
    categoryId: 'FC-01',
    question: '현금영수증은 어떻게 받나요?',
    answer: '<p>주문 상세 화면에서 신청할 수 있습니다.</p>',
    visible: true,
    createdAt: '2026-07-21',
  },
  {
    id: 'FQ-103',
    categoryId: 'FC-02',
    question: '배송은 얼마나 걸리나요?',
    answer: '<p>결제 완료 후 평균 2~3일이 걸립니다. 제주·도서산간은 하루 더 걸릴 수 있습니다.</p>',
    visible: true,
    createdAt: '2026-07-22',
  },
  {
    id: 'FQ-104',
    categoryId: 'FC-03',
    question: '교환은 어떤 경우에 가능한가요?',
    answer: '<p>같은 상품의 <strong>같은 색상, 다른 사이즈</strong>로만 교환할 수 있습니다. 색상이나 상품을 바꾸려면 취소 후 재주문해 주세요.</p>',
    visible: true,
    createdAt: '2026-07-25',
  },
];

export function findNotice(id: string): NoticeRecord | undefined {
  return NOTICES.find((item) => item.id === id);
}

export function findNews(id: string): NewsRecord | undefined {
  return NEWS.find((item) => item.id === id);
}

export function findPortfolio(id: string): PortfolioRecord | undefined {
  return PORTFOLIOS.find((item) => item.id === id);
}

/** `N-1024` 다음은 `N-1025` — 코드는 사람이 정하지 않는다. */
export function nextContentId(prefix: string, ids: readonly string[]): string {
  const max = ids.reduce((biggest, id) => Math.max(biggest, Number(id.replace(`${prefix}-`, '')) || 0), 0);
  return `${prefix}-${max + 1}`;
}
