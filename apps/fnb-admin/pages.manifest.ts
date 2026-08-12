import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * F&B Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 목록 하나에 상세(`/[id]`)가 붙는다. 상세는 주소에 값이 들어가므로 `sampleUrl` 로 실제로 열리는
 * 주소를 함께 적는다 — 없으면 캡처가 `[menuId]` 라는 글자 그대로를 열어 404 를 찍는다.
 *
 * ## 대역이 사이드바 차례다
 * 대시보드(1) · 등록(10) · 창업(30) · 고객센터(50) · 배너(70) · 설정(90). 대역을 띄우는 이유는
 * 중간에 화면을 하나 끼울 때 전체 번호를 다시 매기지 않기 위해서다.
 *
 * 한때 `창업 문의(10) · 메뉴(20) · 매장(30) · 콘텐츠(40)` 였다. 콘솔의 갈래가 **하는 일**로
 * 다시 짜이면서(`fnb-menu.ts`) 여기도 함께 옮겼다 — 이 목록과 사이드바가 어긋나면 캡처된
 * 화면의 차례가 실제로 쓰는 차례와 달라지고, 그것은 Figma 에서만 드러난다.
 *
 * ## 등록 화면이 일곱이다
 * 상세가 있는 자원마다 `/new` 가 하나씩 붙는다. 같은 폼을 빈 값으로 여는 것이라(`mode`),
 * 화면이 둘로 나뉘지 않는다 — 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고, 그러다 **등록에만
 * 없는 칸**이 생긴다.
 *
 * 창업 문의만 `/new` 가 없다. **손님이 남기는 것**이라 본사가 대신 적을 자리가 아니다 —
 * 전화로 들어온 건을 옮겨 적는 흐름이 생기면 그때 붙인다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },

  // 10번대 — 등록. 매일 손대는 것이라 맨 앞이다.
  { order: 10, id: 'menus', name: 'Menus', route: '/menus' },
  {
    order: 11,
    id: 'menus-detail',
    name: 'Menu Detail',
    route: '/menus/[menuId]',
    sampleUrl: '/menus/sukhoe-whole',
  },
  { order: 12, id: 'menus-new', name: 'Menu Create', route: '/menus/new' },
  { order: 13, id: 'menus-categories', name: 'Menu Categories', route: '/menus/categories' },
  { order: 15, id: 'marketing', name: 'Marketing Posts', route: '/marketing' },
  {
    order: 16,
    id: 'marketing-detail',
    name: 'Marketing Post Detail',
    route: '/marketing/[postId]',
    sampleUrl: '/marketing/MP-01',
  },
  { order: 17, id: 'marketing-new', name: 'Marketing Post Create', route: '/marketing/new' },
  { order: 20, id: 'stores', name: 'Stores', route: '/stores' },
  {
    order: 21,
    id: 'stores-detail',
    name: 'Store Detail',
    route: '/stores/[storeId]',
    sampleUrl: '/stores/gunsan',
  },

  { order: 22, id: 'stores-new', name: 'Store Create', route: '/stores/new' },

  // 30번대 — 창업. 문의가 들어오면 손댄다.
  { order: 30, id: 'inquiries', name: 'Franchise Inquiries', route: '/inquiries' },
  {
    order: 31,
    id: 'inquiries-detail',
    name: 'Inquiry Detail',
    route: '/inquiries/[inquiryId]',
    sampleUrl: '/inquiries/FQ-0108',
  },
  { order: 35, id: 'franchise-faqs', name: 'Franchise FAQ', route: '/franchise/faqs' },
  {
    order: 36,
    id: 'franchise-faqs-detail',
    name: 'Franchise FAQ Detail',
    route: '/franchise/faqs/[faqId]',
    sampleUrl: '/franchise/faqs/F-05',
  },
  { order: 37, id: 'franchise-faqs-new', name: 'Franchise FAQ Create', route: '/franchise/faqs/new' },
  { order: 38, id: 'franchise-cost', name: 'Franchise Cost', route: '/settings/franchise' },

  // 50번대 — 고객센터
  { order: 50, id: 'support-faqs', name: 'Support FAQ', route: '/support/faqs' },
  {
    order: 51,
    id: 'support-faqs-detail',
    name: 'Support FAQ Detail',
    route: '/support/faqs/[faqId]',
    sampleUrl: '/support/faqs/F-01',
  },
  { order: 52, id: 'support-faqs-new', name: 'Support FAQ Create', route: '/support/faqs/new' },
  { order: 55, id: 'support-notices', name: 'Notices', route: '/support/notices' },
  {
    order: 56,
    id: 'support-notices-detail',
    name: 'Notice Detail',
    route: '/support/notices/[noticeId]',
    sampleUrl: '/support/notices/N-012',
  },
  { order: 57, id: 'support-notices-new', name: 'Notice Create', route: '/support/notices/new' },

  // 70번대 — 배너
  { order: 70, id: 'banners-main', name: 'Main Visuals', route: '/banners/main' },
  {
    order: 71,
    id: 'banners-main-detail',
    name: 'Main Visual Detail',
    route: '/banners/main/[bannerId]',
    sampleUrl: '/banners/main/BN-01',
  },
  { order: 72, id: 'banners-main-new', name: 'Main Visual Create', route: '/banners/main/new' },
  { order: 75, id: 'banners-popups', name: 'Popups', route: '/banners/popups' },
  {
    order: 76,
    id: 'banners-popups-detail',
    name: 'Popup Detail',
    route: '/banners/popups/[popupId]',
    sampleUrl: '/banners/popups/PU-01',
  },

  { order: 77, id: 'banners-popups-new', name: 'Popup Create', route: '/banners/popups/new' },

  /*
    90번대 — 설정. 사이트에 나가는 값과 성격이 달라 대역을 띄운다.

    차례는 사이드바와 같다: 브랜드 정보(90) 다음 관리자(92). 한때 `공급자 관리` 가 90 이었는데
    화면을 걷어내면서 번호가 비었다 — 대역을 띄워 둔 까닭이 이것이다. 뒤를 당겨 메우지 않는다.
  */
  { order: 90, id: 'settings-brand', name: 'Brand Settings', route: '/settings/brand' },
  { order: 92, id: 'settings-admins', name: 'Admins', route: '/settings/admins' },
  {
    order: 93,
    id: 'settings-admins-detail',
    name: 'Admin Detail',
    route: '/settings/admins/[adminId]',
    sampleUrl: '/settings/admins/AD-01',
  },
  { order: 94, id: 'settings-admins-new', name: 'Admin Create', route: '/settings/admins/new' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
