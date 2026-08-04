/**
 * 고객사별 OAuth · PG 연동 설정 — **프론트엔드 전용** 시드.
 *
 * 이 값들은 고객사가 직접 만지지 못한다. 키를 잘못 넣으면 로그인과 결제가 동시에 멈추고,
 * 원인을 찾는 것도 우리 몫이 되기 때문에 사내 어드민에서만 다룬다.
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
