import type { FeatureSpec } from './types';

/**
 * IR 한 쌍의 기능 — 회사 홈페이지(`ir-client`)와 그 운영 콘솔(`ir-admin`).
 *
 * ## 왜 파일을 나눴나
 * `features.ts` 하나에 네 제품을 다 담으면 천 줄이 이천 줄이 되고, 그때부터 **B2C 기능을
 * 고치러 온 사람이 IR 기능 사이를 지나간다.** 제품별로 나눠 두면 고칠 자리가 파일 이름으로
 * 정해진다. 합치는 일은 `features.ts` 가 한 줄로 한다.
 *
 * ## 이 한 쌍의 특징이 검사에 드러난다
 * 사이트에만 있고 콘솔에 없는 기능이 많다 — 공시 · 재무 · 주주 · 자료가 그렇다. 그것은
 * `누락`이 아니라 **고칠 자리가 없는 값**이라는 뜻이고, 이 한 쌍의 가장 큰 사실이다.
 * 그래서 그런 기능에는 `singleViewByDesign` 을 붙이되 `note` 에 왜인지를 반드시 적는다 —
 * 붙이기만 하고 이유를 안 적으면 경고만 사라지고 사실은 묻힌다.
 *
 * ## id 앞에 `ir.` 을 붙인다
 * `notice.list` · `product.list` 같은 이름은 B2C 가 이미 쓰고 있다. Feature ID 는 전 제품에서
 * 하나뿐이어야 하므로 도메인 한 마디를 앞에 세워 **어느 제품의 공지인지**를 id 에 남긴다.
 * 엔티티는 그대로 `notice` 다 — 자원의 이름까지 갈라 두면 사전이 두 벌이 된다.
 */
export const IR_FEATURES: readonly FeatureSpec[] = [
  // ── 진입 ────────────────────────────────────────────────────────────
  {
    id: 'ir.site.home',
    label: { ko: '홈', en: 'Home' },
    entity: 'site',
    action: 'home',
    views: {
      'ir-client': {
        route: '/',
        component: 'SiteHomePage',
        status: 'implemented',
        note: '처음 온 사람이 무슨 회사인지 알아보는 자리다 — 공시·시세 요약을 두지 않는다',
      },
    },
    // 콘솔은 로그인 뒤 곧장 대시보드로 들어간다. 소개 화면이 설 자리가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.site.dashboard',
    label: { ko: '대시보드', en: 'Dashboard' },
    entity: 'site',
    action: 'dashboard',
    views: {
      'ir-admin': { route: '/', component: 'IrSiteDashboardPage', status: 'implemented' },
    },
    // 사이트의 `/` 는 회사 소개다 — 같은 주소지만 다른 자원이라 한 기능으로 묶지 않는다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.status.result',
    label: { ko: '처리 결과', en: 'Result' },
    entity: 'status',
    action: 'result',
    views: {
      'ir-admin': {
        route: '/result',
        component: 'IrStatusResultPage',
        status: 'implemented',
        note: '완료·실패가 한 화면이다 — `?state=` 로 갈린다',
      },
    },
    // 사이트에는 저장·삭제가 없다. 결과를 알릴 일 자체가 없어 화면을 두지 않는다.
    singleViewByDesign: true,
  },

  // ── 회사 ────────────────────────────────────────────────────────────
  {
    id: 'ir.profile.settings',
    label: { ko: '회사 소개', en: 'Company profile' },
    entity: 'profile',
    action: 'settings',
    views: {
      'ir-client': {
        route: '/about',
        component: 'ProfileSettingsPage',
        status: 'implemented',
        note: '표에 서는 값은 `IR_COMPANY` 다 — 콘솔의 소개 원고(`SITE_INTRO`)와 다른 값이라 여기서 고쳐지지 않는다',
      },
      'ir-admin': { route: '/company/about', component: 'IrProfileSettingsPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.milestone.list',
    label: { ko: '연혁', en: 'Milestones' },
    entity: 'milestone',
    action: 'list',
    views: {
      'ir-client': { route: '/about/history', component: 'MilestoneListPage', status: 'implemented' },
      'ir-admin': { route: '/company/history', component: 'IrMilestoneListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.milestone.create',
    label: { ko: '연혁 등록', en: 'Milestone Create' },
    entity: 'milestone',
    action: 'create',
    views: {
      'ir-admin': { route: '/company/history/new', component: 'IrMilestoneCreatePage', status: 'implemented' },
    },
    // 사이트는 읽기만 한다 — 투자자가 연혁을 올리는 자리는 없다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.milestone.detail',
    label: { ko: '연혁 상세', en: 'Milestone Detail' },
    entity: 'milestone',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/company/history/[milestoneId]',
        component: 'IrMilestoneDetailPage',
        status: 'implemented',
        note: '수정도 이 화면에서 한다',
      },
    },
    // 사이트의 연혁은 한 줄을 따로 여는 화면이 없다 — 목록에서 다 읽힌다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.credential.list',
    label: { ko: '특허 및 인증', en: 'Credentials' },
    entity: 'credential',
    action: 'list',
    views: {
      'ir-client': {
        route: '/about/certifications',
        component: 'CredentialListPage',
        status: 'implemented',
        note: '숨긴 것은 `publicCredentials()` 가 거른다 — 사이트가 다시 판단하지 않는다',
      },
      'ir-admin': { route: '/company/credentials', component: 'IrCredentialListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.credential.create',
    label: { ko: '특허·인증 등록', en: 'Credential Create' },
    entity: 'credential',
    action: 'create',
    views: {
      'ir-admin': {
        route: '/company/credentials/new',
        component: 'IrCredentialCreatePage',
        status: 'implemented',
        note: '등록번호가 필수다 — 없으면 밖에서 확인할 방법이 없어 적어 둔 뜻이 없다',
      },
    },
    singleViewByDesign: true,
  },
  {
    /*
      한 기능의 두 바인딩이다. **하는 일이 다르지만 보는 자원이 같다** — 콘솔은 고치고 사이트는
      읽는다. 따로 등록하면 같은 특허가 두 이름을 갖고, 이 레지스트리를 두는 뜻이 사라진다.

      사이트 쪽 상세를 만든 까닭은 목록에 값이 모자라서가 아니라 **주소가 필요해서**다. 특허
      하나를 제안서나 메일에 걸 자리가 없어, 홈페이지 목록의 몇 번째 줄이라고 적게 된다.
    */
    id: 'ir.credential.detail',
    label: { ko: '특허·인증 상세', en: 'Credential Detail' },
    entity: 'credential',
    action: 'detail',
    views: {
      'ir-client': {
        route: '/about/certifications/[credentialId]',
        component: 'CredentialDetailPage',
        status: 'implemented',
        note: '읽기만 한다. 내려 둔 것은 주소로도 안 열린다 — 공시와 같은 규칙',
      },
      'ir-admin': {
        route: '/company/credentials/[credentialId]',
        component: 'IrCredentialDetailPage',
        status: 'implemented',
      },
    },
  },

  // ── 파는 것 ─────────────────────────────────────────────────────────
  {
    id: 'ir.product.list',
    label: { ko: '제품', en: 'Products' },
    entity: 'product',
    action: 'list',
    views: {
      'ir-client': {
        route: '/products',
        component: 'ProductListPage',
        status: 'implemented',
        note: '클라우드 넷과 서비스 둘을 한 화면에 묶어 세운다 — 콘솔에서는 제품 목록과 서비스 목록 두 자리로 갈린다',
      },
      'ir-admin': { route: '/products', component: 'IrProductListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.product.detail',
    label: { ko: '제품 상세', en: 'Product Detail' },
    entity: 'product',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/products/[productId]',
        component: 'IrProductDetailPage',
        status: 'implemented',
        note: '클라우드 넷을 이 한 화면으로 다 고친다 — 사이트 쪽은 넷이 각각 고정 주소를 갖는다',
      },
    },
    // 사이트의 짝은 `/solutions/mes` 처럼 넷으로 흩어져 있어 한 바인딩에 담기지 않는다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.product.settings',
    label: { ko: '제품 설정', en: 'Product Settings' },
    entity: 'product',
    action: 'settings',
    views: {
      'ir-admin': {
        route: '/products/settings',
        component: 'IrProductSettingsPage',
        status: 'implemented',
        note: '내려 둔 제품은 `publicSolutions()` 가 걸러 사이트에 나가지 않는다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.service.list',
    label: { ko: '서비스', en: 'Services' },
    entity: 'service',
    action: 'list',
    views: {
      'ir-admin': { route: '/services', component: 'IrServiceListPage', status: 'implemented' },
    },
    // 사이트는 제품과 서비스를 `/products` 한 화면에 함께 세운다 — 그쪽은 `ir.product.list` 가 갖는다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.service.detail',
    label: { ko: '서비스 상세', en: 'Service Detail' },
    entity: 'service',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/services/[serviceId]',
        component: 'IrServiceDetailPage',
        status: 'implemented',
        note: '컨설팅과 인프라 둘을 이 한 화면으로 고친다 — 사이트 쪽은 둘이 각각 고정 주소를 갖는다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.service.settings',
    label: { ko: '서비스 설정', en: 'Service Settings' },
    entity: 'service',
    action: 'settings',
    views: {
      'ir-admin': { route: '/services/settings', component: 'IrServiceSettingsPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  /*
    콘솔의 `문제 · 해법` 갈래.

    제품 갈래와 **같은 값을 본다.** 그런데도 여기 따로 서는 이유는 화면이 실제로 셋 있고
    주소로 열리기 때문이다(사이드바에는 없다). 없는 척하면 이 세 화면이 매니페스트에서만
    떠돌고, 왜 두 이름인지가 아무 데도 남지 않는다 —
    사연은 `apps/ir-admin/lib/navigation/ir-menu.ts` 머리말에 있다.
  */
  {
    id: 'ir.solution.list',
    label: { ko: '문제 · 해법', en: 'Problem & Approach' },
    entity: 'solution',
    action: 'list',
    views: {
      'ir-admin': {
        route: '/solutions',
        component: 'IrSolutionListPage',
        status: 'implemented',
        note: '사이드바에 없다 — 주소를 직접 쳐야 열린다. `/products` 와 같은 값을 본다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.solution.detail',
    label: { ko: '문제 · 해법 상세', en: 'Problem & Approach Detail' },
    entity: 'solution',
    action: 'detail',
    views: {
      'ir-admin': { route: '/solutions/[solutionId]', component: 'IrSolutionDetailPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.solution.settings',
    label: { ko: '홈 무대 차례', en: 'Home Stage Order' },
    entity: 'solution',
    action: 'settings',
    views: {
      'ir-admin': {
        route: '/solutions/settings',
        component: 'IrSolutionSettingsPage',
        status: 'implemented',
        note: '사이트 홈에서 어느 것이 먼저 서는지를 정한다',
      },
    },
    singleViewByDesign: true,
  },
  /*
    파는 것 여섯의 소개 화면.

    콘솔은 `/products/[productId]` · `/services/[serviceId]` 두 화면으로 여섯을 다 고치는데,
    사이트는 여섯이 각각 **고정 주소**를 갖는다(메뉴에서 바로 열리고 검색에도 그 주소로 걸려야
    한다). 그래서 한 기능에 묶이지 않고 여섯 줄로 선다.

    동작을 `detail` 로 두지 못한다 — `detail` 의 경로 꼬리는 `/[xxxId]` 여야 하는데 이쪽은
    정적 주소다. `home`(소개·진입 화면)을 쓰는 것이 뜻에도 맞는다: 이 여섯은 자원 하나를
    펼쳐 보는 자리가 아니라 **그 제품을 처음 읽는 자리**다.
  */
  {
    id: 'ir.consulting.home',
    label: { ko: '스마트 컨설팅', en: 'Smart Consulting' },
    entity: 'consulting',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/consulting',
        component: 'ConsultingHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 서비스 상세다 — 여섯이 `OfferingDetail` 하나를 함께 쓴다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.infra.home',
    label: { ko: '인프라 서비스', en: 'Infra Service' },
    entity: 'infra',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/infra',
        component: 'InfraHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 서비스 상세다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.mes.home',
    label: { ko: 'Cloud MES', en: 'Cloud MES' },
    entity: 'mes',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/mes',
        component: 'MesHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 제품 상세다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.erp.home',
    label: { ko: 'Cloud ERP', en: 'Cloud ERP' },
    entity: 'erp',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/erp',
        component: 'ErpHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 제품 상세다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.crm.home',
    label: { ko: 'Cloud CRM', en: 'Cloud CRM' },
    entity: 'crm',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/crm',
        component: 'CrmHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 제품 상세다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.dxp.home',
    label: { ko: 'Cloud DXP', en: 'Cloud DXP' },
    entity: 'dxp',
    action: 'home',
    views: {
      'ir-client': {
        route: '/solutions/dxp',
        component: 'DxpHomePage',
        status: 'implemented',
        note: '고칠 자리는 콘솔의 제품 상세다',
      },
    },
    singleViewByDesign: true,
  },

  /*
    ── 투자자에게 나가는 값 ───────────────────────────────────────────

    아래 열하나가 이 한 쌍의 가장 큰 사실이다.

    **어드민 화면을 지웠다 — 사이트에 나가는데 저장소 어디에도 고치는 자리가 없다.**
    지운 것은 `/disclosures` · `/disclosures/dart` · `/financials` · `/financials/stock` ·
    `/financials/dividends` · `/shareholders/meetings` · `/shareholders/governance` ·
    `/library` · `/library/schedules` · `/library/notifications` 열 화면이고, 사이트의
    열한 화면은 `@winpilot/store` 의 `ir.ts` 를 직접 읽어 그대로 그려진다.

    사연은 `apps/ir-admin/lib/navigation/ir-menu.ts` 머리말과
    `apps/ir-client-a/docs/admin-mapping.md` §2 에 있다. 여기 `singleViewByDesign` 을 붙이는
    것은 **설계가 그렇다는 뜻이 아니라 지금 그렇다는 사실을 한 줄로 적어 두는 것**이다 —
    경고 하나로는 `왜` 가 남지 않아 다음 사람이 다시 처음부터 알아내야 한다.
  */
  /*
    주가는 `detail` 이 아니라 `list` 다. 화면이 보여 주는 것이 시세 한 줄과 항목 표라
    자원 하나를 펼치는 자리가 아니고, `detail` 의 경로 꼬리(`/[xxxId]`)와도 맞지 않는다.
  */
  /*
    전자투표는 `/meetings/voting` 이라 총회 목록의 꼬리로도, 상세로도 잡히지 않는다.
    표를 던지는 곳이 예탁결제원이므로 이 화면이 하는 일은 **어디로 가서 무엇을 준비하는지**를
    적는 것 하나뿐이다 — 그래서 자원을 `vote` 로 나누고 동작은 진입 화면(`home`)으로 둔다.
  */
  // 라우트는 /library 지만 엔티티는 document 다 — 'library' 는 동작 어휘라 자원 이름으로 겹쳐 쓰지 않는다.
  /*
    신청은 자원을 만드는 일이지만 `create` 를 쓰지 못한다 — 경로 꼬리가 `/new` 여야 하는데
    이쪽은 `/subscribe` 다. 가입이 `/users/new` 가 아니라 `/signup` 인 것과 같은 관습이라
    동작도 같은 것(`signup`)을 쓴다.
  */
  // ── 고객지원 ────────────────────────────────────────────────────────
  {
    id: 'ir.notice.list',
    label: { ko: '공지사항', en: 'Notices' },
    entity: 'notice',
    action: 'list',
    views: {
      'ir-client': {
        route: '/support/notices',
        component: 'NoticeListPage',
        status: 'implemented',
        note: '숨긴 것은 `publicSiteNotices()` 가 거르고 고정한 것이 위로 온다',
      },
      'ir-admin': { route: '/contents/notices', component: 'IrNoticeListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.notice.create',
    label: { ko: '공지사항 등록', en: 'Notice Create' },
    entity: 'notice',
    action: 'create',
    views: {
      'ir-admin': { route: '/contents/notices/new', component: 'IrNoticeCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.notice.detail',
    label: { ko: '공지사항 상세', en: 'Notice Detail' },
    entity: 'notice',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/contents/notices/[noticeId]',
        component: 'IrNoticeDetailPage',
        status: 'implemented',
        note: '수정도 이 화면에서 한다',
      },
    },
    // 사이트는 한 건만 여는 주소가 없다 — 목록 안에서 펼쳐 읽는다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.news.list',
    label: { ko: '뉴스', en: 'News' },
    entity: 'news',
    action: 'list',
    views: {
      'ir-client': { route: '/support/news', component: 'NewsListPage', status: 'implemented' },
      'ir-admin': { route: '/contents/news', component: 'IrNewsListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.news.create',
    label: { ko: '뉴스 등록', en: 'News Create' },
    entity: 'news',
    action: 'create',
    views: {
      'ir-admin': { route: '/contents/news/new', component: 'IrNewsCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.news.detail',
    label: { ko: '뉴스 상세', en: 'News Detail' },
    entity: 'news',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/contents/news/[newsId]',
        component: 'IrNewsDetailPage',
        status: 'implemented',
        note: '본문은 싣지 않고 원문 링크만 관리한다',
      },
    },
    // 사이트의 뉴스는 원문으로 나간다 — 이 사이트 안에 상세 화면이 설 자리가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.faq.list',
    label: { ko: 'FAQ', en: 'FAQ' },
    entity: 'faq',
    action: 'list',
    views: {
      'ir-client': { route: '/support/faq', component: 'FaqListPage', status: 'implemented' },
      'ir-admin': { route: '/contents/faqs', component: 'IrFaqListPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.faq.create',
    label: { ko: 'FAQ 등록', en: 'FAQ Create' },
    entity: 'faq',
    action: 'create',
    views: {
      'ir-admin': { route: '/contents/faqs/new', component: 'IrFaqCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.faq.detail',
    label: { ko: 'FAQ 상세', en: 'FAQ Detail' },
    entity: 'faq',
    action: 'detail',
    views: {
      'ir-admin': { route: '/contents/faqs/[faqId]', component: 'IrFaqDetailPage', status: 'implemented' },
    },
    // 사이트는 문답을 목록에서 접었다 펴는 것으로 읽는다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.direction.list',
    label: { ko: '오시는 길', en: 'Directions' },
    entity: 'direction',
    action: 'list',
    views: {
      'ir-client': {
        route: '/support/directions',
        component: 'DirectionListPage',
        status: 'implemented',
        note: '값(`DIRECTIONS`)을 고치는 콘솔 화면이 처음부터 없다 — 지운 것이 아니라 안 만든 자리다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 문의 ────────────────────────────────────────────────────────────
  {
    id: 'ir.inquiry.settings',
    label: { ko: '문의하기', en: 'Contact' },
    entity: 'inquiry',
    action: 'settings',
    views: {
      'ir-client': {
        route: '/support/contact',
        component: 'InquirySettingsPage',
        status: 'implemented',
        note: '콘솔이 정한 유형·지역(`SITE_INQUIRY_KINDS` · `SITE_REGIONS`)대로 폼을 그린다',
      },
      'ir-admin': {
        route: '/inquiries/settings',
        component: 'IrInquirySettingsPage',
        status: 'implemented',
        note: '사이트 문의 폼의 유형과 수집 항목을 정한다 — 여기서 지운 유형은 사이트에서 고를 수 없게 된다',
      },
    },
  },
  {
    id: 'ir.inquiry.list',
    label: { ko: '문의', en: 'Inquiries' },
    entity: 'inquiry',
    action: 'list',
    views: {
      'ir-admin': { route: '/inquiries', component: 'IrInquiryListPage', status: 'implemented' },
    },
    // 이 사이트에는 로그인이 없다 — 보낸 사람이 자기 문의를 다시 여는 자리가 없다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.inquiry.detail',
    label: { ko: '문의 상세', en: 'Inquiry Detail' },
    entity: 'inquiry',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/inquiries/[inquiryId]',
        component: 'IrInquiryDetailPage',
        status: 'implemented',
        note: '답변은 메일로 나간다 — 사이트에 답이 붙는 자리가 없다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 배너 ────────────────────────────────────────────────────────────
  {
    id: 'ir.banner.list',
    label: { ko: '메인 비주얼', en: 'Hero Banners' },
    entity: 'banner',
    action: 'list',
    views: {
      'ir-admin': {
        route: '/banners',
        component: 'IrBannerListPage',
        status: 'implemented',
        note: '아직 사이트와 안 이어져 있다 — 사이트 첫 화면은 `HERO_SLIDES` 를 그린다(admin-mapping.md §5)',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.banner.create',
    label: { ko: '배너 등록', en: 'Banner Create' },
    entity: 'banner',
    action: 'create',
    views: {
      'ir-admin': { route: '/banners/new', component: 'IrBannerCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.banner.detail',
    label: { ko: '배너 상세', en: 'Banner Detail' },
    entity: 'banner',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/banners/[bannerId]',
        component: 'IrBannerDetailPage',
        status: 'implemented',
        note: '노출 여부와 기간을 함께 본다 — 켜져 있어도 기간이 지나면 나가지 않는다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.popup.list',
    label: { ko: '팝업', en: 'Popups' },
    entity: 'popup',
    action: 'list',
    views: {
      'ir-admin': {
        route: '/banners/popups',
        component: 'IrPopupListPage',
        status: 'implemented',
        note: '사이트 모든 화면에 걸린다 — `liveSitePopups()` 가 기간과 숨김으로 거른다',
      },
    },
    // 팝업은 사이트의 어느 화면에도 자기 주소가 없다 — 다른 화면 위에 겹쳐 뜬다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.popup.create',
    label: { ko: '팝업 등록', en: 'Popup Create' },
    entity: 'popup',
    action: 'create',
    views: {
      'ir-admin': { route: '/banners/popups/new', component: 'IrPopupCreatePage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.popup.detail',
    label: { ko: '팝업 상세', en: 'Popup Detail' },
    entity: 'popup',
    action: 'detail',
    views: {
      'ir-admin': {
        route: '/banners/popups/[popupId]',
        component: 'IrPopupDetailPage',
        status: 'implemented',
        note: '본문이 필수다 — 제목만 뜬 팝업은 무슨 일인지 안 알려 주는 상자가 된다',
      },
    },
    singleViewByDesign: true,
  },

  // ── 통계 ────────────────────────────────────────────────────────────
  // 라우트는 /statistics 지만 엔티티는 analytics 다 — 'stat' 계열은 용어 사전이 막는다.
  {
    id: 'ir.analytics.home',
    label: { ko: '통계 홈', en: 'Statistics' },
    entity: 'analytics',
    action: 'home',
    views: {
      'ir-admin': { route: '/statistics', component: 'IrAnalyticsHomePage', status: 'implemented' },
    },
    // 읽기만 하는 화면이라 사이트 쪽 짝이 없는 것이 정상이다.
    singleViewByDesign: true,
  },
  {
    id: 'ir.analytics.list',
    label: { ko: '기간별 분석', en: 'Period Analysis' },
    entity: 'analytics',
    action: 'list',
    views: {
      'ir-admin': { route: '/statistics/period', component: 'IrAnalyticsListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.pageview.list',
    label: { ko: '많이 방문한 페이지', en: 'Page Visits' },
    entity: 'pageview',
    action: 'list',
    views: {
      'ir-admin': { route: '/statistics/pages', component: 'IrPageviewListPage', status: 'implemented' },
    },
    singleViewByDesign: true,
  },

  // ── 설정 ────────────────────────────────────────────────────────────
  {
    id: 'ir.supplier.settings',
    label: { ko: '공급자 정보', en: 'Supplier Info' },
    entity: 'supplier',
    action: 'settings',
    views: {
      'ir-admin': {
        route: '/settings/supplier',
        component: 'IrSupplierSettingsPage',
        status: 'implemented',
        note: '저장은 되는데 사이트로 나가지 않는다 — 사이트 푸터는 `IR_COMPANY` 를 그린다(admin-mapping.md §3)',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.seo.settings',
    label: { ko: 'SEO 정보', en: 'SEO' },
    entity: 'seo',
    action: 'settings',
    views: {
      'ir-admin': {
        route: '/settings/seo',
        component: 'IrSeoSettingsPage',
        status: 'implemented',
        note: '저장은 되는데 사이트로 나가지 않는다 — 화면마다 자기 metadata 를 들고 있다',
      },
    },
    singleViewByDesign: true,
  },
  {
    id: 'ir.locale.settings',
    label: { ko: '국문 · 영문', en: 'Locales' },
    entity: 'locale',
    action: 'settings',
    views: {
      'ir-admin': {
        route: '/settings/locales',
        component: 'IrLocaleSettingsPage',
        status: 'implemented',
        note: '아직 사이트에 영문 주소가 없다 — 짝만 쌓이고 나가는 자리는 없다',
      },
    },
    singleViewByDesign: true,
  },
  /*
    약관과 처리방침은 **두 벌이다.** 사이트의 `/terms` · `/privacy` 는 화면이 들고 있는 글을
    그리고 콘솔은 따로 원고(`LEGAL_DOCS`)를 갖는다(admin-mapping.md §3). 그래도 한 기능으로
    묶는 이유가 여기 있다 — 두 자리를 따로 등록하면 두 벌이라는 사실이 어디에도 안 남고,
    개정하는 사람이 한쪽만 고치고 끝낸다.
  */
  {
    id: 'ir.terms.settings',
    label: { ko: '서비스 이용약관', en: 'Terms' },
    entity: 'terms',
    action: 'settings',
    views: {
      'ir-client': {
        route: '/terms',
        component: 'TermsSettingsPage',
        status: 'implemented',
        note: '화면이 글을 들고 있다 — 콘솔에서 고쳐도 여기가 바뀌지 않는다',
      },
      'ir-admin': { route: '/settings/terms', component: 'IrTermsSettingsPage', status: 'implemented' },
    },
  },
  {
    id: 'ir.privacy.settings',
    label: { ko: '개인정보 처리방침', en: 'Privacy Policy' },
    entity: 'privacy',
    action: 'settings',
    views: {
      'ir-client': {
        route: '/privacy',
        component: 'PrivacySettingsPage',
        status: 'implemented',
        note: '약관과 같다 — 콘솔의 원고와 두 벌이라 어느 쪽이 내건 것인지 화면으로는 알 수 없다',
      },
      'ir-admin': { route: '/settings/privacy', component: 'IrPrivacySettingsPage', status: 'implemented' },
    },
  },
];
