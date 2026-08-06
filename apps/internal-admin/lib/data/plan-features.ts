/**
 * 플랜이 **무엇을 포함하는가** — 도메인별 기능 카탈로그.
 *
 * ## 권한과 다른 것이다
 * 헷갈리기 쉬워 먼저 갈라 둔다.
 *
 * | | 묻는 것 | 정하는 사람 |
 * |---|---|---|
 * | **기능** (이 파일) | 이 플랜에 이 화면이 들어오는가 | 우리 (계약) |
 * | **권한** (`@winpilot/store` 의 `CONSOLE_ROLES`) | 고객사 **직원 한 명**이 그 화면에서 무엇을 하는가 | 고객사 |
 *
 * 기능이 꺼져 있으면 권한을 켜도 화면이 없다. 반대로 기능이 켜져 있어도 권한이 없으면 그
 * 직원에게만 안 보인다. 두 축이라 한 표에 담을 수 없다.
 *
 * ## 어드민과 웹페이지를 갈라 적는 이유
 * 같은 자원이라도 **양쪽이 함께 열리지 않는다.** 쿠폰은 스탠다드부터 어드민에서 만들 수
 * 있는데, 고객 화면의 쿠폰함도 같은 플랜에서 열린다 — 이건 짝이 맞는 경우다. 반면 통계는
 * 어드민에만 있고 고객 화면에는 짝이 없다. 한 줄에 뭉뚱그리면 "고객이 뭘 볼 수 있는가" 를
 * 계약 자리에서 답하지 못한다.
 *
 * ## 기능 이름은 레지스트리에서 왔다
 * `packages/spec/src/features.ts` 에 등록된 실제 화면을 묶어 적었다. 여기에만 있는 기능을
 * 팔면 계약서에 적힌 것이 제품에 없는 일이 생긴다.
 */

export type PlanDomain = 'B2C' | 'B2B' | 'IR';

export const PLAN_DOMAINS: readonly PlanDomain[] = ['B2C', 'B2B', 'IR'] as const;

export const DOMAIN_NOTE: Record<PlanDomain, string> = {
  B2C: '일반 소비자에게 파는 쇼핑몰입니다. 상품·주문·회원이 중심입니다.',
  B2B: '사업자 간 거래입니다. 견적·여신·거래처 단가가 중심입니다.',
  IR: '투자자 대상 공시 사이트입니다. 공시·재무·주가 정보가 중심입니다.',
};

/** 기능이 어느 쪽 화면에 나타나는가 */
export type FeatureSurface = '어드민' | '웹페이지';

export type PlanFeature = {
  id: string;
  label: string;
  surface: FeatureSurface;
  /** 갈래 — 표에서 묶어 보여 준다 */
  group: string;
  /**
   * 이 기능이 열리는 **최소 플랜 id**.
   * 위 등급은 전부 켜진다 — 등급마다 목록을 따로 적으면 한 등급만 고쳐지는 날이 온다.
   */
  from: string;
  /** 한 줄 설명. 계약 자리에서 그대로 읽는 말이라 기능 이름만으로 부족하다 */
  note: string;
};

/* ── B2C ─────────────────────────────────────────────────────────────
   레지스트리(`packages/spec/src/features.ts`)의 b2c-admin 43화면 · b2c-client 26화면을
   운영자가 부르는 단위로 묶은 것이다. 화면 하나가 곧 기능 하나는 아니다 —
   `notice.list` · `notice.create` · `notice.detail` 셋은 운영자에게 '공지사항' 하나다. */

const B2C_ADMIN: PlanFeature[] = [
  {
    id: 'b2c-a-product',
    label: '상품 관리',
    surface: '어드민',
    group: '판매',
    from: 'P-BASIC',
    note: '상품·옵션·재고를 만들고 고칩니다.',
  },
  {
    id: 'b2c-a-category',
    label: '카테고리',
    surface: '어드민',
    group: '판매',
    from: 'P-BASIC',
    note: '상품을 묶는 2단 분류를 관리합니다.',
  },
  {
    id: 'b2c-a-order',
    label: '주문 관리',
    surface: '어드민',
    group: '판매',
    from: 'P-BASIC',
    note: '주문을 확인하고 송장을 넣습니다. 교환 접수도 여기서 합니다.',
  },
  {
    id: 'b2c-a-review',
    label: '리뷰 관리',
    surface: '어드민',
    group: '판매',
    from: 'P-BASIC',
    note: '고객이 남긴 리뷰를 보고 노출을 정합니다.',
  },
  {
    id: 'b2c-a-member',
    label: '회원 관리',
    surface: '어드민',
    group: '고객',
    from: 'P-BASIC',
    note: '가입한 회원을 확인하고 상태를 바꿉니다.',
  },
  {
    id: 'b2c-a-grade',
    label: '회원 등급',
    surface: '어드민',
    group: '고객',
    from: 'P-STANDARD',
    note: '누적 결제금액으로 등급을 나누고 할인율을 겁니다.',
  },
  {
    id: 'b2c-a-coupon',
    label: '쿠폰 발행',
    surface: '어드민',
    group: '고객',
    from: 'P-STANDARD',
    note: '정률·정액 쿠폰을 만들고 발급 대상을 정합니다.',
  },
  {
    id: 'b2c-a-inquiry',
    label: '문의 관리',
    surface: '어드민',
    group: '고객',
    from: 'P-BASIC',
    note: '고객 문의에 답하고 문의 폼 항목을 정합니다.',
  },
  {
    id: 'b2c-a-notice',
    label: '공지 · FAQ',
    surface: '어드민',
    group: '콘텐츠',
    from: 'P-BASIC',
    note: '공지사항과 자주 묻는 질문을 씁니다.',
  },
  {
    id: 'b2c-a-story',
    label: '뉴스 · 포트폴리오',
    surface: '어드민',
    group: '콘텐츠',
    from: 'P-STANDARD',
    note: '언론 보도와 사례를 올립니다.',
  },
  {
    id: 'b2c-a-company',
    label: '회사 소개 · 연혁',
    surface: '어드민',
    group: '콘텐츠',
    from: 'P-BASIC',
    note: '회사 정보와 연혁을 고칩니다.',
  },
  {
    id: 'b2c-a-banner',
    label: '배너 · 팝업',
    surface: '어드민',
    group: '마케팅',
    from: 'P-STANDARD',
    note: '메인 비주얼과 팝업을 기간을 정해 겁니다.',
  },
  {
    id: 'b2c-a-seo',
    label: 'SEO 설정',
    surface: '어드민',
    group: '마케팅',
    from: 'P-STANDARD',
    note: '검색 제목·설명·소유확인 코드를 넣습니다.',
  },
  {
    id: 'b2c-a-analytics',
    label: '통계',
    surface: '어드민',
    group: '분석',
    from: 'P-STANDARD',
    note: '매출·방문·기간별 추이를 봅니다.',
  },
  {
    id: 'b2c-a-staff',
    label: '운영자 계정',
    surface: '어드민',
    group: '운영',
    from: 'P-STANDARD',
    note: '어드민에 들어오는 직원을 추가하고 역할을 줍니다.',
  },
  {
    id: 'b2c-a-policy',
    label: '약관 · 개인정보',
    surface: '어드민',
    group: '운영',
    from: 'P-BASIC',
    note: '이용약관과 개인정보 처리방침을 관리합니다.',
  },
  {
    id: 'b2c-a-supplier',
    label: '공급자 정보',
    surface: '어드민',
    group: '운영',
    from: 'P-BASIC',
    note: '전자상거래법상 표시 의무 항목을 넣습니다.',
  },
  {
    id: 'b2c-a-plugin',
    label: '플러그인',
    surface: '어드민',
    group: '운영',
    from: 'P-ENTERPRISE',
    note: '광고·분석 같은 바깥 조각을 배포에 얹습니다.',
  },
];

const B2C_WEB: PlanFeature[] = [
  {
    id: 'b2c-w-catalog',
    label: '상품 목록 · 상세',
    surface: '웹페이지',
    group: '판매',
    from: 'P-BASIC',
    note: '고객이 상품을 찾고 자세히 봅니다.',
  },
  {
    id: 'b2c-w-cart',
    label: '장바구니',
    surface: '웹페이지',
    group: '판매',
    from: 'P-BASIC',
    note: '여러 상품을 담아 한 번에 결제합니다.',
  },
  {
    id: 'b2c-w-checkout',
    label: '결제',
    surface: '웹페이지',
    group: '판매',
    from: 'P-BASIC',
    note: 'PG 를 붙여 카드·계좌이체로 결제합니다.',
  },
  {
    id: 'b2c-w-order',
    label: '주문 조회',
    surface: '웹페이지',
    group: '판매',
    from: 'P-BASIC',
    note: '내 주문과 배송 상태를 봅니다. 어드민이 넣은 송장이 여기 나타납니다.',
  },
  {
    id: 'b2c-w-review',
    label: '리뷰 작성',
    surface: '웹페이지',
    group: '판매',
    from: 'P-BASIC',
    note: '산 상품에 별점과 글을 남깁니다.',
  },
  {
    id: 'b2c-w-auth',
    label: '회원가입 · 로그인',
    surface: '웹페이지',
    group: '고객',
    from: 'P-BASIC',
    note: '이메일로 가입하고 들어옵니다.',
  },
  {
    id: 'b2c-w-oauth',
    label: '소셜 로그인',
    surface: '웹페이지',
    group: '고객',
    from: 'P-STANDARD',
    note: '카카오·네이버·구글·애플로 들어옵니다.',
  },
  {
    id: 'b2c-w-mypage',
    label: '마이페이지',
    surface: '웹페이지',
    group: '고객',
    from: 'P-BASIC',
    note: '내 정보를 고치고 문의 기록을 봅니다.',
  },
  {
    id: 'b2c-w-coupon',
    label: '쿠폰함',
    surface: '웹페이지',
    group: '고객',
    from: 'P-STANDARD',
    note: '받은 쿠폰을 확인하고 결제에 씁니다.',
  },
  {
    id: 'b2c-w-alarm',
    label: '알람',
    surface: '웹페이지',
    group: '고객',
    from: 'P-STANDARD',
    note: '주문·공지·혜택 소식을 모아 봅니다.',
  },
  {
    id: 'b2c-w-inquiry',
    label: '문의하기',
    surface: '웹페이지',
    group: '고객',
    from: 'P-BASIC',
    note: '어드민에서 정한 항목으로 문의를 보냅니다.',
  },
  {
    id: 'b2c-w-notice',
    label: '공지 · FAQ',
    surface: '웹페이지',
    group: '콘텐츠',
    from: 'P-BASIC',
    note: '어드민이 쓴 공지와 FAQ 를 봅니다.',
  },
  {
    id: 'b2c-w-story',
    label: '뉴스 · 포트폴리오',
    surface: '웹페이지',
    group: '콘텐츠',
    from: 'P-STANDARD',
    note: '언론 보도와 사례를 봅니다.',
  },
  {
    id: 'b2c-w-company',
    label: '회사 소개 · 연혁',
    surface: '웹페이지',
    group: '콘텐츠',
    from: 'P-BASIC',
    note: '회사 정보와 연혁을 봅니다.',
  },
  {
    id: 'b2c-w-domain',
    label: '커스텀 도메인',
    surface: '웹페이지',
    group: '운영',
    from: 'P-STANDARD',
    note: '고객사 도메인으로 사이트를 엽니다. DNS 는 우리가 잡아 줍니다.',
  },
  {
    id: 'b2c-w-i18n',
    label: '다국어 표시',
    surface: '웹페이지',
    group: '운영',
    from: 'P-ENTERPRISE',
    note: '화면 문구를 여러 언어로 보여 줍니다.',
  },
];

/* ── B2B ─────────────────────────────────────────────────────────────
   B2C 와 다른 점은 **파는 상대가 사업자**라는 것이다. 그래서 값이 셋 늘어난다.

   1. **누구에게 파는지 먼저 가른다** — 사업자등록증을 받고 승인해야 상품이 보인다.
      아무나 도매가를 보면 소매 거래처가 그 값을 알게 된다.
   2. **값이 거래처마다 다르다** — 같은 상품이 A 사에는 8,000원, B 사에는 8,500원이다.
   3. **먼저 주고 나중에 받는다** — 여신 한도를 넘기면 주문을 막아야 하고, 세금계산서가
      결제만큼 중요하다. */

const B2B_ADMIN: PlanFeature[] = [
  {
    id: 'b2b-a-account',
    label: '거래처 승인',
    surface: '어드민',
    group: '거래처',
    from: 'P-B2B-BASIC',
    note: '사업자등록증을 확인하고 가입을 승인합니다. 승인 전에는 값이 보이지 않습니다.',
  },
  {
    id: 'b2b-a-tier',
    label: '거래처 등급',
    surface: '어드민',
    group: '거래처',
    from: 'P-B2B-BASIC',
    note: '등급마다 보이는 상품과 값을 다르게 둡니다.',
  },
  {
    id: 'b2b-a-price',
    label: '거래처별 단가',
    surface: '어드민',
    group: '가격',
    from: 'P-B2B-STANDARD',
    note: '같은 상품을 거래처마다 다른 값으로 팝니다.',
  },
  {
    id: 'b2b-a-volume',
    label: '수량별 단가',
    surface: '어드민',
    group: '가격',
    from: 'P-B2B-BASIC',
    note: '많이 살수록 단가가 내려가는 구간을 정합니다.',
  },
  {
    id: 'b2b-a-quote',
    label: '견적 관리',
    surface: '어드민',
    group: '거래',
    from: 'P-B2B-STANDARD',
    note: '거래처가 올린 견적 요청에 값을 넣어 회신합니다.',
  },
  {
    id: 'b2b-a-order',
    label: '발주 관리',
    surface: '어드민',
    group: '거래',
    from: 'P-B2B-BASIC',
    note: '발주를 확인하고 출고합니다.',
  },
  {
    id: 'b2b-a-bulk',
    label: '대량 등록',
    surface: '어드민',
    group: '거래',
    from: 'P-B2B-STANDARD',
    note: '엑셀로 상품 수천 개를 한 번에 올리고, 주문서도 손으로 적어 넣습니다.',
  },
  {
    id: 'b2b-a-credit',
    label: '여신 한도',
    surface: '어드민',
    group: '정산',
    from: 'P-B2B-STANDARD',
    note: '거래처마다 외상 한도를 정합니다. 넘기면 발주가 막힙니다.',
  },
  {
    id: 'b2b-a-receivable',
    label: '미수금',
    surface: '어드민',
    group: '정산',
    from: 'P-B2B-STANDARD',
    note: '받을 돈과 결제일을 봅니다. 기한이 가까워지면 알립니다.',
  },
  {
    id: 'b2b-a-tax',
    label: '세금계산서',
    surface: '어드민',
    group: '정산',
    from: 'P-B2B-BASIC',
    note: '발행하고 홈택스로 넘깁니다.',
  },
  {
    id: 'b2b-a-erp',
    label: 'ERP 연동',
    surface: '어드민',
    group: '연동',
    from: 'P-B2B-ENTERPRISE',
    note: '재고와 회계를 쓰던 시스템과 맞춥니다.',
  },
  {
    id: 'b2b-a-contract',
    label: '전자계약',
    surface: '어드민',
    group: '연동',
    from: 'P-B2B-ENTERPRISE',
    note: '거래 조건을 문서로 남기고 서명받습니다.',
  },
];

const B2B_WEB: PlanFeature[] = [
  {
    id: 'b2b-w-signup',
    label: '사업자 가입',
    surface: '웹페이지',
    group: '거래처',
    from: 'P-B2B-BASIC',
    note: '사업자등록증을 올려 가입을 신청합니다. 승인까지는 상품이 보이지 않습니다.',
  },
  {
    id: 'b2b-w-catalog',
    label: '상품 목록',
    surface: '웹페이지',
    group: '가격',
    from: 'P-B2B-BASIC',
    note: '내 등급에 맞는 상품만 보입니다.',
  },
  {
    id: 'b2b-w-myprice',
    label: '내 단가 표시',
    surface: '웹페이지',
    group: '가격',
    from: 'P-B2B-STANDARD',
    note: '목록에서 바로 내게 적용되는 최종 단가를 봅니다.',
  },
  {
    id: 'b2b-w-quickorder',
    label: '간편 발주',
    surface: '웹페이지',
    group: '거래',
    from: 'P-B2B-BASIC',
    note: '목록에서 수량만 적어 한 번에 담습니다. 상세로 들어가지 않습니다.',
  },
  {
    id: 'b2b-w-quote',
    label: '견적 요청',
    surface: '웹페이지',
    group: '거래',
    from: 'P-B2B-STANDARD',
    note: '값을 협의할 상품을 골라 견적을 올립니다.',
  },
  {
    id: 'b2b-w-reorder',
    label: '재발주',
    surface: '웹페이지',
    group: '거래',
    from: 'P-B2B-BASIC',
    note: '지난 발주를 그대로 다시 넣습니다. 도매는 같은 것을 되풀이해 삽니다.',
  },
  {
    id: 'b2b-w-split',
    label: '분할 배송지',
    surface: '웹페이지',
    group: '거래',
    from: 'P-B2B-STANDARD',
    note: '한 발주를 여러 지점으로 나눠 보냅니다.',
  },
  {
    id: 'b2b-w-credit',
    label: '여신 잔액',
    surface: '웹페이지',
    group: '정산',
    from: 'P-B2B-STANDARD',
    note: '남은 외상 한도와 결제일을 봅니다.',
  },
  {
    id: 'b2b-w-tax',
    label: '세금계산서 조회',
    surface: '웹페이지',
    group: '정산',
    from: 'P-B2B-BASIC',
    note: '발행된 계산서를 내려받습니다.',
  },
  {
    id: 'b2b-w-subaccount',
    label: '담당자 계정',
    surface: '웹페이지',
    group: '거래처',
    from: 'P-B2B-ENTERPRISE',
    note: '한 거래처 안에서 구매 담당자를 여럿 두고 결재선을 겁니다.',
  },
];

/* ── IR ──────────────────────────────────────────────────────────────
   IR 사이트는 **파는 곳이 아니라 알리는 곳**이다. 장바구니도 회원 가입도 없다.
   대신 **틀리면 안 되는 값**을 다룬다 — 공시와 재무는 법으로 정해진 것이라, 사이트에 적힌
   숫자가 전자공시(DART)와 다르면 그 자체가 문제가 된다.

   그래서 값을 손으로 적게 두지 않고 **받아 오는 쪽**에 무게를 둔다. */

const IR_ADMIN: PlanFeature[] = [
  {
    id: 'ir-a-disclosure',
    label: '공시 관리',
    surface: '어드민',
    group: '공시',
    from: 'P-IR-BASIC',
    note: '공시를 올리고 분류합니다.',
  },
  {
    id: 'ir-a-dart',
    label: 'DART 연동',
    surface: '어드민',
    group: '공시',
    from: 'P-IR-STANDARD',
    note: '전자공시에서 자동으로 받아 옵니다. 손으로 옮겨 적으면 숫자가 어긋납니다.',
  },
  {
    id: 'ir-a-financial',
    label: '재무 정보',
    surface: '어드민',
    group: '재무',
    from: 'P-IR-BASIC',
    note: '재무제표와 주요 지표를 올립니다.',
  },
  {
    id: 'ir-a-stock',
    label: '주가 연동',
    surface: '어드민',
    group: '재무',
    from: 'P-IR-STANDARD',
    note: '거래소 시세를 받아 실시간으로 보여 줍니다.',
  },
  {
    id: 'ir-a-dividend',
    label: '배당 정보',
    surface: '어드민',
    group: '재무',
    from: 'P-IR-BASIC',
    note: '배당 이력과 기준일을 관리합니다.',
  },
  {
    id: 'ir-a-meeting',
    label: '주주총회',
    surface: '어드민',
    group: '주주',
    from: 'P-IR-BASIC',
    note: '소집공고와 안건, 결과를 올립니다.',
  },
  {
    id: 'ir-a-governance',
    label: '지배구조',
    surface: '어드민',
    group: '주주',
    from: 'P-IR-BASIC',
    note: '이사회 구성과 지배구조 보고서를 관리합니다.',
  },
  {
    id: 'ir-a-library',
    label: 'IR 자료실',
    surface: '어드민',
    group: '자료',
    from: 'P-IR-BASIC',
    note: '실적 발표와 설명회 자료를 올립니다.',
  },
  {
    id: 'ir-a-schedule',
    label: 'IR 일정',
    surface: '어드민',
    group: '자료',
    from: 'P-IR-STANDARD',
    note: '실적 발표일과 설명회 일정을 알립니다.',
  },
  {
    id: 'ir-a-subscribe',
    label: '알림 발송',
    surface: '어드민',
    group: '자료',
    from: 'P-IR-STANDARD',
    note: '새 공시를 구독한 투자자에게 메일로 보냅니다.',
  },
  {
    id: 'ir-a-i18n',
    label: '국문 · 영문',
    surface: '어드민',
    group: '운영',
    from: 'P-IR-ENTERPRISE',
    note: '같은 자료를 두 언어로 나란히 냅니다. 해외 투자자가 있으면 필요합니다.',
  },
];

const IR_WEB: PlanFeature[] = [
  {
    id: 'ir-w-disclosure',
    label: '공시 정보',
    surface: '웹페이지',
    group: '공시',
    from: 'P-IR-BASIC',
    note: '공시 목록을 최신순으로 봅니다.',
  },
  {
    id: 'ir-w-financial',
    label: '재무 정보',
    surface: '웹페이지',
    group: '재무',
    from: 'P-IR-BASIC',
    note: '재무제표와 주요 지표를 봅니다.',
  },
  {
    id: 'ir-w-stock',
    label: '주가 정보',
    surface: '웹페이지',
    group: '재무',
    from: 'P-IR-STANDARD',
    note: '실시간 주가와 추이를 봅니다.',
  },
  {
    id: 'ir-w-dividend',
    label: '배당 정보',
    surface: '웹페이지',
    group: '재무',
    from: 'P-IR-BASIC',
    note: '배당 이력과 기준일을 봅니다.',
  },
  {
    id: 'ir-w-meeting',
    label: '주주총회',
    surface: '웹페이지',
    group: '주주',
    from: 'P-IR-BASIC',
    note: '소집공고와 안건, 결과를 봅니다.',
  },
  {
    id: 'ir-w-vote',
    label: '전자투표 안내',
    surface: '웹페이지',
    group: '주주',
    from: 'P-IR-STANDARD',
    note: '의결권을 어디서 어떻게 행사하는지 알립니다.',
  },
  {
    id: 'ir-w-governance',
    label: '지배구조',
    surface: '웹페이지',
    group: '주주',
    from: 'P-IR-BASIC',
    note: '이사회 구성과 지배구조 보고서를 봅니다.',
  },
  {
    id: 'ir-w-library',
    label: 'IR 자료실',
    surface: '웹페이지',
    group: '자료',
    from: 'P-IR-BASIC',
    note: '실적 발표와 설명회 자료를 내려받습니다.',
  },
  {
    id: 'ir-w-schedule',
    label: 'IR 일정',
    surface: '웹페이지',
    group: '자료',
    from: 'P-IR-STANDARD',
    note: '다가오는 실적 발표와 설명회를 봅니다.',
  },
  {
    id: 'ir-w-subscribe',
    label: '공시 구독',
    surface: '웹페이지',
    group: '자료',
    from: 'P-IR-STANDARD',
    note: '메일 주소를 남기면 새 공시를 받습니다. 회원 가입은 아닙니다.',
  },
  {
    id: 'ir-w-contact',
    label: 'IR 문의',
    surface: '웹페이지',
    group: '자료',
    from: 'P-IR-BASIC',
    note: 'IR 담당자에게 묻습니다.',
  },
  {
    id: 'ir-w-i18n',
    label: '영문 사이트',
    surface: '웹페이지',
    group: '운영',
    from: 'P-IR-ENTERPRISE',
    note: '해외 투자자를 위한 영문 화면입니다.',
  },
];

/** 도메인별 기능. */
export const PLAN_FEATURES: Record<PlanDomain, PlanFeature[]> = {
  B2C: [...B2C_ADMIN, ...B2C_WEB],
  B2B: [...B2B_ADMIN, ...B2B_WEB],
  IR: [...IR_ADMIN, ...IR_WEB],
};

/**
 * 표에서 갈래를 묶는 순서. **도메인마다 다르다.**
 *
 * B2C 의 '판매' 를 B2B 에도 쓰면 어색하다 — 도매에서 먼저 정하는 것은 '누구에게 파는가'
 * (거래처)이고 그다음이 '얼마에'(가격)다. IR 은 아예 파는 곳이 아니라 갈래가 통째로 다르다.
 */
export const FEATURE_GROUPS: Record<PlanDomain, readonly string[]> = {
  B2C: ['판매', '고객', '콘텐츠', '마케팅', '분석', '운영'],
  B2B: ['거래처', '가격', '거래', '정산', '연동'],
  IR: ['공시', '재무', '주주', '자료', '운영'],
};

/**
 * 이 플랜에 이 기능이 들어오는가.
 *
 * 등급의 **차례**로 판정한다 — `from` 보다 위 등급이면 켜진다. 등급마다 기능 목록을 따로
 * 적으면 스탠다드에만 넣고 엔터프라이즈에 넣는 것을 잊는 일이 생긴다.
 */
export function includedIn(feature: PlanFeature, planId: string, order: readonly string[]): boolean {
  const need = order.indexOf(feature.from);
  const has = order.indexOf(planId);
  // 차례를 모르는 플랜(판매 종료된 옛 플랜 등)은 켜지 않는다 — 모르면 팔지 않는 편이 안전하다.
  if (need < 0 || has < 0) return false;
  return has >= need;
}
