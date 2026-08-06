/**
 * 고객사 도메인에 넣어야 하는 **DNS 레코드 카탈로그**.
 *
 * ## 왜 다섯 줄로는 부족했나
 * 전에는 `A · CNAME · CNAME · TXT · TXT` 다섯 줄이었다. 그 다섯으로는 사이트가 **열리기는**
 * 하지만, 실제 오픈에서 막히는 자리는 대부분 그 밖에 있다.
 *
 * - **HTTPS 가 안 붙는다** — 와일드카드 인증서는 `_acme-challenge` 위임이 있어야 발급된다
 * - **인증서 발급이 거부된다** — CAA 가 다른 CA 만 허용하고 있으면 우리 CA 가 막힌다
 * - **메일이 스팸으로 간다** — SPF 만 있고 DKIM·DMARC 가 없다
 *
 * 셋 다 화면에 그 줄이 없으면 **연동이 끝난 것으로 보인다.** 값을 만들어 주는 화면이
 * 넣어야 할 것을 다 적지 않으면, 빠진 줄은 고객이 겪은 뒤에야 드러난다.
 *
 * ## 갈래를 나눈 이유
 * 열두 줄을 한 덩어리로 두면 무엇부터 넣어야 하는지가 안 보인다. 갈래는 **막혔을 때 벌어지는
 * 일**로 나눈다 — 사이트가 안 열리는 것, 자물쇠가 안 붙는 것, 메일이 안 가는 것은 급한 정도가
 * 다르다.
 *
 * ## 출처
 * - https://kb.isc.org/docs/aa-01640 — apex 에 CNAME 을 둘 수 없는 이유(RFC 1034: CNAME 은 같은 이름의 다른 레코드와 공존 못 하는데 apex 에는 SOA·NS 가 반드시 있다)
 * - https://letsencrypt.org/docs/caa/ — CAA 로 발급 가능한 CA 를 제한한다
 * - https://datatracker.ietf.org/doc/html/rfc8659 — CAA 표준(`issue` · `issuewild` · `iodef`)
 * - https://letsencrypt.org/docs/challenge-types/ — DNS-01 은 와일드카드 인증서의 유일한 방법
 * - https://cert-manager.io/docs/configuration/acme/dns01/ — `_acme-challenge` 를 CNAME 으로 위임하면 DNS API 키를 서버마다 두지 않아도 된다
 * - https://help.stibee.com/email/managing-sender/spf-dkim — SPF·DKIM 을 함께 넣어야 하는 이유
 * - https://library.gabia.com/contents/domain/13641/ — 네임서버 변경과 전파(국내 등록기관)
 * - https://help.cafe24.com/docs/domain/domain-hosting-external-service-connection/ — 카페24 도메인 연결
 */

import type { BadgeTone } from '@winpilot/ui';

export type DnsKind = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'CAA';
export type DnsState = '확인됨' | '확인 중' | '불일치' | '없음';

/** 막혔을 때 벌어지는 일로 나눈 갈래. 순서가 곧 넣는 차례다. */
export type DnsGroup = '사이트 연결' | '소유 확인' | '인증서' | '메일';

export const DNS_GROUPS: DnsGroup[] = ['사이트 연결', '소유 확인', '인증서', '메일'];

export const DNS_GROUP_NOTE: Record<DnsGroup, string> = {
  '사이트 연결': '이것이 없으면 주소를 쳐도 사이트가 뜨지 않습니다.',
  '소유 확인': '이 도메인이 고객사 것임을 확인하는 값입니다. 없으면 배포가 시작되지 않습니다.',
  인증서: '자물쇠(HTTPS)가 붙는 데 필요합니다. 빠지면 브라우저가 경고 화면을 먼저 띄웁니다.',
  메일: '고객사 이름으로 나가는 메일이 스팸함으로 가지 않게 합니다.',
};

export type DnsRecord = {
  id: string;
  group: DnsGroup;
  /** 어느 배포·용도를 가리키는 레코드인지 */
  target: string;
  kind: DnsKind;
  host: string;
  /** 고객사가 넣어야 하는 값 */
  value: string;
  /**
   * 권장 TTL(초).
   *
   * 바꿀 일이 잦거나 바뀌는 동안 멈추면 안 되는 값은 짧게 둔다 — 캐시가 남아 있는 동안에는
   * 고친 값이 보이지 않는다(가비아 문서). 인증서 확인용은 60초가 권장값이다.
   */
  ttl: number;
  /** 반드시 넣어야 하는가. 아니면 넣는 편이 나은 값이다 */
  required: boolean;
  state: DnsState;
  /** 마지막으로 확인한 시각 */
  checkedAt: string;
  /** 이 줄이 무엇을 하는가 — 한 문장 */
  purpose: string;
  /** 빠지거나 틀리면 무슨 일이 벌어지는가. 급한 정도를 이 말로 판단한다 */
  ifMissing: string;
  /** 왜 이 종류·이 모양인가. 물음이 반복되는 자리에만 적는다 */
  note?: string;
};

export const DNS_KINDS: DnsKind[] = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'CAA'];

export const DNS_TONE: Record<DnsState, BadgeTone> = {
  확인됨: 'ok',
  '확인 중': 'brand',
  불일치: 'danger',
  없음: 'danger',
};

/** 우리 쪽 고정값. 한 곳에 모아 두어야 값이 바뀔 때 열두 줄을 뒤지지 않는다. */
const PLATFORM = {
  ipv4: '203.0.113.10',
  ipv6: '2001:db8::10',
  adminHost: 'admin.winpilot.app',
  acmeZone: 'acme.winpilot.app',
  dkimZone: 'dkim.winpilot.app',
  mail: 'mx.winpilot.app',
  ca: 'letsencrypt.org',
  security: 'security@winpilot.test',
  dmarcReport: 'dmarc@winpilot.test',
};

const CHECKED_AT = '2026-08-06 09:12';

/**
 * 그 고객사가 넣어야 할 레코드 열둘.
 *
 * 도메인 두 개(고객 화면 · 어드민)를 받아 값을 만든다. 화면이 문자열을 이어 붙이지 않게
 * 여기서 다 만들어 내보낸다 — 화면마다 붙이면 한 곳에서 오타가 나도 그 화면만 틀린다.
 */
export function defaultDns(clientDomain: string, adminDomain: string): DnsRecord[] {
  return [
    {
      id: 'apex-a',
      group: '사이트 연결',
      target: 'B2C Client',
      kind: 'A',
      host: clientDomain,
      value: PLATFORM.ipv4,
      ttl: 300,
      required: true,
      state: '확인됨',
      checkedAt: CHECKED_AT,
      purpose: '주소창에 도메인만 쳤을 때 고객 화면으로 보냅니다.',
      ifMissing: '사이트가 아예 열리지 않습니다.',
      /*
        가장 자주 받는 물음이 "여기도 CNAME 으로 하면 안 되나요" 다. 안 된다 —
        CNAME 은 같은 이름의 다른 레코드와 함께 있을 수 없는데(RFC 1034), 루트에는 SOA 와
        NS 가 반드시 있다. 그래서 루트만 IP 를 직접 적는다.
      */
      note: '루트 도메인에는 CNAME 을 둘 수 없습니다(RFC 1034). ALIAS·ANAME 을 지원하는 DNS 라면 그것으로 대신해도 됩니다.',
    },
    {
      id: 'apex-aaaa',
      group: '사이트 연결',
      target: 'B2C Client',
      kind: 'AAAA',
      host: clientDomain,
      value: PLATFORM.ipv6,
      ttl: 300,
      required: false,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: 'IPv6 만 쓰는 망에서 들어오는 고객을 받습니다.',
      ifMissing: '대부분은 IPv4 로 들어와 문제가 드러나지 않습니다. 모바일 망 일부에서만 느려집니다.',
    },
    {
      id: 'www-cname',
      group: '사이트 연결',
      target: 'B2C Client',
      kind: 'CNAME',
      host: `www.${clientDomain}`,
      value: clientDomain,
      ttl: 300,
      required: true,
      state: '확인됨',
      checkedAt: CHECKED_AT,
      purpose: 'www 를 붙여 들어온 사람을 같은 화면으로 보냅니다.',
      ifMissing: 'www 를 붙여 접속한 고객에게만 오류가 납니다 — 운영자는 모르고 지나가기 쉽습니다.',
    },
    {
      id: 'admin-cname',
      group: '사이트 연결',
      target: 'B2C Admin',
      kind: 'CNAME',
      host: adminDomain,
      value: PLATFORM.adminHost,
      ttl: 300,
      required: true,
      state: '확인 중',
      checkedAt: CHECKED_AT,
      purpose: '고객사 운영자가 쓰는 어드민 주소입니다.',
      ifMissing: '고객사가 자기 어드민에 들어오지 못합니다.',
    },
    {
      id: 'verify-txt',
      group: '소유 확인',
      target: '소유 확인',
      kind: 'TXT',
      host: `_winpilot.${clientDomain}`,
      value: 'winpilot-site-verification=0000000000',
      ttl: 3600,
      required: true,
      state: '확인됨',
      checkedAt: CHECKED_AT,
      purpose: '이 도메인이 고객사의 것임을 확인합니다.',
      ifMissing: '배포를 붙이지 못합니다. 남의 도메인에 사이트를 올리는 일을 막는 값입니다.',
    },
    {
      id: 'acme-cname',
      group: '인증서',
      target: 'HTTPS',
      kind: 'CNAME',
      host: `_acme-challenge.${clientDomain}`,
      value: `${clientDomain}.${PLATFORM.acmeZone}`,
      /* 인증서를 다시 받을 때마다 값이 바뀐다 — 캐시가 길면 갱신이 그 시간만큼 막힌다. */
      ttl: 60,
      required: true,
      state: '확인 중',
      checkedAt: CHECKED_AT,
      purpose: '인증서를 우리가 대신 받아 갱신합니다.',
      ifMissing: '와일드카드 인증서를 발급받지 못하고, 갱신이 막히면 90일 뒤 자물쇠가 풀립니다.',
      /*
        값을 직접 넣게 하지 않고 **위임**한다. 직접 넣으면 갱신 때마다 고객사가 손으로 값을
        바꿔야 하고, 자동화하려면 고객사 DNS 키를 우리가 들고 있어야 한다.
      */
      note: '값을 직접 넣는 대신 우리 쪽으로 위임합니다. 이렇게 두면 갱신 때마다 고객사가 손댈 일이 없고, 고객사 DNS 키를 우리가 보관하지 않아도 됩니다.',
    },
    {
      id: 'caa-issue',
      group: '인증서',
      target: 'HTTPS',
      kind: 'CAA',
      host: clientDomain,
      value: `0 issue "${PLATFORM.ca}"`,
      ttl: 3600,
      required: true,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: '이 도메인의 인증서를 발급할 수 있는 곳을 우리 CA 로 제한합니다.',
      ifMissing: 'CAA 가 아예 없으면 아무 CA 나 발급할 수 있고, 다른 CA 만 적혀 있으면 우리 발급이 거부됩니다.',
      note: 'CAA 는 RFC 8659 입니다. 이미 다른 CA 가 적혀 있다면 지우지 말고 한 줄을 더합니다.',
    },
    {
      id: 'caa-issuewild',
      group: '인증서',
      target: 'HTTPS',
      kind: 'CAA',
      host: clientDomain,
      value: `0 issuewild "${PLATFORM.ca}"`,
      ttl: 3600,
      required: false,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: '와일드카드(`*.도메인`) 인증서를 발급할 수 있는 곳을 정합니다.',
      ifMissing: '와일드카드를 쓰지 않으면 없어도 됩니다. 쓰는데 빠지면 `issue` 가 있어도 거부됩니다.',
      note: '와일드카드에는 `issuewild` 가 `issue` 보다 먼저 적용됩니다.',
    },
    {
      id: 'mx',
      group: '메일',
      target: '메일 수신',
      kind: 'MX',
      host: clientDomain,
      value: `10 ${PLATFORM.mail}`,
      ttl: 3600,
      required: false,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: '고객사 도메인으로 오는 메일을 받을 서버를 정합니다.',
      ifMissing: '이미 쓰는 메일이 있으면 그대로 두세요. 우리 쪽으로 받을 때만 넣습니다.',
      note: '이미 다른 메일을 쓰고 있다면 이 줄을 넣지 마세요 — 받던 메일이 그 순간 끊깁니다.',
    },
    {
      id: 'spf',
      group: '메일',
      target: '메일 발신',
      kind: 'TXT',
      host: clientDomain,
      value: 'v=spf1 include:winpilot.app ~all',
      ttl: 3600,
      required: true,
      state: '불일치',
      checkedAt: CHECKED_AT,
      purpose: '주문 알림처럼 우리가 대신 보내는 메일을 정상 발신으로 인정받습니다.',
      ifMissing: '주문 확인 메일이 스팸함으로 갑니다. 고객은 메일이 안 왔다고 말합니다.',
      /*
        SPF 는 한 도메인에 **한 줄**이고, 참조(`include`)를 따라가는 조회가 10 번을 넘으면
        검사 자체가 실패한다 — 가장 흔한 설정 실수다.
      */
      note: 'SPF 는 도메인마다 한 줄만 둘 수 있습니다. 이미 있으면 새로 만들지 말고 그 줄에 `include:winpilot.app` 을 더하세요. `include` 를 따라가는 조회가 10 번을 넘으면 검사가 실패합니다.',
    },
    {
      id: 'dkim',
      group: '메일',
      target: '메일 발신',
      kind: 'CNAME',
      host: `winpilot._domainkey.${clientDomain}`,
      value: `${clientDomain}.${PLATFORM.dkimZone}`,
      ttl: 3600,
      required: true,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: '보낸 메일이 가는 길에 바뀌지 않았음을 서명으로 증명합니다.',
      ifMissing: 'SPF 만으로는 부족해 스팸 판정이 늘고, DMARC 를 켤 수 없습니다.',
      note: '키가 바뀔 때 고객사가 손대지 않아도 되도록 값 대신 위임으로 둡니다.',
    },
    {
      id: 'dmarc',
      group: '메일',
      target: '메일 발신',
      kind: 'TXT',
      host: `_dmarc.${clientDomain}`,
      value: `v=DMARC1; p=none; rua=mailto:${PLATFORM.dmarcReport}`,
      ttl: 3600,
      required: false,
      state: '없음',
      checkedAt: CHECKED_AT,
      purpose: 'SPF·DKIM 이 실패한 메일을 어떻게 다룰지 정하고, 결과를 보고받습니다.',
      ifMissing: '메일은 가지만, 누가 이 도메인을 사칭해 보내고 있는지 알 수 없습니다.',
      note: '`p=none` 으로 시작해 보고서를 먼저 봅니다. 처음부터 `reject` 로 두면 아직 등록 안 된 발신 서버의 메일이 그날로 전부 반송됩니다.',
    },
  ];
}

/** 넣어야 하는데 아직 안 들어간 것. 급한 정도를 세는 기준이라 화면과 요약이 같은 함수를 쓴다. */
export function brokenDns(records: readonly DnsRecord[]): DnsRecord[] {
  return records.filter((record) => record.required && record.state !== '확인됨');
}

/**
 * 국내 등록기관마다 **어디서 바꾸는지**가 다르다.
 *
 * 값을 만들어 주고도 "이걸 어디에 넣나요" 에서 통화가 한 번 더 생긴다. 화면에 적어 두면
 * 그 통화가 없어진다.
 */
export const REGISTRAR_GUIDE = [
  { name: '가비아', path: 'My가비아 > 서비스 관리 > 도메인 > DNS 관리' },
  { name: '후이즈', path: '마이후이즈 > 도메인 관리 > 네임서버/DNS 설정' },
  { name: '카페24', path: '나의서비스관리 > 도메인 > DNS 관리' },
  { name: 'Cloudflare', path: 'Websites > 도메인 > DNS > Records' },
] as const;

/* ── SSL 인증서 ────────────────────────────────────────────────────────
   DNS 와 한 화면에 두는 이유: **인증서는 DNS 로 발급받는다.** `_acme-challenge` 위임과
   CAA 가 맞아야 발급이 되고, 그 둘은 위 표에 있다. 화면을 나누면 "인증서가 왜 안 나오죠" 를
   물어보러 온 사람이 원인이 적힌 표를 보지 못한 채 돌아간다. */

export type CertState = '정상' | '갱신 임박' | '갱신 실패' | '없음';

export const CERT_TONE: Record<CertState, BadgeTone> = {
  정상: 'ok',
  '갱신 임박': 'wait',
  '갱신 실패': 'danger',
  없음: 'neutral',
};

export type Certificate = {
  id: string;
  /** 이 인증서가 덮는 이름들. 와일드카드면 `*.` 로 시작한다 */
  domains: string[];
  /** 발급한 곳 — CAA 에 적힌 곳과 같아야 한다 */
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  state: CertState;
  /** 자동 갱신을 켜 두었는가 */
  autoRenew: boolean;
  /** 어떤 방법으로 발급받는가 */
  method: 'DNS-01' | 'HTTP-01';
  note: string;
};

/**
 * 남은 날. 만료일만 적어 두면 며칠 남았는지를 사람이 세게 된다 —
 * 그 셈은 월말마다 틀리고, 틀리는 쪽은 언제나 "아직 여유 있다" 쪽이다.
 */
export function daysLeft(expiresAt: string, today: string): number {
  const to = Date.parse(`${expiresAt}T00:00:00Z`);
  const from = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(to) || Number.isNaN(from)) return 0;
  return Math.round((to - from) / 86_400_000);
}

/**
 * 그 고객사의 인증서.
 *
 * 90일짜리 인증서를 쓰고 만료 30일 전부터 자동으로 갱신한다. 갱신은 사람이 누르는 일이
 * 아니라 도는 일이므로, 이 화면이 답해야 하는 것은 **지금 도는가**와 **안 돌면 무엇 때문인가**
 * 둘뿐이다.
 */
export function defaultCertificates(clientDomain: string, adminDomain: string): Certificate[] {
  return [
    {
      id: 'cert-client',
      domains: [clientDomain, `www.${clientDomain}`, `*.${clientDomain}`],
      issuer: "Let's Encrypt",
      issuedAt: '2026-06-20',
      expiresAt: '2026-09-18',
      state: '정상',
      autoRenew: true,
      method: 'DNS-01',
      note: '와일드카드를 포함하므로 DNS-01 로만 발급됩니다.',
    },
    {
      id: 'cert-admin',
      domains: [adminDomain],
      issuer: "Let's Encrypt",
      issuedAt: '2026-05-09',
      expiresAt: '2026-08-07',
      state: '갱신 임박',
      autoRenew: true,
      method: 'DNS-01',
      note: '만료 30일 전부터 자동으로 갱신을 시도합니다.',
    },
  ];
}

/**
 * 인증서가 갱신되려면 무엇이 맞아야 하는가.
 *
 * 실패했을 때 볼 곳을 화면에 적어 둔다 — 여기 적힌 두 줄(`_acme-challenge` · `CAA`)이
 * 위 표의 어느 줄인지까지 이어 두면, 원인을 찾는 데 다른 화면을 열지 않아도 된다.
 */
export const CERT_REQUIREMENTS = [
  {
    recordId: 'acme-cname',
    label: '_acme-challenge 위임',
    why: '이 값이 우리 쪽을 가리켜야 인증서를 대신 받아 갱신합니다.',
  },
  {
    recordId: 'caa-issue',
    label: 'CAA 발급 허용',
    why: '다른 CA 만 적혀 있으면 우리 발급이 거부됩니다.',
  },
] as const;
