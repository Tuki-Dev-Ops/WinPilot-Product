/**
 * 국내 결제대행사(PG) 목록과 **대행사마다 다른 연동 값**.
 *
 * ## 왜 대행사마다 필드를 따로 두는가
 * 전에는 어느 대행사를 고르든 `상점 ID` 와 `비밀 키` 두 칸만 받았다. 그런데 실제로는
 * 대행사마다 받아야 하는 값의 **개수와 이름이 다르다.**
 *
 * - 토스페이먼츠 — 상점아이디 · 클라이언트 키 · 시크릿 키
 * - KG이니시스 — 상점아이디 · 웹표준결제 signkey · INIAPI Key · INIAPI IV (+ 정기결제면 INILite Key)
 * - NHN KCP — 사이트코드 · 사이트키 (+ 정기결제면 배치결제 그룹아이디)
 * - 나이스페이먼츠 — 상점아이디 · 머천트키 · 클라이언트 키 · 시크릿 키
 *
 * 두 칸으로 뭉뚱그리면 **이니시스의 signkey 를 넣을 자리가 없다.** 넣을 자리가 없으니
 * 화면에서 연동을 끝낼 수 없고, 결국 값이 어딘가 딴 데 적히기 시작한다.
 *
 * ## 이 표가 화면과 검증을 함께 만든다
 * 각 필드가 `required` 를 들고 있으므로 화면은 이 표를 읽어 **별표(*)를 스스로 붙이고**,
 * 저장할 때 같은 표로 검사한다. 필수 여부를 화면과 검사 두 곳에 적으면 반드시 어긋난다 —
 * 별표는 붙었는데 검사는 안 하거나, 그 반대가 된다.
 *
 * ## 출처
 * 필드 이름은 PortOne 채널 설정 문서와 각 대행사 개발자 문서를 대조해 적었다.
 * - https://help.portone.io/content/inicis (KG이니시스)
 * - https://help.portone.io/content/kcp_channel (NHN KCP)
 * - https://help.portone.io/content/kicc (이지페이)
 * - https://developers.nicepay.co.kr/ (나이스페이먼츠)
 * - https://developers.portone.io/opi/ko/integration/pg/v2/readme (지원 대행사 목록)
 *
 * **값의 이름은 대행사가 바꾼다.** 계약 화면에서 받은 이름과 다르면 이 표를 먼저 고친다.
 */

export type PgProviderId =
  | 'toss'
  | 'inicis'
  | 'kcp'
  | 'nice'
  | 'smartro'
  | 'ksnet'
  | 'kicc'
  | 'welcome'
  | 'kpn'
  | 'danal'
  | 'mobilians'
  | 'hecto'
  | 'payletter'
  | 'galaxia';

export type PgFieldSpec = {
  key: string;
  label: string;
  /** 입력란 안에 보이는 안내 — 값의 **생김새**를 적는다 (예: `IM` 으로 시작) */
  hint: string;
  required: boolean;
  /** 화면에 가리고 저장 값은 뒷자리만 보여줄지 */
  secret?: boolean;
  /** 어디서 발급받는지. 이것이 없으면 "이 값을 어디서 구하죠" 를 매번 묻는다 */
  note?: string;
  /** 정기결제를 쓸 때만 받는 값 */
  billingOnly?: boolean;
};

export type PgProvider = {
  id: PgProviderId;
  label: string;
  /** 어떤 곳인지 한 줄 — 고를 때 판단이 서야 한다 */
  note: string;
  fields: PgFieldSpec[];
};

/** 거의 모든 대행사가 첫 칸으로 받는 값. 이름만 대행사마다 다르다. */
const mid = (label: string, hint: string, note: string): PgFieldSpec => ({
  key: 'mid',
  label,
  hint,
  required: true,
  note,
});

export const PG_PROVIDERS: readonly PgProvider[] = [
  {
    id: 'toss',
    label: '토스페이먼츠',
    note: '연동 문서와 결제창이 가장 정돈되어 있습니다. 신규 구축에 무난합니다.',
    fields: [
      mid('상점아이디 (MID)', '예: tosspayments', '토스페이먼츠 상점관리자 > 상점 정보'),
      {
        key: 'clientKey',
        label: '클라이언트 키',
        hint: 'test_ck_ 또는 live_ck_ 로 시작',
        required: true,
        note: '개발자센터 > API 키. 결제창을 띄울 때 쓰는 공개 키입니다.',
      },
      {
        key: 'secretKey',
        label: '시크릿 키',
        hint: 'test_sk_ 또는 live_sk_ 로 시작',
        required: true,
        secret: true,
        note: '개발자센터 > API 키. 서버에서만 쓰며 절대 화면에 노출하지 않습니다.',
      },
    ],
  },
  {
    id: 'inicis',
    label: 'KG이니시스',
    note: '가맹점 수가 가장 많고 트래픽이 몰려도 안정적입니다. 값이 네 개로 가장 많습니다.',
    fields: [
      mid('PG상점아이디 (MID)', '예: INIpayTest', 'KG이니시스 상점관리자에서 발급'),
      {
        key: 'signKey',
        label: '웹표준결제 signkey',
        hint: '상점관리자에서 조회한 signkey',
        required: true,
        secret: true,
        note: 'KG이니시스 상점관리자 > 상점정보 > 계약정보에서 조회합니다.',
      },
      {
        key: 'apiKey',
        label: 'INIAPI Key',
        hint: '발급받은 INIAPI Key',
        required: true,
        secret: true,
        note: '취소·환불 같은 서버 API 호출에 씁니다.',
      },
      {
        key: 'apiIv',
        label: 'INIAPI IV',
        hint: '발급받은 초기화 벡터',
        required: true,
        secret: true,
        note: 'INIAPI Key 와 짝입니다. 한쪽만 넣으면 API 호출이 전부 실패합니다.',
      },
      {
        key: 'liteKey',
        label: 'INILite Key',
        hint: '정기결제용 키',
        required: true,
        secret: true,
        billingOnly: true,
        note: '정기결제(빌링)를 쓸 때만 필요합니다.',
      },
    ],
  },
  {
    id: 'kcp',
    label: 'NHN KCP',
    note: '해외 카드 결제가 안정적입니다. 상점아이디를 사이트코드라고 부릅니다.',
    fields: [
      mid('사이트코드', '예: T0000', 'NHN KCP 상점관리자에서 발급 (PG상점아이디에 해당)'),
      {
        key: 'siteKey',
        label: '사이트키',
        hint: '발급받은 사이트키',
        required: true,
        secret: true,
        note: '실 연동에만 필요합니다. 테스트 사이트코드에는 범용 키가 이미 붙어 있습니다.',
      },
      {
        key: 'groupId',
        label: '배치결제 그룹아이디',
        hint: '정기결제용 그룹 ID',
        required: true,
        billingOnly: true,
        note: '정기결제(배치결제)를 쓸 때만 필요합니다.',
      },
    ],
  },
  {
    id: 'nice',
    label: '나이스페이먼츠',
    note: '상위 4개사 중 하나입니다. 결제창용 키와 API용 키를 따로 받습니다.',
    fields: [
      mid('상점아이디 (MID)', '예: nictest04m', '나이스페이먼츠 가맹점관리자에서 발급'),
      {
        key: 'merchantKey',
        label: '머천트키',
        hint: '발급받은 가맹점 키',
        required: true,
        secret: true,
        note: '카드 정보를 암호화할 때 앞 16자리를 씁니다.',
      },
      {
        key: 'clientKey',
        label: '클라이언트 키',
        hint: '발급받은 clientId',
        required: true,
        note: 'API 인증(Basic) 의 앞부분입니다.',
      },
      {
        key: 'secretKey',
        label: '시크릿 키',
        hint: '발급받은 secretKey',
        required: true,
        secret: true,
        note: '클라이언트 키와 이어 붙여 Base64 로 인코딩해 인증합니다.',
      },
    ],
  },
  {
    id: 'kicc',
    label: '이지페이 (KICC)',
    note: '한국정보통신. 상점아이디가 `IM` 으로 시작합니다.',
    fields: [
      mid('상점아이디 (MID)', 'IM 으로 시작하는 값', '이지페이 계약 후 발급'),
      {
        key: 'cipherKey',
        label: '암복호화 키',
        hint: '발급받은 암복호화 키',
        required: false,
        secret: true,
        note: '해외결제를 쓸 때만 필요합니다. 국내 결제만 쓰면 비워 둡니다.',
      },
    ],
  },
  {
    id: 'smartro',
    label: '스마트로',
    note: '오프라인 단말 사업이 크고 온라인 결제도 함께 제공합니다.',
    fields: [
      mid('상점아이디 (MID)', '스마트로에서 발급한 MID', '스마트로 가맹점관리자에서 발급'),
      {
        key: 'merchantKey',
        label: '머천트키',
        hint: '발급받은 가맹점 키',
        required: true,
        secret: true,
        note: '결제 요청 서명에 씁니다.',
      },
    ],
  },
  {
    id: 'ksnet',
    label: 'KSNET',
    note: '밴(VAN)과 PG 를 함께 하는 곳입니다.',
    fields: [
      mid('상점아이디 (MID)', 'KSNET 에서 발급한 MID', 'KSNET 계약 후 발급'),
      {
        key: 'apiKey',
        label: 'API 키',
        hint: '발급받은 API 키',
        required: true,
        secret: true,
        note: '서버 API 호출에 씁니다.',
      },
    ],
  },
  {
    id: 'welcome',
    label: '웰컴페이먼츠',
    note: '이니시스 계열 연동 규격을 씁니다 — 받는 값도 비슷합니다.',
    fields: [
      mid('PG상점아이디 (MID)', '웰컴페이먼츠에서 발급', '웰컴페이먼츠 상점관리자에서 발급'),
      {
        key: 'signKey',
        label: 'signkey',
        hint: '상점관리자에서 조회',
        required: true,
        secret: true,
        note: '결제창 요청 서명에 씁니다.',
      },
      {
        key: 'apiKey',
        label: 'API 키',
        hint: '발급받은 API 키',
        required: true,
        secret: true,
        note: '취소·환불 API 에 씁니다.',
      },
      {
        key: 'apiIv',
        label: 'API IV',
        hint: '발급받은 초기화 벡터',
        required: true,
        secret: true,
        note: 'API 키와 짝입니다.',
      },
    ],
  },
  {
    id: 'kpn',
    label: '한국결제네트웍스 (KPN)',
    fields: [
      mid('상점아이디 (MID)', 'KPN 에서 발급', 'KPN 계약 후 발급'),
      {
        key: 'apiKey',
        label: 'API 키',
        hint: '발급받은 API 키',
        required: true,
        secret: true,
        note: '서버 API 호출에 씁니다.',
      },
    ],
    note: '중소 가맹점 대상 연동을 폭넓게 지원합니다.',
  },
  {
    id: 'hecto',
    label: '헥토파이낸셜',
    note: '옛 세틀뱅크. 계좌이체·가상계좌가 강합니다.',
    fields: [
      mid('상점아이디', '헥토파이낸셜에서 발급', '헥토파이낸셜 계약 후 발급'),
      {
        key: 'licenseKey',
        label: '라이센스 키',
        hint: '발급받은 라이센스 키',
        required: true,
        secret: true,
        note: '요청 서명에 씁니다.',
      },
      {
        key: 'cipherKey',
        label: '암호화 키',
        hint: '발급받은 AES 키',
        required: true,
        secret: true,
        note: '계좌 정보를 암호화할 때 씁니다.',
      },
    ],
  },
  {
    id: 'danal',
    label: '다날',
    note: '휴대폰 소액결제의 표준입니다. 카드 결제는 다른 대행사와 함께 씁니다.',
    fields: [
      mid('CPID', '다날에서 발급한 CPID', '다날 계약 후 발급'),
      {
        key: 'cipherKey',
        label: '암호화 키',
        hint: '발급받은 암호화 키',
        required: true,
        secret: true,
        note: '결제 요청 암호화에 씁니다.',
      },
    ],
  },
  {
    id: 'mobilians',
    label: 'KG모빌리언스',
    note: '휴대폰 결제. 다날과 함께 두 곳이 이 시장을 나눠 갖고 있습니다.',
    fields: [
      mid('서비스 ID', 'KG모빌리언스에서 발급', 'KG모빌리언스 계약 후 발급'),
      {
        key: 'cipherKey',
        label: '암호화 키',
        hint: '발급받은 암호화 키',
        required: true,
        secret: true,
        note: '결제 요청 암호화에 씁니다.',
      },
    ],
  },
  {
    id: 'payletter',
    label: '페이레터',
    note: '게임·디지털 콘텐츠 결제에 많이 쓰입니다.',
    fields: [
      mid('클라이언트 ID', '페이레터에서 발급', '페이레터 가맹점관리자에서 발급'),
      {
        key: 'apiKey',
        label: 'API 키',
        hint: '발급받은 API 키',
        required: true,
        secret: true,
        note: '결제 요청과 취소에 모두 씁니다.',
      },
    ],
  },
  {
    id: 'galaxia',
    label: '갤럭시아머니트리',
    note: '상품권·포인트 결제 연동이 함께 필요할 때 고릅니다.',
    fields: [
      mid('서비스 ID', '갤럭시아에서 발급', '갤럭시아머니트리 계약 후 발급'),
      {
        key: 'licenseKey',
        label: '라이센스 키',
        hint: '발급받은 라이센스 키',
        required: true,
        secret: true,
        note: '요청 서명에 씁니다.',
      },
    ],
  },
] as const;

export const PG_LABELS: Record<PgProviderId, string> = Object.fromEntries(
  PG_PROVIDERS.map((provider) => [provider.id, provider.label]),
) as Record<PgProviderId, string>;

export function findPgProvider(id: PgProviderId): PgProvider {
  const found = PG_PROVIDERS.find((provider) => provider.id === id);
  // 표에 없는 id 는 타입이 막지만, 시드가 바뀌는 동안 잠깐 어긋날 수 있다.
  if (!found) throw new Error(`모르는 결제대행사: ${id}`);
  return found;
}

/**
 * 지금 화면에서 **실제로 받아야 하는** 필드만 추린다.
 * 정기결제를 쓰지 않으면 `billingOnly` 필드는 묻지 않는다 — 쓰지 않는 값을 필수로 두면
 * 넣을 수 없는 값 때문에 저장이 막힌다.
 */
export function pgFieldsFor(provider: PgProvider, billing: boolean): PgFieldSpec[] {
  return provider.fields.filter((field) => !field.billingOnly || billing);
}

/**
 * 이 대행사에 **정기결제를 묻는 것이 뜻이 있는가**.
 *
 * 정기결제를 켜서 달라지는 것은 `billingOnly` 필드가 하나 더 나타나는 일뿐이다. 그런 필드가
 * 없는 대행사에서는 그 스위치가 **켜도 화면이 그대로**라, 눌러 본 사람이 무엇이 달라졌는지를
 * 찾게 된다. 지금 이니시스(INILite Key)와 KCP(배치결제 그룹아이디) 둘만 해당한다.
 *
 * 스위치를 지우는 것이 아니라 **묻는 곳을 줄이는 것**이다 — 다른 대행사가 정기결제 전용 키를
 * 요구하기 시작하면 그 대행사에 `billingOnly` 필드를 더하는 순간 스위치가 다시 나타난다.
 */
export function pgTakesBilling(provider: PgProvider): boolean {
  return provider.fields.some((field) => field.billingOnly);
}
