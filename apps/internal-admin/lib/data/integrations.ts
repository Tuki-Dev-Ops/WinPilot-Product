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
import type { BadgeTone } from '@winpilot/ui';

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

/*
 * 결제대행사의 목록과 **대행사마다 다른 연동 값**은 `lib/data/pg-providers.ts` 로 옮겼다.
 *
 * 여기 있던 `PgSetting` 은 어느 대행사든 `merchantId` + `secretKey` 두 칸으로 받았는데,
 * 실제로는 이니시스가 넷(MID · signkey · INIAPI Key · IV), KCP 가 둘(사이트코드 · 사이트키)을
 * 받는 식으로 개수도 이름도 다르다 — **두 칸에는 이니시스의 signkey 를 넣을 자리가 없었다.**
 *
 * 대행사가 늘어날 때마다 이 타입에 칸을 더하면 쓰지 않는 칸이 대행사 수만큼 쌓인다.
 * 그래서 값은 `Record<string, string>` 한 벌로 두고, **어떤 키를 받아야 하는지는 표가 안다.**
 */

export const OAUTH_LABELS: Record<OauthProviderId, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
  apple: '애플',
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
export type PluginId = 'adsense';

/**
 * 이 조각이 받는 키의 **모양**. 조각마다 다르므로 표가 들고 있는다 —
 * `연동 키` 라고만 적어 두면 어느 콘솔의 무슨 값인지 알 수 없다.
 */
export type PluginKeyField = {
  /** 서비스 콘솔에 적힌 말 그대로 */
  label: string;
  hint: string;
  note: string;
  /** 값의 생김새. 맞지 않으면 `patternMessage` 를 보여 준다 */
  pattern?: RegExp;
  patternMessage?: string;
};

export type PluginSetting = {
  id: PluginId;
  label: string;
  /** 이 조각이 하는 일 — 한 문장 */
  purpose: string;
  /** 고객사 화면에 보이는지. 보이지 않는 것은 켠 사실을 잊기 쉽다 */
  visible: boolean;
  enabled: boolean;
  /** 이 조각을 붙이는 데 필요한 키 값 */
  key: string;
  /** 키를 받지 않는 조각이면 비운다 — 빈 칸을 그리지 않기 위해서다 */
  keyField?: PluginKeyField;
  /** 켜려면 있어야 하는 최소 플랜 이름 */
  requires: string;
};

export const PLUGIN_DEFAULTS: PluginSetting[] = [
  {
    id: 'adsense',
    label: '구글 애드센스',
    purpose: '고객 화면의 정해진 자리에 애드센스 광고를 띄운다.',
    visible: true,
    enabled: false,
    key: '',
    keyField: {
      label: '게시자 ID',
      hint: 'ca-pub- 로 시작하는 16자리',
      note: 'AdSense > 계정 > 계정 정보 에 있습니다. 사이트마다 다르지 않고 계정마다 하나입니다.',
      /*
        `ca-pub-` + 숫자 16자리가 애드센스 게시자 ID 의 모양이다. 이 값이 틀리면 광고 자리는
        잡히는데 광고가 뜨지 않아, 화면만 보고는 무엇이 잘못됐는지 알 수 없다.
      */
      pattern: /^ca-pub-\d{16}$/,
      patternMessage: '게시자 ID 는 ca-pub- 뒤에 숫자 16자리입니다. (예: ca-pub-1234567890123456)',
    },
    requires: '베이직',
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

export const DNS_TONE: Record<DnsState, BadgeTone> = {
  확인됨: 'ok',
  '확인 중': 'brand',
  불일치: 'danger',
  없음: 'danger',
};
