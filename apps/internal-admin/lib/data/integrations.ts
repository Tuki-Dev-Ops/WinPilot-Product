/**
 * 고객사별 연동 설정 — PG · OAuth · Plugin · DNS. **프론트엔드 전용** 시드.
 *
 * 이 값들은 고객사가 직접 만지지 못한다. 키를 잘못 넣으면 로그인과 결제가 동시에 멈추고,
 * 도메인 레코드가 틀리면 사이트가 통째로 열리지 않는다. 원인을 찾는 것도 우리 몫이 되기
 * 때문에 사내 어드민에서만 다룬다.
 *
 * 넷을 한 파일에 두는 이유: 모두 **고객사 하나에 붙는 바깥 연결**이라 고르는 대상이 같다.
 * 파일을 넷으로 나누면 고객사 선택기가 네 벌이 된다.
 */
export type OauthProviderId = 'kakao' | 'naver' | 'google' | 'apple';

export type OauthProvider = {
  id: OauthProviderId;
  label: string;
  enabled: boolean;
  clientId: string;
  /** 화면에는 뒷자리만 보여준다 — 전체 값을 어깨너머로 읽히게 두지 않는다 */
  clientSecret: string;
  redirectUri: string;
};

export type PgProviderId = 'toss' | 'nice' | 'kg' | 'stripe';

export type PgSetting = {
  provider: PgProviderId;
  label: string;
  merchantId: string;
  secretKey: string;
  /** 실결제 여부 — 테스트 모드면 실제로 돈이 움직이지 않는다 */
  live: boolean;
  methods: string[];
};

export const OAUTH_LABELS: Record<OauthProviderId, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
  apple: '애플',
};

export const PG_LABELS: Record<PgProviderId, string> = {
  toss: '토스페이먼츠',
  nice: '나이스페이',
  kg: 'KG이니시스',
  stripe: 'Stripe',
};

export const PAY_METHODS = ['신용카드', '계좌이체', '가상계좌', '간편결제', '휴대폰'];

export function defaultOauth(domain: string): OauthProvider[] {
  return (Object.keys(OAUTH_LABELS) as OauthProviderId[]).map((id) => ({
    id,
    label: OAUTH_LABELS[id],
    enabled: id === 'kakao' || id === 'naver',
    clientId: id === 'kakao' ? 'kakao_live_0000000000' : id === 'naver' ? 'naver_live_0000000000' : '',
    clientSecret: id === 'kakao' || id === 'naver' ? '****************abcd' : '',
    redirectUri: `https://${domain}/auth/callback/${id}`,
  }));
}

export const DEFAULT_PG: PgSetting = {
  provider: 'toss',
  label: PG_LABELS.toss,
  merchantId: 'mid_0000000000',
  secretKey: '****************wxyz',
  live: true,
  methods: ['신용카드', '간편결제', '계좌이체'],
};

/** 비밀값은 뒷 4자리만 남긴다. 목록·요약에 그대로 흘리지 않기 위해서다. */
export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '미설정';
  if (trimmed.length <= 4) return '****';
  return `${'*'.repeat(Math.min(trimmed.length - 4, 16))}${trimmed.slice(-4)}`;
}

/* ── Plugin ──────────────────────────────────────────────────────────── */

/**
 * 고객사 배포에 얹는 조각.
 *
 * 켜는 순간 고객사 화면에서 바로 돈다 — 그래서 **무엇이 밖으로 나가는 것인지**를 항목마다
 * 적어 둔다. 채팅 상담처럼 화면에 눈에 띄게 나타나는 것과, 분석 스크립트처럼 보이지 않는
 * 것이 섞여 있어서 켠 사람도 무엇을 켰는지 잊는다.
 */
export type PluginId = 'chat' | 'analytics' | 'review-photo' | 'crm' | 'translate';

export type PluginSetting = {
  id: PluginId;
  label: string;
  /** 이 조각이 하는 일 — 한 문장 */
  purpose: string;
  /** 고객사 화면에 보이는지. 보이지 않는 것은 켠 사실을 잊기 쉽다 */
  visible: boolean;
  enabled: boolean;
  /** 이 조각을 붙이는 데 필요한 키. 비우면 키가 필요 없다 */
  key: string;
  /** 켜려면 있어야 하는 최소 플랜 이름 */
  requires: string;
};

export const PLUGIN_DEFAULTS: PluginSetting[] = [
  {
    id: 'chat',
    label: '채팅 상담',
    purpose: '고객 화면 오른쪽 아래에 상담 창을 띄운다.',
    visible: true,
    enabled: true,
    key: 'chat_live_0000000000',
    requires: '베이직',
  },
  {
    id: 'analytics',
    label: '방문 분석',
    purpose: '어느 화면을 얼마나 보는지 모아 통계로 넘긴다.',
    visible: false,
    enabled: true,
    key: 'GA-0000000000',
    requires: '베이직',
  },
  {
    id: 'review-photo',
    label: '포토 리뷰',
    purpose: '리뷰에 사진을 붙일 수 있게 한다.',
    visible: true,
    enabled: false,
    key: '',
    requires: '스탠다드',
  },
  {
    id: 'crm',
    label: '고객 관리 연동',
    purpose: '가입·주문을 바깥 고객 관리 도구로 넘긴다.',
    visible: false,
    enabled: false,
    key: '',
    requires: '엔터프라이즈',
  },
  {
    id: 'translate',
    label: '다국어 표시',
    purpose: '고객 화면의 문구를 다른 언어로 바꿔 보여 준다.',
    visible: true,
    enabled: false,
    key: '',
    requires: '엔터프라이즈',
  },
];

/* ── DNS ─────────────────────────────────────────────────────────────── */

/**
 * 도메인 레코드.
 *
 * **우리가 값을 만들어 주고 확인만 한다.** 실제 등록은 고객사가 자기 도메인 관리 화면에서
 * 하기 때문이다. 그래서 이 화면에는 저장이 아니라 **다시 확인**이 있다 — 없는 권한을
 * 있는 것처럼 그리면 눌러 놓고 왜 안 되는지 찾게 된다.
 */
export type DnsKind = 'A' | 'CNAME' | 'TXT' | 'MX';
export type DnsState = '확인됨' | '확인 중' | '불일치' | '없음';

export type DnsRecord = {
  /** 어느 배포를 가리키는 레코드인지 */
  target: string;
  kind: DnsKind;
  host: string;
  /** 고객사가 넣어야 하는 값 */
  value: string;
  state: DnsState;
  /** 마지막으로 확인한 시각 */
  checkedAt: string;
};

export const DNS_KINDS: DnsKind[] = ['A', 'CNAME', 'TXT', 'MX'];

export function defaultDns(clientDomain: string, adminDomain: string): DnsRecord[] {
  return [
    {
      target: 'B2C Client',
      kind: 'A',
      host: clientDomain,
      value: '203.0.113.10',
      state: '확인됨',
      checkedAt: '2026-08-05 09:12',
    },
    {
      target: 'B2C Client',
      kind: 'CNAME',
      host: `www.${clientDomain}`,
      value: clientDomain,
      state: '확인됨',
      checkedAt: '2026-08-05 09:12',
    },
    {
      target: 'B2C Admin',
      kind: 'CNAME',
      host: adminDomain,
      value: 'admin.winpilot.app',
      state: '확인 중',
      checkedAt: '2026-08-05 09:12',
    },
    {
      target: '소유 확인',
      kind: 'TXT',
      host: `_winpilot.${clientDomain}`,
      value: 'winpilot-site-verification=0000000000',
      state: '확인됨',
      checkedAt: '2026-08-05 09:12',
    },
    {
      target: '메일 발신',
      kind: 'TXT',
      host: clientDomain,
      value: 'v=spf1 include:winpilot.app ~all',
      state: '불일치',
      checkedAt: '2026-08-05 09:12',
    },
  ];
}

export const DNS_TONE: Record<DnsState, string> = {
  확인됨: 'bg-signal-ok/12 text-signal-ok',
  '확인 중': 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  불일치: 'bg-signal-danger/12 text-signal-danger',
  없음: 'bg-signal-danger/12 text-signal-danger',
};
