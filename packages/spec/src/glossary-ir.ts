import type { GlossaryEntry } from './glossary';

/**
 * IR 한 쌍이 쓰는 정규 용어. 나눠 둔 까닭은 `features-ir.ts` 머리말과 같다.
 *
 * 여기 없는 것은 `glossary.ts` 의 공용 표에 이미 있다 — `notice` · `news` · `faq` · `banner` ·
 * `popup` · `inquiry` · `milestone` · `profile` · `product` · `terms` · `privacy` · `seo` ·
 * `supplier` · `analytics` · `pageview` · `status` · `site` 가 그렇다. 같은 자원을 IR 에서만
 * 다른 이름으로 다시 등록하면 이 사전이 막으려던 표류가 그대로 돌아온다.
 */
export const IR_GLOSSARY: readonly GlossaryEntry[] = [
  // ── 회사 ────────────────────────────────────────────────────────────
  {
    canonical: 'credential',
    ko: '특허 및 인증',
    banned: ['certification', 'certificate', 'patent', 'award'],
    note: '등록번호로 밖에서 조회되는 값이다. 특허와 인증을 두 자원으로 나누지 않는 이유는 화면에서 하는 일(등록번호와 발급처를 적고 숨김을 켜고 끄는 것)이 같기 때문이다.',
  },

  // ── 파는 것 ─────────────────────────────────────────────────────────
  {
    canonical: 'solution',
    ko: '문제 · 해법',
    banned: ['usecase', 'approach'],
    /*
      이 낱말은 사전에 **빚으로** 올라온다. 콘솔의 `/solutions` 는 `/products` 와 같은 값을
      보면서 이름만 다르다(`apps/ir-admin/lib/navigation/ir-menu.ts` 머리말). 같은 것을 두
      이름으로 부르는 것이 바로 이 사전이 막으려던 일인데, 화면이 둘 다 살아 있으므로
      없는 척하지 않고 적어 둔다 — 한쪽을 지우는 날 이 항목도 함께 지운다.
    */
    note: '콘솔에만 있는 갈래. `product` 와 같은 값을 보므로 언젠가 한쪽으로 합쳐야 한다 — 그때까지 두 이름이 다른 화면을 가리킨다는 사실을 여기 남긴다.',
  },
  {
    canonical: 'service',
    ko: '서비스',
    banned: ['offering'],
    note: '사람이 현장에 가서 하는 일(컨설팅 · 인프라). 계약하면 그날부터 쓰는 클라우드(product)와 켜고 끌 수 있는지가 달라 갈래를 나눈다.',
  },
  /*
    파는 것 여섯의 이름.

    자원 유형이 아니라 **이름**이라 사전에 올리기가 껄끄럽지만, 사이트가 여섯 각각에 고정
    주소와 화면을 두었으므로(`/solutions/mes` 처럼) 이름 하나가 곧 화면 하나를 가리킨다.
    한 엔티티(`product`)로 묶으면 여섯 화면이 `ProductHomePage` 라는 한 이름을 갖게 되어,
    이름으로 화면을 찾는다는 이 레지스트리의 전제가 깨진다.

    금지어는 메뉴에 적히는 말에서 나온다 — `Cloud MES` 를 코드에서 `cloudMes` 로 쓰기
    시작하면 콘솔의 `/products/mes` 와 같은 것인지 기계가 알 수 없다.
  */
  {
    canonical: 'consulting',
    ko: '스마트 컨설팅',
    banned: ['smartconsulting', 'advisory'],
    note: '콘솔에서는 `/services/consulting` 이다 — 주소의 마지막 마디가 곧 이 이름이다.',
  },
  {
    canonical: 'infra',
    ko: '인프라 서비스',
    banned: ['infraservice', 'infrastructure'],
    note: '콘솔에서는 `/services/infra` 다.',
  },
  {
    canonical: 'mes',
    ko: 'Cloud MES',
    banned: ['cloudmes', 'manufacturing'],
    note: '콘솔에서는 `/products/mes` 다.',
  },
  {
    canonical: 'erp',
    ko: 'Cloud ERP',
    banned: ['clouderp', 'accounting'],
    note: '콘솔에서는 `/products/erp` 다.',
  },
  {
    canonical: 'crm',
    ko: 'Cloud CRM',
    banned: ['cloudcrm'],
    note: "콘솔에서는 `/products/crm` 이다. 'customer' 를 금지어로 두지 않는 이유는 그 낱말이 이미 user 에 묶여 있기 때문이다.",
  },
  {
    canonical: 'dxp',
    ko: 'Cloud DXP',
    banned: ['clouddxp', 'portal'],
    note: '콘솔에서는 `/products/dxp` 다.',
  },

  // ── 투자자에게 나가는 값 ────────────────────────────────────────────
  /*
    아래 여덟은 **사이트에만 화면이 있다.** 콘솔의 짝은 지워졌다(`features-ir.ts` 머리말).
    용어를 그대로 두는 이유: 화면이 사라진 것이지 값이 사라진 것이 아니고, 되살리는 날
    이 이름들이 그대로 쓰여야 두 번째 이름이 생기지 않는다.
  */
  {
    canonical: 'disclosure',
    ko: '공시',
    banned: ['dart', 'filing'],
    note: '나간 것만 사이트에 선다(`publicDisclosures()`). 상세는 주소로도 열리지 않는다 — 안 나간 공시가 주소로 읽히면 그것이 곧 미공개 정보 유출이다.',
  },
  {
    canonical: 'financial',
    ko: '재무정보',
    banned: ['financials', 'balance', 'earnings'],
    note: '분기별 요약 표. 원문 재무제표를 여기 옮겨 적지 않는다 — 두 벌이 되면 어느 쪽이 맞는지 화면으로 알 수 없다.',
  },
  {
    canonical: 'stock',
    ko: '주가',
    banned: ['share', 'ticker', 'quote'],
    note: '지연 시세다. 손으로 넣는 칸을 두지 않은 것은 뜻한 것이다 — 오타 하나가 투자자 화면의 시세가 되고, 바로잡는 일이 정정 공시가 된다.',
  },
  {
    canonical: 'dividend',
    ko: '배당',
    banned: ['payout'],
    note: '결산기마다 한 줄씩 쌓인다. 주가(stock)와 값의 출처가 달라 한 화면에 합치지 않는다.',
  },
  {
    canonical: 'meeting',
    ko: '주주총회',
    banned: ['agm', 'assembly'],
    note: '소집 통지와 안건. 열린 총회를 지우지 않는다 — 지난 안건이 다음 총회에서 근거로 쓰인다.',
  },
  {
    canonical: 'vote',
    ko: '전자투표',
    banned: ['voting', 'ballot', 'poll'],
    note: '표는 예탁결제원에서 던진다. 사이트의 화면은 어디로 가서 무엇을 준비하는지를 적는 자리라 총회(meeting)와 다른 자원이다 — 투표 단추를 흉내 내면 눌러 놓고 표가 들어간 줄 안다.',
  },
  {
    canonical: 'governance',
    ko: '지배구조',
    banned: ['shareholder', 'board', 'officer'],
    note: '이사회 구성과 주주 현황을 한 화면에서 본다. 둘을 나누면 사외이사 비율과 지분 구조를 나란히 볼 수 없다.',
  },
  {
    canonical: 'document',
    ko: 'IR 자료',
    banned: ['material', 'archive'],
    note: '사업보고서 · IR 발표자료처럼 내려받는 것. 공지(notice)와 달리 본문이 아니라 파일이 알맹이다.',
  },
  {
    canonical: 'schedule',
    ko: 'IR 일정',
    banned: ['calendar', 'agenda'],
    note: '실적 발표 · 기업설명회처럼 **날짜가 먼저 정해지는** 것. 지난 일정을 내리지 않는다 — 얼마나 자주 열었는지가 그 자체로 읽힌다.',
  },
  {
    canonical: 'subscriber',
    ko: '공시 구독자',
    banned: ['subscription', 'follower'],
    note: '새 공시를 메일로 받겠다고 남긴 사람. 회원(user)이 아니다 — 이 사이트에는 로그인이 없고 남기는 것은 메일 주소 하나뿐이다.',
  },

  // ── 그 밖 ───────────────────────────────────────────────────────────
  {
    canonical: 'direction',
    ko: '오시는 길',
    banned: ['location', 'map', 'access'],
    note: '지하철 · 버스 · 자가용 갈래로 적는다. 지도를 붙이지 않아 자원이 주소 문자열 하나로 남는다.',
  },
  {
    canonical: 'locale',
    ko: '국문 · 영문',
    banned: ['language', 'i18n', 'translation'],
    note: '같은 화면의 두 벌 원고를 짝지어 둔다. 콘솔에만 있고 아직 사이트로 나가지 않는다.',
  },
];
