/**
 * IR Admin 내비게이션.
 *
 * 규칙은 다른 콘솔과 같다 — **사이드바는 최상위만**, 세부는 본문 왼쪽 보조 메뉴에 둔다
 * (`docs/spec/04-ia.md` §4.4). 다르게 두면 콘솔을 오가는 사람이 구조를 두 번 배운다.
 *
 * ## 차례가 곧 운영자의 하루다
 * 문의가 먼저다 — **밖에서 들어온 것**이고, 늦으면 그 사실이 고객 쪽에 남는다. 그다음이
 * 콘텐츠(공지·뉴스·FAQ)처럼 자주 손대는 것, 그다음이 제품·솔루션·회사처럼 한 번 정해 두고
 * 가끔 고치는 것, 그다음이 배너, 마지막이 통계다.
 *
 * 통계를 맨 뒤에 두는 이유: **읽기만 하는 화면**이다. 앞에 두면 들어올 때마다 숫자를 먼저 보게
 * 되는데, 정작 오늘 해야 할 일은 문의함에 있다.
 *
 * 설정 앞에 선을 하나 긋는다. 위쪽은 **사이트에 나가는 값**이고 설정부터는 사이트 자체의
 * 값이다(다른 두 콘솔과 같은 규칙).
 *
 * ## 공시·재무·주주·자료는 어디로 갔나
 * 이 콘솔이 처음에는 공시 중심이었다(공시 · 재무 · 주주 · 자료). 그런데 실제로 손대는 것은
 * **회사 홈페이지**였고, 공시 화면들은 만들어 둔 채 거의 열리지 않았다. 지금 메뉴는 그 실제
 * 쓰임을 따른다.
 *
 * 그 화면들은 주소로는 남아 있다(`/disclosures` · `/financials` · `/shareholders` ·
 * `/library`). 지우지 않은 이유: **투자자 화면이 그 값을 읽고 있다** — 사이트의 공시·재무
 * 목록이 지금도 store 의 같은 값을 그린다. 메뉴에 다시 세울지는 IR 담당자가 정할 일이다.
 */
export type IrMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

export type IrMenuItem = IrMenuChild & {
  children?: IrMenuChild[];
  /** 성격이 다른 갈래 앞의 선 */
  separatedBefore?: boolean;
};

export const IR_MENU: readonly IrMenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/', ready: true },
  {
    id: 'inquiry',
    label: '문의',
    href: '/inquiries',
    children: [
      { id: 'inquiry-list', label: '목록', href: '/inquiries', ready: true },
      { id: 'inquiry-settings', label: '설정', href: '/inquiries/settings', ready: true },
    ],
  },
  {
    id: 'content',
    label: '콘텐츠',
    href: '/contents/notices',
    children: [
      { id: 'content-notices', label: '공지사항', href: '/contents/notices', ready: true },
      { id: 'content-news', label: '뉴스', href: '/contents/news', ready: true },
      { id: 'content-faqs', label: 'FAQ', href: '/contents/faqs', ready: true },
    ],
  },
  {
    id: 'product',
    label: '제품',
    href: '/products',
    children: [
      { id: 'product-list', label: '목록', href: '/products', ready: true },
      { id: 'product-settings', label: '설정', href: '/products/settings', ready: true },
    ],
  },
  {
    id: 'solution',
    label: '솔루션',
    href: '/solutions',
    children: [
      { id: 'solution-list', label: '목록', href: '/solutions', ready: true },
      { id: 'solution-settings', label: '설정', href: '/solutions/settings', ready: true },
    ],
  },
  {
    id: 'company',
    label: '회사',
    href: '/company/about',
    children: [
      { id: 'company-about', label: '소개', href: '/company/about', ready: true },
      { id: 'company-history', label: '연혁', href: '/company/history', ready: true },
      { id: 'company-credentials', label: '특허 및 인증', href: '/company/credentials', ready: true },
    ],
  },
  {
    id: 'banner',
    label: '배너',
    href: '/banners',
    children: [
      { id: 'banner-hero', label: '메인 비주얼', href: '/banners', ready: true },
      { id: 'banner-popup', label: '팝업', href: '/banners/popups', ready: true },
    ],
  },
  {
    /*
      읽기만 하는 갈래라 맨 뒤다. 앞에 두면 들어올 때마다 숫자를 먼저 보게 되는데, 정작 오늘
      해야 할 일은 문의함에 있다.
    */
    id: 'statistics',
    label: '통계',
    href: '/statistics',
    children: [
      { id: 'statistics-home', label: '홈', href: '/statistics', ready: true },
      { id: 'statistics-period', label: '기간별 분석', href: '/statistics/period', ready: true },
      { id: 'statistics-pages', label: '많이 방문한 페이지', href: '/statistics/pages', ready: true },
    ],
  },
  {
    /*
      받은 메뉴(대시보드~통계)에 없는 갈래다. 그런데도 두는 이유: **투자자 화면이 아직 이
      값들을 내보내고 있다** — 공시·재무·주주총회·IR 자료실이 사이트 푸터에서 열린다. 화면은
      살아 있는데 고치는 자리만 메뉴에서 빼면, 공시 하나 올리려고 코드를 고쳐 배포하게 된다.

      회사 홈페이지를 다루는 앞의 여덟과 성격이 달라 뒤로 물리고 줄을 그어 나눈다.
    */
    id: 'ir',
    label: 'IR',
    href: '/disclosures',
    separatedBefore: true,
    children: [
      { id: 'ir-disclosures', label: '공시', href: '/disclosures', ready: true },
      { id: 'ir-dart', label: 'DART 연동', href: '/disclosures/dart', ready: true },
      { id: 'ir-financials', label: '재무', href: '/financials', ready: true },
      { id: 'ir-stock', label: '주가 연동', href: '/financials/stock', ready: true },
      { id: 'ir-dividends', label: '배당', href: '/financials/dividends', ready: true },
      { id: 'ir-meetings', label: '주주총회', href: '/shareholders/meetings', ready: true },
      { id: 'ir-governance', label: '지배구조', href: '/shareholders/governance', ready: true },
      { id: 'ir-library', label: 'IR 자료실', href: '/library', ready: true },
      { id: 'ir-schedules', label: 'IR 일정', href: '/library/schedules', ready: true },
      { id: 'ir-subscribers', label: '알림 구독자', href: '/library/notifications', ready: true },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/supplier',
    separatedBefore: true,
    children: [
      { id: 'settings-supplier', label: '공급자 정보', href: '/settings/supplier', ready: true },
      { id: 'settings-seo', label: 'SEO 정보', href: '/settings/seo', ready: true },
      { id: 'settings-terms', label: '서비스 이용약관', href: '/settings/terms', ready: true },
      { id: 'settings-privacy', label: '개인정보 처리방침', href: '/settings/privacy', ready: true },
      { id: 'settings-locales', label: '국문 · 영문', href: '/settings/locales', ready: true },
    ],
  },
];

export function findIrSection(id: string): IrMenuItem | undefined {
  return IR_MENU.find((item) => item.id === id);
}

/** 아직 만들지 않은 화면은 링크를 걸지 않는다. */
export function linkFor(item: IrMenuChild): string {
  return item.ready ? item.href : '#none';
}
