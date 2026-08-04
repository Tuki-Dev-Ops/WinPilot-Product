/**
 * 뷰 = 최상위 제품 경계. **뷰 하나가 곧 레포 하나이자 배포 단위 하나다.**
 *
 * 레포가 분리되면 각 앱은 자기 도메인의 루트를 갖는다 — 그래서 `routePrefix` 가 비어 있다.
 * 경로 기반 배포(`example.com/admin`)가 필요하면 Next 의 `basePath` 로 처리하고,
 * 앱 안의 라우트를 `/admin/**` 로 중복해서 적지 않는다.
 *
 * B2B 는 아직 화면이 없다. 필요해지는 시점에 아래 두 줄을 열고 레포를 추가한다.
 */
export const VIEWS = ['b2c-client', 'b2c-admin', 'internal-admin'] as const;
export type ViewId = (typeof VIEWS)[number];

export type ViewMeta = {
  label: string;
  /** 앱 내부 라우트 접두어. 레포가 분리되어 있으므로 비어 있다. */
  routePrefix: string;
  /** 공유 레지스트리 출력에서 두 구현을 구분하기 위한 컴포넌트 접두어 */
  componentPrefix: string;
  /** 이 뷰가 사는 워크스페이스 디렉터리 (= 분리 후 레포 이름) */
  app: string;
  /** 개발 서버 포트 */
  port: number;
  /**
   * 짝을 이루는 뷰 묶음.
   *
   * 같은 묶음 안에서는 한쪽에만 있는 기능을 누락으로 의심한다(고객 화면과 운영 화면은 짝이다).
   * 묶음이 다르면 서로 다른 제품이므로 비교하지 않는다.
   */
  pairGroup: 'b2c' | 'internal';
};

export const VIEW_META: Readonly<Record<ViewId, ViewMeta>> = {
  'b2c-client': {
    label: 'B2C Client',
    routePrefix: '',
    componentPrefix: '',
    // 템플릿 A~F 는 같은 뷰의 레이아웃 변형이다 — 라우트·기능은 같고 배치만 다르다.
    // 기준 템플릿(A)을 이 뷰의 대표 구현으로 둔다.
    app: 'b2c-client-a',
    port: 3300,
    pairGroup: 'b2c',
  },
  'b2c-admin': {
    label: 'B2C Admin',
    routePrefix: '',
    componentPrefix: 'Admin',
    app: 'b2c-admin',
    port: 3301,
    pairGroup: 'b2c',
  },
  // 사내 전용 — 고객사의 계정·도메인·연동·요금을 우리가 대신 관리한다. 고객사에는 열리지 않는다.
  'internal-admin': {
    label: 'Internal Admin',
    routePrefix: '',
    componentPrefix: 'Internal',
    app: 'internal-admin',
    port: 3302,
    pairGroup: 'internal',
  },
  // 'b2b-client': { label: 'B2B Client', routePrefix: '', componentPrefix: 'B2b',      app: 'b2b-client', port: 3310 },
  // 'b2b-admin':  { label: 'B2B Admin',  routePrefix: '', componentPrefix: 'B2bAdmin', app: 'b2b-admin',  port: 3311 },
};

/**
 * 표준 동작 어휘.
 *
 * 이 목록에 없는 동작은 쓸 수 없다. `create`/`add`/`new`/`register` 처럼 같은 뜻의 단어가
 * 뷰마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째 원인이므로, 어휘를 먼저 닫는다.
 */
export const ACTIONS = [
  /** 랜딩·소개 화면. 자원 CRUD 가 아닌 진입 화면에만 쓴다. */
  'home',
  /**
   * 디자인 시스템 갤러리. 제품 기능이 아니라, 컴포넌트의 모든 변형을 한 화면에 그려
   * Figma ComponentSet 으로 넘기기 위한 페이지다. 한 화면은 한 상태만 렌더하므로
   * 변형을 뽑으려면 이런 면이 반드시 필요하다.
   */
  'library',
  'list',
  'detail',
  'create',
  'edit',
  'delete',
  'search',
  'import',
  'export',
  'settings',
  'dashboard',
  'auth',
  /**
   * 회원가입.
   *
   * 자원을 만든다는 점은 `create` 와 같지만 경로 관습이 다르다 —
   * 고객 화면의 가입은 `/users/new` 가 아니라 `/signup` 이다. 규칙에 예외를 숨기는 대신
   * 동작을 하나 더 두어, 왜 경로가 다른지가 어휘에 드러나게 한다.
   */
  'signup',
] as const;
export type ActionId = (typeof ACTIONS)[number];

export type ImplementationStatus = 'planned' | 'implemented';

/** 한 기능이 특정 뷰에서 어떻게 구현되는가 */
export type ViewBinding = {
  route: string;
  component: string;
  status: ImplementationStatus;
  /** 이 뷰에만 해당하는 비고 (권한 차이, 노출 범위 차이 등) */
  note?: string;
};

/**
 * 기능 하나. **Feature ID 가 뷰를 가로지르는 유일한 식별자다.**
 *
 * "Client 에서는 상품 등록, Admin 에서는 제품 생성" 같은 표류를 막기 위해,
 * 코드·라우트·i18n 키·테스트 ID·Figma 프레임명이 전부 이 id 에서 파생된다.
 */
export type FeatureSpec = {
  /** `<entity>.<action>` 또는 `<domain>.<entity>.<action>` (소문자 · 점 구분) */
  id: string;
  label: { ko: string; en: string };
  entity: string;
  action: ActionId;
  views: Partial<Record<ViewId, ViewBinding>>;
  /**
   * 한쪽 뷰에만 존재하는 것이 설계상 맞는 기능.
   *
   * 운영 전용 화면(설정·심사·감사 등)은 고객 화면에 대응물이 없는 게 정상이라
   * 매번 `VIEW_PARTIAL` 경고를 내면 진짜 누락이 그 안에 묻힌다.
   */
  singleViewByDesign?: boolean;
};

export type Issue = {
  severity: 'error' | 'warn';
  code: string;
  where: string;
  message: string;
};
