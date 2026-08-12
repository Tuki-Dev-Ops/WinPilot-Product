import type { FeatureSpec } from './types';

/**
 * F&B 한 쌍의 기능 — 브랜드 사이트(`fnb-client`)와 그 운영 콘솔(`fnb-admin`).
 *
 * 파일을 나눈 까닭은 `features-ir.ts` 머리말과 같다.
 *
 * ## 이 한 쌍은 반대다
 * IR 이 `사이트에만 있는 값`으로 기울어 있다면 여기는 **어드민의 화면이 사이트에 나가는 것에서
 * 거꾸로 짜였다.** 사이트가 읽는 값 중 어드민에서 못 고치는 것이 거의 없다 — 그래서 짝이 맞지
 * 않는 기능이 나오면 그것은 대개 진짜 누락이다.
 *
 * ## id 에 `fnb.` 를 붙인다
 * 공지·FAQ·배너·팝업·관리자는 B2C 에도 같은 이름으로 있다. Feature ID 는 전 제품을 가로지르는
 * 유일한 식별자라 그대로 쓰면 부딪히므로, 도메인 한 마디를 앞에 붙여 **어느 제품의 공지인지**를
 * id 에 남긴다 (`internal.staff.list` 와 같은 방식이다).
 *
 * ## 짝이 한쪽뿐인 것은 두 갈래다
 * - 어드민에만 있는 것 — 등록/상세 폼, 배너·팝업처럼 **사이트에서는 결과만 보이는 것**
 * - 사이트에만 있는 것 — 약관·인테리어처럼 **아직 고칠 자리가 없는 것**
 * 어느 쪽이든 `singleViewByDesign` 에 왜인지를 함께 적는다. 적어 두지 않으면 다음 사람이
 * `VIEW_PARTIAL` 경고를 지우려고 없는 화면을 만든다.
 *
 * 대응 관계의 근거는 `apps/fnb-client-a/docs/admin-mapping.md` 의 표다.
 */
export const FNB_FEATURES: readonly FeatureSpec[] = [
  // ── 진입 화면 ────────────────────────────────────────────────────────
  {
    id: 'fnb.site.home',
    label: { ko: '홈', en: 'Home' },
    entity: 'site',
    action: 'home',
    views: {
      'fnb-client': {
        route: '/',
        component: 'SiteHomePage',
        status: 'implemented',
        note: '첫 화면 큰 글씨는 걸린 배너 맨 위 하나다 — 없으면 브랜드 태그라인으로 돌아간다',
      },
    },
    // 콘솔은 로그인 후 대시보드로 바로 들어간다 — 소개 화면이 설 자리가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.site.dashboard',
    label: { ko: '대시보드', en: 'Dashboard' },
    entity: 'site',
    action: 'dashboard',
    views: {
      'fnb-admin': {
        route: '/',
        component: 'FnbSiteDashboardPage',
        status: 'implemented',
        note: '오늘 들어온 창업 문의와 걸린 배너를 한 화면에서 본다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 브랜드 ──────────────────────────────────────────────────────────
  {
    id: 'fnb.brand.settings',
    label: { ko: '브랜드', en: 'Brand' },
    entity: 'brand',
    action: 'settings',
    views: {
      'fnb-client': {
        route: '/brand',
        component: 'BrandSettingsPage',
        status: 'implemented',
        note: '푸터까지 같은 값을 읽는다 — 화면에 글자로 박아 두면 이름을 갈아 끼울 때 그 자리만 남는다',
      },
      'fnb-admin': {
        route: '/settings/brand',
        component: 'FnbBrandSettingsPage',
        status: 'implemented',
        note: '사이트에 나가는 값이 아니라 사이트 전체가 읽는 설정이라 설정 갈래에 둔다',
      },
    },
  },

  // ── 메뉴 ────────────────────────────────────────────────────────────
  {
    id: 'fnb.menu.list',
    label: { ko: '메뉴', en: 'Menus' },
    entity: 'menu',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/menu',
        component: 'MenuListPage',
        status: 'implemented',
        note: '내려 둔 메뉴(품절·계절)는 store 의 공개 필터가 거른다 — 화면이 다시 판단하지 않는다',
      },
      'fnb-admin': { route: '/menus', component: 'FnbMenuListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.menu.detail',
    label: { ko: '메뉴 상세', en: 'Menu Detail' },
    entity: 'menu',
    action: 'detail',
    views: {
      'fnb-client': {
        route: '/menu/[itemId]',
        component: 'MenuDetailPage',
        status: 'implemented',
        // 동적 세그먼트 이름이 엔티티와 어긋나 있다(`[itemId]`). 라우트는 용어 검사를 받지
        // 않아 통과하지만, 앱에서 `[menuId]` 로 옮길 때 이 줄도 함께 고쳐야 한다.
        note: '주소의 조각이 `[itemId]` 다 — 어드민은 `[menuId]` 라 언젠가 한쪽으로 맞춰야 한다',
      },
      'fnb-admin': {
        route: '/menus/[menuId]',
        component: 'FnbMenuDetailPage',
        status: 'implemented',
        note: '수정도 이 화면에서 한다',
      },
    },
  },
  {
    id: 'fnb.menu.create',
    label: { ko: '메뉴 등록', en: 'Menu Create' },
    entity: 'menu',
    action: 'create',
    views: {
      'fnb-admin': { route: '/menus/new', component: 'FnbMenuCreatePage', status: 'implemented' },
    },
    // 메뉴는 본사만 올린다 — 사이트에서 손님이 만드는 자원이 아니다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.category.list',
    label: { ko: '메뉴 묶음', en: 'Menu Categories' },
    entity: 'category',
    action: 'list',
    views: {
      'fnb-admin': {
        route: '/menus/categories',
        component: 'FnbCategoryListPage',
        status: 'implemented',
        note: '메뉴판의 탭 차례가 여기서 나온다',
      },
    },
    // 사이트에서는 묶음이 목록이 아니라 메뉴판의 탭으로만 보인다 — 열 주소가 없다.
    singleViewByDesign: true,
  },

  // ── 인테리어 · 마케팅 ────────────────────────────────────────────────
  {
    id: 'fnb.interior.settings',
    label: { ko: '인테리어', en: 'Interior' },
    entity: 'interior',
    action: 'settings',
    views: {
      'fnb-client': {
        route: '/interior',
        component: 'InteriorSettingsPage',
        status: 'implemented',
        note: '평형 계획과 평당 단가는 창업 비용 화면에서 함께 고친다 — 완성 매장 사진만 아직 코드에 있다',
      },
    },
    /*
      어드민에 `/interior` 가 따로 없는 것이 맞다. 인테리어 값은 창업 비용·절차
      (`/settings/franchise`)의 한 항목이고, 화면을 나누면 같은 표를 두 곳에서 고치게 된다.
      한 라우트를 두 기능이 나눠 가질 수 없어(ROUTE_DUPLICATE) 이쪽을 한쪽 뷰로 둔다.
    */
    singleViewByDesign: true,
  },
  {
    id: 'fnb.marketing.list',
    label: { ko: '마케팅', en: 'Marketing Posts' },
    entity: 'marketing',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/marketing',
        component: 'MarketingListPage',
        status: 'implemented',
        note: '채널별로 묶어 보여 준다 — 숨긴 글은 공개 필터가 거른다',
      },
      'fnb-admin': { route: '/marketing', component: 'FnbMarketingListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.marketing.detail',
    label: { ko: '마케팅 글 상세', en: 'Marketing Post Detail' },
    entity: 'marketing',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/marketing/[postId]',
        component: 'FnbMarketingDetailPage',
        status: 'implemented',
      },
    },
    // 사이트는 글 하나를 여는 자리가 없다 — 채널 카드 안에서 본문까지 함께 읽힌다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.marketing.create',
    label: { ko: '마케팅 글 등록', en: 'Marketing Post Create' },
    entity: 'marketing',
    action: 'create',
    views: {
      'fnb-admin': { route: '/marketing/new', component: 'FnbMarketingCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 가맹점 ──────────────────────────────────────────────────────────
  {
    id: 'fnb.store.list',
    label: { ko: '매장안내', en: 'Stores' },
    entity: 'store',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/stores',
        component: 'StoreListPage',
        status: 'implemented',
        note: '휴점은 빠지고 **준비중은 남는다** — 곧 여는 곳을 찾아오는 손님이 있다',
      },
      'fnb-admin': { route: '/stores', component: 'FnbStoreListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.store.detail',
    label: { ko: '가맹점 상세', en: 'Store Detail' },
    entity: 'store',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/stores/[storeId]',
        component: 'FnbStoreDetailPage',
        status: 'implemented',
        note: '상태(영업·준비중·휴점)를 여기서 바꾸면 사이트의 매장 목록과 `지금 N곳` 이 함께 움직인다',
      },
    },
    // 사이트의 매장안내는 한 화면에서 지역으로 걸러 본다 — 매장 하나를 여는 주소가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.store.create',
    label: { ko: '가맹점 등록', en: 'Store Create' },
    entity: 'store',
    action: 'create',
    views: {
      'fnb-admin': { route: '/stores/new', component: 'FnbStoreCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 창업 ────────────────────────────────────────────────────────────
  {
    id: 'fnb.franchise.settings',
    label: { ko: '창업안내', en: 'Franchise' },
    entity: 'franchise',
    action: 'settings',
    views: {
      'fnb-client': {
        route: '/franchise',
        component: 'FranchiseSettingsPage',
        status: 'implemented',
        note: '홈의 숫자 띠가 읽는 창업 비용 합계도 같은 값이다',
      },
      'fnb-admin': {
        route: '/settings/franchise',
        component: 'FnbFranchiseSettingsPage',
        status: 'implemented',
        note: '비용·절차·인테리어 값이 한 표에 있다 — 나누면 같은 항목을 두 곳에서 고치게 된다',
      },
    },
  },
  /*
    이 한 쌍에서 **방향이 거꾸로인 유일한 기능**이다. 다른 것은 어드민이 넣고 사이트가 읽는데,
    창업 상담은 사이트가 넣고 어드민이 받는다. 그래도 자원은 하나라 기능도 하나로 둔다 —
    나누면 신청 폼의 항목과 문의 목록의 열이 따로 자라다가 어긋난다.

    action 이 `create` 가 아닌 이유: 경로 꼬리 규칙상 `create` 는 양쪽 다 `/new` 여야 하는데
    받는 쪽은 `/inquiries` 목록이다. 두 바인딩을 살리려면 목록 쪽 규칙을 따를 수밖에 없다.
  */
  {
    id: 'fnb.inquiry.list',
    label: { ko: '창업 상담', en: 'Franchise Inquiries' },
    entity: 'inquiry',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/franchise/apply',
        component: 'InquiryListPage',
        status: 'implemented',
        note: '손님이 남기는 쪽이다 — 여기서 넣은 것이 어드민의 문의 내역에 그대로 선다',
      },
      'fnb-admin': {
        route: '/inquiries',
        component: 'FnbInquiryListPage',
        status: 'implemented',
        note: '받는 쪽이라 `/new` 가 없다 — 본사가 대신 적을 자리가 아니다',
      },
    },
  },
  {
    id: 'fnb.inquiry.detail',
    label: { ko: '창업 상담 상세', en: 'Inquiry Detail' },
    entity: 'inquiry',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/inquiries/[inquiryId]',
        component: 'FnbInquiryDetailPage',
        status: 'implemented',
        note: '상담 진행 상태를 여기서 옮긴다',
      },
    },
    // 사이트에는 로그인이 없다 — 손님이 자기 신청을 다시 열어 볼 자리가 없다.
    singleViewByDesign: true,
  },
  /*
    FAQ 가 두 벌로 보이지만 자원은 하나다(`publicFnbFaqs()`). `audience` 로만 갈려
    창업 쪽과 손님 쪽이 각자 화면을 갖는다 — 그래서 엔티티는 둘 다 `faq` 이고, 어느 쪽인지는
    id 앞머리(`fnb.franchise.` · `fnb.support.`)가 남긴다.

    두 기능이 같은 컴포넌트명을 만들어 내는 것도 그 때문이다. 이름이 겹치는 것이 아니라
    **같은 화면을 audience 만 바꿔 그리는 것**이라, 엔티티를 억지로 나누면 사전에 자원이 두
    개 있는 것처럼 적히고 그쪽이 더 크게 어긋난다.
  */
  {
    id: 'fnb.franchise.faq.list',
    label: { ko: '가맹점 개설문의', en: 'Franchise FAQ' },
    entity: 'faq',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/franchise/faq',
        component: 'FaqListPage',
        status: 'implemented',
        note: "audience 가 '창업' 인 것만 나온다",
      },
      'fnb-admin': { route: '/franchise/faqs', component: 'FnbFaqListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.franchise.faq.detail',
    label: { ko: '가맹점 개설문의 상세', en: 'Franchise FAQ Detail' },
    entity: 'faq',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/franchise/faqs/[faqId]',
        component: 'FnbFaqDetailPage',
        status: 'implemented',
      },
    },
    // 사이트는 목록 화면에서 아코디언으로 펼친다 — 문답 하나를 여는 주소가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.franchise.faq.create',
    label: { ko: '가맹점 개설문의 등록', en: 'Franchise FAQ Create' },
    entity: 'faq',
    action: 'create',
    views: {
      'fnb-admin': { route: '/franchise/faqs/new', component: 'FnbFaqCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 고객센터 ────────────────────────────────────────────────────────
  {
    id: 'fnb.support.faq.list',
    label: { ko: '자주 묻는 질문', en: 'FAQ' },
    entity: 'faq',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/support/faq',
        component: 'FaqListPage',
        status: 'implemented',
        note: "audience 가 '손님' 인 것만 나온다 — 창업 쪽 문답과 같은 자원이다",
      },
      'fnb-admin': { route: '/support/faqs', component: 'FnbFaqListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.support.faq.detail',
    label: { ko: '자주 묻는 질문 상세', en: 'Support FAQ Detail' },
    entity: 'faq',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/support/faqs/[faqId]',
        component: 'FnbFaqDetailPage',
        status: 'implemented',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.support.faq.create',
    label: { ko: '자주 묻는 질문 등록', en: 'Support FAQ Create' },
    entity: 'faq',
    action: 'create',
    views: {
      'fnb-admin': { route: '/support/faqs/new', component: 'FnbFaqCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.notice.list',
    label: { ko: '공지사항', en: 'Notices' },
    entity: 'notice',
    action: 'list',
    views: {
      'fnb-client': {
        route: '/support/notices',
        component: 'NoticeListPage',
        status: 'implemented',
        note: '홈의 공지 띠도 같은 목록을 읽는다 — 고정한 것이 위로 온다',
      },
      'fnb-admin': { route: '/support/notices', component: 'FnbNoticeListPage', status: 'implemented' },
    },
  },
  {
    id: 'fnb.notice.detail',
    label: { ko: '공지사항 상세', en: 'Notice Detail' },
    entity: 'notice',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/support/notices/[noticeId]',
        component: 'FnbNoticeDetailPage',
        status: 'implemented',
        note: '수정도 이 화면에서 한다',
      },
    },
    // 사이트는 목록에서 펼쳐 읽는다 — 공지 하나를 여는 주소가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.notice.create',
    label: { ko: '공지사항 등록', en: 'Notice Create' },
    entity: 'notice',
    action: 'create',
    views: {
      'fnb-admin': { route: '/support/notices/new', component: 'FnbNoticeCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 배너 ────────────────────────────────────────────────────────────
  /*
    라우트에 `main` 이 들어 있다(`/banners/main`). B2C 에서는 site 의 금지어라 피했는데
    F&B 어드민은 이미 그 주소로 서 있다 — 검사기는 라우트를 용어로 보지 않아 통과한다.
    엔티티와 컴포넌트명은 규칙대로 `banner` 다. 주소를 옮기는 것은 매니페스트를 고치는 일이라
    이 파일에서 할 수 없다.
  */
  {
    id: 'fnb.banner.list',
    label: { ko: '메인 비주얼', en: 'Main Visuals' },
    entity: 'banner',
    action: 'list',
    views: {
      'fnb-admin': {
        route: '/banners/main',
        component: 'FnbBannerListPage',
        status: 'implemented',
        note: '사람이 켜고 끄는 것은 숨김 하나뿐이고 나머지는 날짜가 판정한다',
      },
    },
    // 사이트에는 배너 목록이 없다 — 걸린 것 중 맨 위 하나가 첫 화면 자리에 그대로 나온다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.banner.detail',
    label: { ko: '메인 비주얼 상세', en: 'Main Visual Detail' },
    entity: 'banner',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/banners/main/[bannerId]',
        component: 'FnbBannerDetailPage',
        status: 'implemented',
        note: '기간이 지나면 켜져 있어도 걸리지 않는다 — 노출 여부와 기간을 함께 본다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.banner.create',
    label: { ko: '메인 비주얼 등록', en: 'Main Visual Create' },
    entity: 'banner',
    action: 'create',
    views: {
      'fnb-admin': { route: '/banners/main/new', component: 'FnbBannerCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.popup.list',
    label: { ko: '팝업', en: 'Popups' },
    entity: 'popup',
    action: 'list',
    views: {
      'fnb-admin': {
        route: '/banners/popups',
        component: 'FnbPopupListPage',
        status: 'implemented',
        note: '걸린 것이 여럿이어도 사이트는 하나만 띄운다 — 앞의 것을 닫아야 다음이 뜬다',
      },
    },
    // 팝업은 사이트의 화면이 아니라 모든 화면을 덮는 것이라 목록이 설 주소가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.popup.detail',
    label: { ko: '팝업 상세', en: 'Popup Detail' },
    entity: 'popup',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/banners/popups/[popupId]',
        component: 'FnbPopupDetailPage',
        status: 'implemented',
        note: "`오늘 하루 보지 않기` 는 그 사람의 브라우저에만 남아 여기서 볼 수 없다",
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.popup.create',
    label: { ko: '팝업 등록', en: 'Popup Create' },
    entity: 'popup',
    action: 'create',
    views: {
      'fnb-admin': { route: '/banners/popups/new', component: 'FnbPopupCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 설정 ────────────────────────────────────────────────────────────
  // 라우트는 /settings/admins 지만 엔티티는 staff 다 — 'admin' 은 뷰 접두어(FnbXxxPage 의 짝)와
  // 겹쳐 엔티티명으로 쓰지 않는다는 규칙이 glossary.ts 에 있다.
  {
    id: 'fnb.staff.list',
    label: { ko: '관리자', en: 'Admins' },
    entity: 'staff',
    action: 'list',
    views: {
      'fnb-admin': { route: '/settings/admins', component: 'FnbStaffListPage', status: 'implemented' },
    },
    // 콘솔에 들어오는 사람의 목록이다 — 사이트에 나갈 값이 아니다.
    singleViewByDesign: true,
  },
  {
    id: 'fnb.staff.detail',
    label: { ko: '관리자 상세', en: 'Admin Detail' },
    entity: 'staff',
    action: 'detail',
    views: {
      'fnb-admin': {
        route: '/settings/admins/[adminId]',
        component: 'FnbStaffDetailPage',
        status: 'implemented',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.staff.create',
    label: { ko: '관리자 등록', en: 'Admin Create' },
    entity: 'staff',
    action: 'create',
    views: {
      'fnb-admin': { route: '/settings/admins/new', component: 'FnbStaffCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 법적 고지 ────────────────────────────────────────────────────────
  /*
    이 둘만 사이트에 있고 어드민에 없다. B2C 에서는 `/settings/terms` 로 고치는데 F&B 는
    아직 원고가 없어 화면을 만들지 않았다(`admin-mapping.md` 의 `아직 이어지지 않은 것`).
    원고가 들어오는 날 어드민 쪽 바인딩을 붙이고 이 표시를 뗀다.
  */
  {
    id: 'fnb.terms.settings',
    label: { ko: '이용약관', en: 'Terms' },
    entity: 'terms',
    action: 'settings',
    views: {
      'fnb-client': { route: '/terms', component: 'TermsSettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'fnb.privacy.settings',
    label: { ko: '개인정보 처리방침', en: 'Privacy' },
    entity: 'privacy',
    action: 'settings',
    views: {
      'fnb-client': { route: '/privacy', component: 'PrivacySettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
];
