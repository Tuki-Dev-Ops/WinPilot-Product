/**
 * IR Admin 내비게이션.
 *
 * 규칙은 다른 콘솔과 같다 — **사이드바는 최상위만**, 세부는 본문 왼쪽 보조 메뉴에 둔다
 * (`docs/spec/04-ia.md` §4.4). 다르게 두면 콘솔을 오가는 사람이 구조를 두 번 배운다.
 *
 * ## 차례가 곧 운영자의 하루다
 * 문의가 먼저다 — **밖에서 들어온 것**이고, 늦으면 그 사실이 고객 쪽에 남는다. 그다음이
 * 콘텐츠(공지·뉴스·FAQ)처럼 자주 손대는 것, 그다음이 제품·서비스·회사처럼 한 번 정해 두고
 * 가끔 고치는 것, 그다음이 배너, 마지막이 통계다.
 *
 * 통계를 맨 뒤에 두는 이유: **읽기만 하는 화면**이다. 앞에 두면 들어올 때마다 숫자를 먼저 보게
 * 되는데, 정작 오늘 해야 할 일은 문의함에 있다.
 *
 * 설정 앞에 선을 하나 긋는다. 위쪽은 **사이트에 나가는 값**이고 설정부터는 사이트 자체의
 * 값이다(다른 두 콘솔과 같은 규칙).
 *
 * ## 공시 · 재무 · 주주 · 자료를 지운 자리
 * 이 콘솔이 처음에는 공시 중심이었다(공시 · 재무 · 주주 · 자료 네 갈래). 그런데 실제로 손대는
 * 것은 **회사 홈페이지**였고, 공시 화면들은 만들어 둔 채 거의 열리지 않았다.
 *
 * 사이드바에서 뺐다가, `IR` 갈래로 되돌렸다가, 다시 뺐다가, 결국 **화면째 지웠다.** 되돌렸던
 * 근거는 그 열 안에 되돌릴 수 없는 공시 게시가 있다는 것이었는데, 운영이 필요 없다고 정했다.
 * 이 사연을 남기는 이유는 다음에 같은 판단을 다시 하게 되기 때문이다.
 *
 * 지운 것: `/disclosures` · `/disclosures/dart` · `/financials` · `/financials/stock` ·
 * `/financials/dividends` · `/shareholders/meetings` · `/shareholders/governance` ·
 * `/library` · `/library/schedules` · `/library/notifications` (열 화면).
 *
 * **투자자 사이트는 그대로다.** `apps/ir-client-a` 의 공시 · 재무 · 주주 · 자료 화면 열하나가
 * `@winpilot/store` 의 `ir.ts` 를 직접 읽으므로 계속 그린다 — 다만 이제 **저장소 어디에도
 * 고치는 자리가 없다.** 그 사실은 `apps/ir-client-a/docs/admin-mapping.md` §2 에 적혀 있고,
 * 사이트에서 그 화면들까지 내리기로 하면 그때 `ir.ts` 를 함께 지운다.
 *
 * ## `문제 · 해법` 은 화면을 남기고 메뉴에서만 뺐다
 * 이쪽은 안 열려서가 아니라 **제품 갈래와 겹쳐서**다. `/products` 가 `SOLUTIONS` 를 보고
 * `/solutions` 도 같은 값을 보는데 이름만 달랐다 — 같은 것을 두 이름으로 부르면 그때부터 두
 * 구현이 생긴다. 값이 같으니 화면을 지울 것까지는 없어 주소만 남겨 두었다.
 *
 * `/result` 도 메뉴 밖이다. 저장·삭제 뒤에 서는 자리라 원래 메뉴에 있을 것이 아니다.
 */
export type IrMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

/**
 * 갈래 하나.
 *
 * `ready` 를 최상위에도 반드시 적는다. 빠뜨리면 `linkFor` 가 `#none` 을 돌려주어 **사이드바의
 * 갈래 이름을 눌러도 아무 데도 가지 않는다** — 자식이 다 살아 있어도 그렇다. 화면은 멀쩡해
 * 보이는데 눌리지만 않아, 눈으로는 잡히지 않는 고장이다.
 */
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
    ready: true,
    children: [
      { id: 'inquiry-list', label: '목록', href: '/inquiries', ready: true },
      { id: 'inquiry-settings', label: '설정', href: '/inquiries/settings', ready: true },
    ],
  },
  {
    id: 'content',
    label: '콘텐츠',
    href: '/contents/notices',
    ready: true,
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
    ready: true,
    children: [
      { id: 'product-list', label: '목록', href: '/products', ready: true },
      { id: 'product-settings', label: '설정', href: '/products/settings', ready: true },
    ],
  },
  {
    /*
      제품 바로 뒤다. 둘 다 **파는 것**이라 붙여 두어야 오늘 무엇을 손댈지 고를 때 한자리에서
      고른다.

      갈래를 나눈 기준은 값이 아니라 **성격**이다 — 제품은 계약하면 그날부터 쓰는 클라우드
      넷을 보고, 여기는 사람이 현장에 가서 하는 일 둘을 본다. 한 갈래에 여섯을 섞으면 켜고 끌
      수 있는 줄과 없는 줄이 한 표 안에 서고, 그때부터 `왜 이 줄만 상태가 비어 있나` 를 화면이
      설명해야 한다.
    */
    id: 'service',
    label: '서비스',
    href: '/services',
    ready: true,
    children: [
      { id: 'service-list', label: '목록', href: '/services', ready: true },
      { id: 'service-settings', label: '설정', href: '/services/settings', ready: true },
    ],
  },
  {
    id: 'company',
    label: '회사',
    href: '/company/about',
    ready: true,
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
    ready: true,
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
    ready: true,
    children: [
      { id: 'statistics-home', label: '홈', href: '/statistics', ready: true },
      { id: 'statistics-period', label: '기간별 분석', href: '/statistics/period', ready: true },
      { id: 'statistics-pages', label: '많이 방문한 페이지', href: '/statistics/pages', ready: true },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/supplier',
    ready: true,
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
