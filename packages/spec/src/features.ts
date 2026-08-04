import type { FeatureSpec } from './types';

/**
 * 기능 레지스트리 — 명명 싱크의 SSOT.
 *
 * **레포가 갈라져도 이 파일은 공유한다.** 앱마다 각자 이름을 정하기 시작하면
 * 같은 기능이 뷰별로 다른 이름을 갖게 되고, 이 프로젝트가 막으려는 표류가 그대로 돌아온다.
 * 분리 후에는 `@winpilot/spec` 패키지로 배포되어 네 레포가 같은 버전을 의존한다.
 *
 * 새 기능은 여기 먼저 등록하고 구현한다 — 라우트·컴포넌트명·i18n 키·테스트 ID·
 * Figma 프레임명이 전부 여기서 파생되므로, 이 파일을 거치지 않은 이름은 `pnpm spec:check` 에서 걸린다.
 */
export const FEATURES: readonly FeatureSpec[] = [
  {
    id: 'site.home',
    label: { ko: '서비스 소개', en: 'Home' },
    entity: 'site',
    action: 'home',
    views: {
      'b2c-client': { route: '/', component: 'SiteHomePage', status: 'implemented' },
      // 어드민은 로그인 후 대시보드로 바로 진입하므로 소개 화면이 없다.
    },
    singleViewByDesign: true,
  },
  {
    id: 'site.library',
    label: { ko: '컴포넌트 갤러리', en: 'Component library' },
    entity: 'site',
    action: 'library',
    views: {
      'b2c-admin': { route: '/ssot/components', component: 'AdminSiteLibraryPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'site.dashboard',
    label: { ko: '대시보드', en: 'Dashboard' },
    entity: 'site',
    action: 'dashboard',
    views: {
      'b2c-admin': { route: '/', component: 'AdminSiteDashboardPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'user.auth',
    label: { ko: '로그인', en: 'Sign in' },
    entity: 'user',
    action: 'auth',
    views: {
      'b2c-client': { route: '/login', component: 'UserAuthPage', status: 'implemented' },
      'b2c-admin': {
        route: '/login',
        component: 'AdminUserAuthPage',
        status: 'implemented',
        note: '운영자 전용. 어드민의 다른 화면은 전부 인증이 필요하며 이 화면만 예외다.',
      },
    },
  },
  {
    id: 'user.signup',
    label: { ko: '회원가입', en: 'Sign up' },
    entity: 'user',
    action: 'signup',
    views: {
      'b2c-client': {
        route: '/signup',
        component: 'UserSignupPage',
        status: 'implemented',
        note: '어드민의 사용자 추가와 같은 자원이다 — 수집 항목이 어긋나면 두 쪽 데이터가 달라진다',
      },
    },
    // 어드민은 사용자 목록 안 모달에서 추가한다 — 별도 라우트가 없다.
    singleViewByDesign: true,
  },

  {
    id: 'user.settings',
    label: { ko: '내 정보 수정', en: 'Profile settings' },
    entity: 'user',
    action: 'settings',
    views: {
      'b2c-client': {
        route: '/mypage',
        component: 'UserSettingsPage',
        status: 'implemented',
        note: '어드민은 사용자 목록의 상세 모달에서 같은 항목을 고친다 — 수집 항목이 어긋나면 두 쪽이 달라진다',
      },
    },
    // 운영자 쪽은 별도 라우트가 없다(목록 안 모달).
    singleViewByDesign: true,
  },
  {
    id: 'coupon.list',
    label: { ko: '쿠폰함', en: 'Coupons' },
    entity: 'coupon',
    action: 'list',
    views: {
      'b2c-client': { route: '/mypage/coupons', component: 'CouponListPage', status: 'implemented' },
    },
    // 발급·회수 화면은 아직 없다. 생기면 여기에 b2c-admin 뷰가 붙는다.
    singleViewByDesign: true,
  },

  // ── 사용자 ──────────────────────────────────────────────────────────
  {
    id: 'user.list',
    label: { ko: '사용자', en: 'Users' },
    entity: 'user',
    action: 'list',
    views: { 'b2c-admin': { route: '/users', component: 'AdminUserListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'staff.list',
    label: { ko: '관리자', en: 'Staff' },
    entity: 'staff',
    action: 'list',
    views: { 'b2c-admin': { route: '/users/admins', component: 'AdminStaffListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'grade.list',
    label: { ko: '등급', en: 'Grades' },
    entity: 'grade',
    action: 'list',
    views: { 'b2c-admin': { route: '/users/grades', component: 'AdminGradeListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },

  // ── 상품 ────────────────────────────────────────────────────────────
  {
    id: 'category.list',
    label: { ko: '카테고리', en: 'Categories' },
    entity: 'category',
    action: 'list',
    views: {
      'b2c-admin': { route: '/products/categories', component: 'AdminCategoryListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'order.list',
    label: { ko: '주문', en: 'Orders' },
    entity: 'order',
    action: 'list',
    views: {
      'b2c-client': { route: '/orders', component: 'OrderListPage', status: 'implemented' },
      'b2c-admin': {
        route: '/products/sales',
        component: 'AdminOrderListPage',
        status: 'implemented',
        note: "메뉴 라벨은 '판매' 지만 자원은 고객의 주문과 같다 — 그래서 엔티티가 order 다.",
      },
    },
  },
  {
    id: 'order.detail',
    label: { ko: '주문 상세', en: 'Order detail' },
    entity: 'order',
    action: 'detail',
    views: {
      'b2c-client': { route: '/orders/[orderId]', component: 'OrderDetailPage', status: 'implemented' },
      'b2c-admin': {
        route: '/products/sales/[orderId]',
        component: 'AdminOrderDetailPage',
        status: 'implemented',
        note: '주문 내용은 수정하지 않는다 — 운송장 등록·결제 취소·교환만 처리',
      },
    },
  },

  {
    id: 'cart.list',
    label: { ko: '장바구니', en: 'Cart' },
    entity: 'cart',
    action: 'list',
    views: { 'b2c-client': { route: '/cart', component: 'CartListPage', status: 'implemented' } },
    // 장바구니는 고객이 담는 자리다 — 운영자가 남의 장바구니를 여는 화면은 두지 않는다.
    singleViewByDesign: true,
  },
  {
    id: 'alarm.list',
    label: { ko: '알람', en: 'Alarms' },
    entity: 'alarm',
    action: 'list',
    views: { 'b2c-client': { route: '/alarms', component: 'AlarmListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },

  // ── 콘텐츠 ──────────────────────────────────────────────────────────
  {
    id: 'notice.list',
    label: { ko: '공지사항', en: 'Notices' },
    entity: 'notice',
    action: 'list',
    views: {
      'b2c-client': { route: '/notices', component: 'NoticeListPage', status: 'implemented' },
      'b2c-admin': { route: '/contents/notices', component: 'AdminNoticeListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'notice.create',
    label: { ko: '공지사항 등록', en: 'Create notice' },
    entity: 'notice',
    action: 'create',
    views: {
      'b2c-admin': { route: '/contents/notices/new', component: 'AdminNoticeCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'notice.detail',
    label: { ko: '공지사항 상세', en: 'Notice detail' },
    entity: 'notice',
    action: 'detail',
    views: {
      'b2c-client': { route: '/notices/[noticeId]', component: 'NoticeDetailPage', status: 'implemented' },
      'b2c-admin': {
        route: '/contents/notices/[noticeId]',
        component: 'AdminNoticeDetailPage',
        status: 'implemented',
        note: '수정도 이 화면에서 한다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'faq.list',
    label: { ko: 'FAQ', en: 'FAQ' },
    entity: 'faq',
    action: 'list',
    views: {
      'b2c-client': { route: '/faqs', component: 'FaqListPage', status: 'implemented' },
      'b2c-admin': { route: '/contents/faqs', component: 'AdminFaqListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'faq.detail',
    label: { ko: 'FAQ 상세', en: 'FAQ detail' },
    entity: 'faq',
    action: 'detail',
    views: {
      'b2c-client': { route: '/faqs/[faqId]', component: 'FaqDetailPage', status: 'implemented' },
    },
    // 운영자는 목록 화면의 모달에서 문답을 고친다 — 한 문답만 놓고 볼 화면이 따로 필요하지 않다.
    singleViewByDesign: true,
  },
  {
    id: 'news.list',
    label: { ko: '뉴스', en: 'News' },
    entity: 'news',
    action: 'list',
    views: {
      'b2c-client': { route: '/news', component: 'NewsListPage', status: 'implemented' },
      'b2c-admin': { route: '/contents/news', component: 'AdminNewsListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'news.create',
    label: { ko: '뉴스 등록', en: 'Create news' },
    entity: 'news',
    action: 'create',
    views: {
      'b2c-admin': { route: '/contents/news/new', component: 'AdminNewsCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'news.detail',
    label: { ko: '뉴스 상세', en: 'News detail' },
    entity: 'news',
    action: 'detail',
    views: {
      'b2c-client': { route: '/news/[newsId]', component: 'NewsDetailPage', status: 'implemented' },
      'b2c-admin': {
        route: '/contents/news/[newsId]',
        component: 'AdminNewsDetailPage',
        status: 'implemented',
        note: '본문은 싣지 않고 원문 링크만 관리한다',
      },
    },
  },
  {
    id: 'portfolio.list',
    label: { ko: '포트폴리오', en: 'Portfolios' },
    entity: 'portfolio',
    action: 'list',
    views: {
      'b2c-client': { route: '/portfolios', component: 'PortfolioListPage', status: 'implemented' },
      'b2c-admin': { route: '/contents/portfolios', component: 'AdminPortfolioListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'portfolio.create',
    label: { ko: '포트폴리오 등록', en: 'Create portfolio' },
    entity: 'portfolio',
    action: 'create',
    views: {
      'b2c-admin': {
        route: '/contents/portfolios/new',
        component: 'AdminPortfolioCreatePage',
        status: 'implemented',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'portfolio.detail',
    label: { ko: '포트폴리오 상세', en: 'Portfolio detail' },
    entity: 'portfolio',
    action: 'detail',
    views: {
      'b2c-admin': {
        route: '/contents/portfolios/[portfolioId]',
        component: 'AdminPortfolioDetailPage',
        status: 'implemented',
        note: '이미지와 HTML 본문을 함께 관리한다',
      },
    },
    singleViewByDesign: true,
  },

  {
    id: 'inquiry.settings',
    label: { ko: '문의 폼 설정', en: 'Inquiry form settings' },
    entity: 'inquiry',
    action: 'settings',
    views: {
      'b2c-client': {
        route: '/contact',
        component: 'InquirySettingsPage',
        status: 'implemented',
        note: '어드민이 정한 폼 구성대로 그린다 — 목록의 Path 열이 이 경로다',
      },
      'b2c-admin': {
        route: '/inquiries/settings',
        component: 'AdminInquirySettingsPage',
        status: 'implemented',
        note: '고객 화면 문의 폼의 경로·유형·수집 항목을 정한다 — 목록의 Path 열이 여기서 나온다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 배너 ────────────────────────────────────────────────────────────
  // 라우트에 'main' 을 쓰지 않는다 — site 의 금지어라 검사기가 막는다 (glossary.ts).
  {
    id: 'banner.list',
    label: { ko: '메인 비주얼', en: 'Banners' },
    entity: 'banner',
    action: 'list',
    views: { 'b2c-admin': { route: '/banners', component: 'AdminBannerListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'banner.create',
    label: { ko: '배너 등록', en: 'Create banner' },
    entity: 'banner',
    action: 'create',
    views: { 'b2c-admin': { route: '/banners/new', component: 'AdminBannerCreatePage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'banner.detail',
    label: { ko: '배너 상세', en: 'Banner detail' },
    entity: 'banner',
    action: 'detail',
    views: {
      'b2c-admin': {
        route: '/banners/[bannerId]',
        component: 'AdminBannerDetailPage',
        status: 'implemented',
        note: '노출 여부와 기간을 함께 본다 — 켜져 있어도 기간이 지나면 노출되지 않는다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'popup.list',
    label: { ko: '팝업', en: 'Popups' },
    entity: 'popup',
    action: 'list',
    views: { 'b2c-admin': { route: '/banners/popups', component: 'AdminPopupListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'popup.create',
    label: { ko: '팝업 등록', en: 'Create popup' },
    entity: 'popup',
    action: 'create',
    views: {
      'b2c-admin': { route: '/banners/popups/new', component: 'AdminPopupCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'popup.detail',
    label: { ko: '팝업 상세', en: 'Popup detail' },
    entity: 'popup',
    action: 'detail',
    views: {
      'b2c-admin': {
        route: '/banners/popups/[popupId]',
        component: 'AdminPopupDetailPage',
        status: 'implemented',
        note: '위치·폭이 본문만큼 중요하다 — 고객 화면을 덮기 때문',
      },
    },
    singleViewByDesign: true,
  },

  // ── 회사 ────────────────────────────────────────────────────────────
  {
    id: 'profile.settings',
    label: { ko: '회사 소개', en: 'Company profile' },
    entity: 'profile',
    action: 'settings',
    views: {
      'b2c-client': { route: '/company', component: 'ProfileSettingsPage', status: 'implemented' },
      'b2c-admin': { route: '/company/about', component: 'AdminProfileSettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'milestone.list',
    label: { ko: '연혁', en: 'Milestones' },
    entity: 'milestone',
    action: 'list',
    views: {
      'b2c-client': { route: '/company/history', component: 'MilestoneListPage', status: 'implemented' },
      'b2c-admin': { route: '/company/history', component: 'AdminMilestoneListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 문의 ────────────────────────────────────────────────────────────
  {
    id: 'inquiry.list',
    label: { ko: '문의', en: 'Inquiries' },
    entity: 'inquiry',
    action: 'list',
    views: {
      'b2c-client': {
        route: '/mypage/inquiries',
        component: 'InquiryListPage',
        status: 'implemented',
        note: '어드민 목록과 같은 기록이다 — 운영자가 단 답변이 여기에 그대로 나타난다',
      },
      'b2c-admin': { route: '/inquiries', component: 'AdminInquiryListPage', status: 'implemented' },
    },
  },

  // ── 설정 ────────────────────────────────────────────────────────────
  {
    id: 'supplier.settings',
    label: { ko: '공급자 정보', en: 'Supplier settings' },
    entity: 'supplier',
    action: 'settings',
    views: {
      'b2c-admin': { route: '/settings/supplier', component: 'AdminSupplierSettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'seo.settings',
    label: { ko: 'SEO 정보', en: 'SEO settings' },
    entity: 'seo',
    action: 'settings',
    views: { 'b2c-admin': { route: '/settings/seo', component: 'AdminSeoSettingsPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'oauth.settings',
    label: { ko: 'OAuth 정보', en: 'OAuth settings' },
    entity: 'oauth',
    action: 'settings',
    views: {
      'internal-admin': {
        route: '/integrations/oauth',
        component: 'InternalOauthSettingsPage',
        status: 'implemented',
        note: '고객사가 직접 만지면 로그인이 멈춘다 — 사내 어드민으로 옮겼다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'payment.settings',
    label: { ko: 'PG 정보', en: 'Payment settings' },
    entity: 'payment',
    action: 'settings',
    views: {
      'internal-admin': {
        route: '/integrations/payment',
        component: 'InternalPaymentSettingsPage',
        status: 'implemented',
        note: '실결제 전환은 되돌리기 어렵다 — 사내 어드민으로 옮겼다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 상품 (고객 화면과 짝을 이루는 것) ────────────────────────────────
  {
    id: 'product.list',
    label: { ko: '상품 목록', en: 'Product list' },
    entity: 'product',
    action: 'list',
    views: {
      'b2c-client': { route: '/products', component: 'ProductListPage', status: 'implemented' },
      'b2c-admin': { route: '/products', component: 'AdminProductListPage', status: 'implemented' },
    },
  },
  {
    id: 'product.detail',
    label: { ko: '상품 상세', en: 'Product detail' },
    entity: 'product',
    action: 'detail',
    views: {
      'b2c-client': { route: '/products/[productId]', component: 'ProductDetailPage', status: 'implemented' },
      'b2c-admin': {
        route: '/products/[productId]',
        component: 'AdminProductDetailPage',
        status: 'implemented',
        note: '판매 중지 상품도 조회 가능 — 고객 화면은 노출 상태만 조회. 수정도 이 화면에서 한다.',
      },
    },
  },
  {
    id: 'product.create',
    label: { ko: '상품 등록', en: 'Create product' },
    entity: 'product',
    action: 'create',
    views: {
      'b2c-client': {
        route: '/products/new',
        component: 'ProductCreatePage',
        status: 'planned',
        note: '판매자 권한 보유 사용자만',
      },
      'b2c-admin': { route: '/products/new', component: 'AdminProductCreatePage', status: 'implemented' },
    },
  },
  {
    id: 'product.edit',
    label: { ko: '상품 수정', en: 'Edit product' },
    entity: 'product',
    action: 'edit',
    views: {
      'b2c-client': { route: '/products/[productId]/edit', component: 'ProductEditPage', status: 'planned' },
      'b2c-admin': { route: '/products/[productId]/edit', component: 'AdminProductEditPage', status: 'planned' },
    },
  },
  {
    id: 'terms.settings',
    label: { ko: '서비스 이용약관', en: 'Terms of service' },
    entity: 'terms',
    action: 'settings',
    views: {
      'b2c-client': { route: '/terms', component: 'TermsSettingsPage', status: 'implemented' },
      'b2c-admin': {
        route: '/settings/terms',
        component: 'AdminTermsSettingsPage',
        status: 'implemented',
        note: '개정 이력을 남긴다 — 어느 고객이 어느 버전에 동의했는지 증명해야 한다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'privacy.settings',
    label: { ko: '개인정보 처리방침', en: 'Privacy policy' },
    entity: 'privacy',
    action: 'settings',
    views: {
      'b2c-client': { route: '/privacy', component: 'PrivacySettingsPage', status: 'implemented' },
      'b2c-admin': { route: '/settings/privacy', component: 'AdminPrivacySettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 통계 ────────────────────────────────────────────────────────────
  // 라우트는 /statistics 지만 엔티티는 analytics 다 — 'stat' 계열은 용어 사전이 막는다.
  {
    id: 'analytics.home',
    label: { ko: '통계 홈', en: 'Analytics home' },
    entity: 'analytics',
    action: 'home',
    views: { 'b2c-admin': { route: '/statistics', component: 'AdminAnalyticsHomePage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'analytics.list',
    label: { ko: '기간별 분석', en: 'Period analysis' },
    entity: 'analytics',
    action: 'list',
    views: {
      'b2c-admin': { route: '/statistics/periods', component: 'AdminAnalyticsListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  // 이 둘은 analytics 의 상세가 아니라 각자 다른 것의 목록이다 —
  // 'detail' 은 단일 자원 경로(/[xxxId])에만 쓸 수 있어 엔티티를 뜻에 맞게 나눴다.
  {
    id: 'pageview.list',
    label: { ko: '많이 방문한 페이지', en: 'Top pages' },
    entity: 'pageview',
    action: 'list',
    views: {
      'b2c-admin': { route: '/statistics/pages', component: 'AdminPageviewListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'revenue.list',
    label: { ko: '매출 통계', en: 'Revenue analytics' },
    entity: 'revenue',
    action: 'list',
    views: {
      'b2c-admin': { route: '/statistics/revenue', component: 'AdminRevenueListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 사내 어드민 (고객사 관리) ────────────────────────────────────────
  {
    id: 'tenant.dashboard',
    label: { ko: '사내 대시보드', en: 'Internal dashboard' },
    entity: 'tenant',
    action: 'dashboard',
    views: { 'internal-admin': { route: '/', component: 'InternalTenantDashboardPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'tenant.list',
    label: { ko: '고객사 목록', en: 'Tenants' },
    entity: 'tenant',
    action: 'list',
    views: { 'internal-admin': { route: '/tenants', component: 'InternalTenantListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
  {
    id: 'tenant.detail',
    label: { ko: '고객사 상세', en: 'Tenant detail' },
    entity: 'tenant',
    action: 'detail',
    views: {
      'internal-admin': {
        route: '/tenants/[tenantId]',
        component: 'InternalTenantDetailPage',
        status: 'implemented',
        note: '배포·계정·도메인과 구매 내역을 한 화면에서 본다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'invoice.list',
    label: { ko: '구매 · 유지보수', en: 'Invoices' },
    entity: 'invoice',
    action: 'list',
    views: { 'internal-admin': { route: '/invoices', component: 'InternalInvoiceListPage', status: 'implemented' } },
    singleViewByDesign: true,
  },
];
