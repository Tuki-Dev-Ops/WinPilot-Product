/**
 * 외식 프랜차이즈가 파는 것 — **메뉴 · 매장 · 창업**.
 *
 * ## 왜 세 갈래인가
 * 이 사이트에 오는 사람은 셋 중 하나다. 무엇을 파는지 보러 온 사람(메뉴), 어디서 먹을 수
 * 있는지 찾는 사람(매장), 그리고 **차리려는 사람**(창업). 앞의 둘은 손님이고 셋째는 점주다 —
 * 같은 브랜드를 보지만 묻는 것이 정반대다. 손님은 맛과 값을 묻고, 점주는 얼마가 들고 몇 달이
 * 걸리는지를 묻는다.
 *
 * 값을 한 파일에 두되 **모양은 나눠 둔다.** 한 모양에 담으면 메뉴에 `가맹비` 칸이 생기고,
 * 그 칸은 아무도 채우지 않은 채 화면마다 `?.` 를 하나씩 늘린다.
 *
 * ## 돈이 되는 것은 창업 문의다
 * 국내 외식 프랜차이즈 사이트를 보면 대개 메뉴가 가장 크고 창업이 맨 뒤 작은 글씨다. 그런데
 * 브랜드 사이트를 **끝까지 읽는 사람**은 대부분 차리려는 사람이다 — 손님은 배달앱과 지도앱에서
 * 이미 답을 얻는다. 그래서 여기서는 창업이 갈래 하나를 온전히 갖는다.
 *
 * ## 사진이 없다
 * 메뉴에 사진 주소를 두지 않았다. 프랜차이즈 사진은 촬영 · 보정 · 계절 교체가 따로 도는 일이라
 * 어드민에서 올리는 자리가 생기기 전에 주소만 만들어 두면 **깨진 그림이 메뉴판에 선다.** 지금은
 * 이름과 값과 설명으로 서고, 그림칸은 색으로 대신한다.
 */

/* ── 값을 글자로 ──────────────────────────────────────────────────── */

/**
 * 값 표기 규칙 — **사이트와 어드민이 같은 글자를 찍는다.**
 *
 * 계산 규칙을 이 패키지에 두는 것은 이미 정한 일이다(`index.ts` 머리말) — 규칙이 두 벌이면
 * 같은 메뉴가 어드민에서는 `10000원`, 손님 화면에서는 `10,000원` 으로 보인다. 값 표기도 같은
 * 종류의 규칙이라 여기 둔다.
 *
 * ## `toLocaleString()` 을 쓰지 않는 이유
 * 그 함수는 **읽는 사람의 지역 설정**을 따른다. 같은 값이 브라우저마다 다르게 찍히고, 서버에서
 * 미리 만든 글자와 브라우저가 만든 글자가 달라지면 React 가 그 자리를 다시 그린다. 메뉴판은
 * 값이 열몇 줄이라 그 깜빡임이 눈에 보인다.
 */

/** 세 자리마다 쉼표. 단위는 붙이지 않는다 — 붙이는 자리가 저마다 다르다. */
function comma(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 메뉴 값 — 원 단위. `10000` → `10,000원` */
export function formatPrice(won: number): string {
  return `${comma(won)}원`;
}

/**
 * 창업 비용 — 만원 단위.
 *
 * `8900` 을 그대로 두면 만원인지 원인지 읽는 사람이 정해야 한다. 억이 넘어가면
 * `1억 2,300만원` 처럼 끊는 것이 국내에서 값을 말하는 방식이라 그대로 따른다.
 */
export function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok === 0) return `${comma(rest)}만원`;
  if (rest === 0) return `${eok}억원`;
  return `${eok}억 ${comma(rest)}만원`;
}

/* ── 브랜드 ───────────────────────────────────────────────────────── */

export type FnbBrand = {
  name: string;
  nameEn: string;
  /** 한 줄로 말하는 우리 — 첫 화면과 푸터가 같이 읽는다 */
  tagline: string;
  ceo: string;
  businessNumber: string;
  address: string;
  /** 손님 문의. 창업 문의와 번호를 나눠 두는 것은 받는 사람이 다르기 때문이다 */
  phone: string;
  /** 창업 상담 창구 — 이 번호로 오는 전화는 전부 점주 후보다 */
  franchisePhone: string;
  email: string;
  privacyOfficer: string;
  /** 브랜드를 시작한 해. 연혁 대신 숫자 하나로 두는 것은 화면이 그것만 쓰기 때문이다 */
  foundedYear: string;
};

/**
 * ## 이름이 값에만 있다
 * 화면 어디에도 브랜드명을 글자로 적지 않는다. 한 번 바꿔 봤기 때문에 안다 — 국밥 브랜드에서
 * 이 이름으로 옮길 때 **화면에 박아 둔 글자가 남는 자리**가 실제로 있었다(푸터처럼 아래로
 * 내려가야 보이는 곳).
 *
 * ## 숫자와 주소는 자리표시자다
 * 사업자등록번호 · 주소 · 전화는 아직 실제 값이 아니다. `000` 으로 두는 것은 **정해진 척하는
 * 값보다 낫기** 때문이다 — 그럴듯한 번호를 적어 두면 그것이 진짜인 줄 알고 아무도 안 고친다.
 */
export const FNB_BRAND: FnbBrand = {
  name: '어쭈구리왕문어',
  nameEn: 'EOJJUGURI',
  tagline: '통문어 한 마리, 그날 삶아 냅니다',
  ceo: '정현우',
  businessNumber: '000-00-00000',
  address: '전라북도 군산시 조촌동 000, 000호',
  phone: '063-000-0000',
  franchisePhone: '1600-0000',
  email: 'hello@example.com',
  privacyOfficer: '정현우',
  foundedYear: '2019',
};

/* ── 패밀리사이트 ─────────────────────────────────────────────────── */

/**
 * 같은 회사가 가진 다른 사이트.
 *
 * ## 왜 푸터의 접힌 목록인가
 * 헤더에 두면 **나가는 길**이 들어온 길과 같은 층에 선다. 여기 온 사람의 대부분은 이 브랜드를
 * 보러 왔고, 다른 사이트로 갈 사람은 이미 그것을 찾으러 내려온 사람이다.
 *
 * 펼쳐 두지 않고 접는 이유도 같다 — 셋을 늘 세워 두면 푸터의 마지막 줄이 **떠나는 링크**로 끝난다.
 *
 * ## `href` 가 밖으로 나간다
 * 전부 다른 도메인이다. 새 탭으로 열고 `rel` 을 붙이는 것은 화면이 맡는다 — 목록에 그 규칙을
 * 적어 두면 항목마다 빠뜨릴 수 있다.
 *
 * 주소는 `example.com` 으로 둔다. 이 레포가 아직 정해지지 않은 값에 쓰는 자리표시자이고
 * (`hello@example.com` · `02-0000-0000` 과 같다), **정해진 척하는 주소보다 낫다.**
 */
export type FamilySite = {
  id: string;
  name: string;
  /** 밖으로 나가는 주소. 정해지지 않은 것은 자리표시자로 둔다 */
  href: string;
  /** 무엇을 하는 사이트인지 한 마디 — 이름만으로는 갈지 말지 정하지 못한다 */
  note: string;
};

export const FAMILY_SITES: FamilySite[] = [
  { id: 'corp', name: '기업 홈페이지', href: 'https://example.com', note: '회사 소개 · 투자 정보' },
  { id: 'shop', name: '온라인몰', href: 'https://example.com', note: '밀키트 · 선물세트' },
  { id: 'recruit', name: '인재 채용', href: 'https://example.com', note: '본사 · 매장 채용' },
];

/* ── 메뉴 ─────────────────────────────────────────────────────────── */

/**
 * 메뉴판의 묶음.
 *
 * 묶음 없이 스물몇 개를 한 줄로 세우면 **고르는 화면이 아니라 읽는 화면**이 된다. 실제로
 * 손님이 먼저 정하는 것은 개별 메뉴가 아니라 "숙회냐 볶음이냐" 다.
 */
export type MenuCategory = {
  id: string;
  name: string;
  /** 이 묶음이 무엇인지 한 줄. 메뉴판의 묶음 제목 아래에 선다 */
  note: string;
};

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'sukhoe', name: '문어숙회', note: '주문을 받고 삶습니다. 나오는 데 십 분쯤 걸립니다.' },
  { id: 'main', name: '문어요리', note: '볶고 굽고 튀깁니다. 다리 굵기가 다른 것을 씁니다.' },
  { id: 'soup', name: '탕 · 라면', note: '문어 삶은 물을 버리지 않고 그대로 씁니다.' },
  { id: 'side', name: '곁들임', note: '나눠 먹기 좋은 크기로 냅니다.' },
  { id: 'drink', name: '음료 · 주류', note: '문어와 같이 드시기 좋은 것들.' },
];

/**
 * 메뉴 한 가지.
 *
 * ## `visible` 을 두는 이유
 * 계절 메뉴와 품절이 실제로 생긴다. 그때 줄을 지우면 **다시 팔 때 처음부터 다시 적어야** 하고,
 * 지난달에 무엇을 팔았는지도 사라진다. 내려 두면 사이트에서만 사라지고 값은 남는다.
 *
 * ## 알레르기를 `string[]` 으로 받는다
 * 표시 의무가 있는 항목이고, 빠뜨리면 손님이 다치는 값이다. 문장으로 적게 두면 `우유 조금`
 * 같은 말이 들어가는데 그것은 **검색도 대조도 되지 않는다.**
 */
export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  /** 원 단위. 화면이 세 자리마다 쉼표를 넣으므로 여기서는 숫자로만 둔다 */
  price: number;
  /** 한 줄 설명 — 무엇이 들었는지가 아니라 **어떤 맛인지**를 적는다 */
  description: string;
  kcal: number;
  /** 표시 의무가 있는 알레르기 유발 재료 */
  allergens: string[];
  /** `인기` · `신메뉴` 처럼 줄에 붙는 표. 없으면 빈 배열 */
  tags: string[];
  /**
   * 매운 정도 — **1 · 2 · 3**. 안 매운 것은 없다(`undefined`).
   *
   * ## 왜 표에서 뺐나
   * 한때 `매운맛` 이라는 표를 `tags` 에 넣어 두었다. 그 말은 **맵다는 것만** 말하고 얼마나
   * 매운지는 말하지 않는다 — 얼큰문어탕과 문어초무침이 같은 표를 달고 있었는데 실제로는 한
   * 단계 차이가 난다. 그 차이가 못 먹는 사람에게는 시킬지 말지를 가르는 값이다.
   *
   * 0 을 두지 않고 `undefined` 로 비우는 이유: `0단계`는 뜻이 없다. 안 매운 것은 매운 정도를
   * **갖지 않는** 것이지 0 인 것이 아니고, 그래야 화면이 `spicy ? ... : null` 한 줄로 끝난다.
   */
  spicy?: 1 | 2 | 3;
  /** 사이트 메뉴판에 세울지. 품절과 계절 메뉴가 여기서 갈린다 */
  visible: boolean;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'sukhoe-whole',
    categoryId: 'sukhoe',
    name: '통문어숙회 (대)',
    price: 68000,
    description: '한 마리를 통째로 삶아 그대로 냅니다. 서넛이 나눠 드시기 좋습니다.',
    kcal: 520,
    allergens: ['문어'],
    tags: ['인기'],
    visible: true,
  },
  {
    id: 'sukhoe-half',
    categoryId: 'sukhoe',
    name: '통문어숙회 (중)',
    price: 45000,
    description: '둘이 드시기 좋은 크기입니다. 다리와 머리를 같이 냅니다.',
    kcal: 340,
    allergens: ['문어'],
    tags: ['인기'],
    visible: true,
  },
  {
    id: 'sukhoe-leg',
    categoryId: 'sukhoe',
    name: '문어다리숙회',
    price: 26000,
    description: '굵은 다리만 골라 삶습니다. 혼자 오셔도 부담 없는 양입니다.',
    kcal: 210,
    allergens: ['문어'],
    tags: [],
    visible: true,
  },
  {
    id: 'main-bokkeum',
    categoryId: 'main',
    name: '문어볶음',
    price: 32000,
    description: '센 불에 빠르게 볶아 질겨지지 않게 합니다. 밥을 볶아 드셔도 됩니다.',
    kcal: 610,
    allergens: ['문어', '대두', '밀'],
    tags: ['인기'],
    spicy: 2,
    visible: true,
  },
  {
    id: 'main-gui',
    categoryId: 'main',
    name: '문어버터구이',
    price: 29000,
    description: '겉만 그을리고 속은 그대로 둡니다. 아이도 드실 수 있습니다.',
    kcal: 540,
    allergens: ['문어', '우유'],
    tags: [],
    visible: true,
  },
  {
    id: 'main-kkochi',
    categoryId: 'main',
    name: '문어꼬치 (3꼬치)',
    price: 15000,
    description: '숯에 올려 굽습니다. 먼저 나오는 것이라 기다리는 동안 드시기 좋습니다.',
    kcal: 320,
    allergens: ['문어', '대두'],
    tags: ['신메뉴'],
    visible: true,
  },
  {
    id: 'main-twigim',
    categoryId: 'main',
    name: '문어튀김',
    price: 22000,
    description: '반죽을 얇게 입혀 튀깁니다. 소금 없이 그대로 드셔 보세요.',
    kcal: 660,
    allergens: ['문어', '밀', '계란'],
    tags: [],
    visible: true,
  },
  {
    id: 'soup-tang',
    categoryId: 'soup',
    name: '문어연포탕',
    price: 38000,
    description: '삶은 물을 버리지 않고 그대로 씁니다. 무와 미나리만 넣습니다.',
    kcal: 380,
    allergens: ['문어'],
    tags: ['인기'],
    visible: true,
  },
  {
    id: 'soup-spicy',
    categoryId: 'soup',
    name: '얼큰문어탕',
    price: 38000,
    description: '고춧가루를 기름에 볶아 넣어 텁텁하지 않게 맵습니다.',
    kcal: 420,
    allergens: ['문어', '대두'],
    tags: [],
    spicy: 3,
    visible: true,
  },
  {
    id: 'soup-ramen',
    categoryId: 'soup',
    name: '문어라면',
    price: 9000,
    description: '숙회를 드신 뒤에 시키는 분이 많습니다. 다리 한 토막이 들어갑니다.',
    kcal: 520,
    allergens: ['문어', '밀', '계란'],
    tags: [],
    spicy: 1,
    visible: true,
  },
  {
    id: 'side-jeon',
    categoryId: 'side',
    name: '문어전',
    price: 16000,
    description: '주문을 받고 부칩니다. 나오는 데 십 분쯤 걸립니다.',
    kcal: 480,
    allergens: ['문어', '밀', '계란'],
    tags: [],
    visible: true,
  },
  {
    id: 'side-muchim',
    categoryId: 'side',
    name: '문어초무침',
    price: 18000,
    description: '초고추장을 따로 냅니다. 찍어 드시는 만큼만 쓰세요.',
    kcal: 260,
    allergens: ['문어', '대두'],
    tags: [],
    spicy: 1,
    visible: true,
  },
  {
    id: 'side-gyeran',
    categoryId: 'side',
    name: '계란찜',
    price: 8000,
    description: '매운 것 드시는 분 옆에 하나 두시면 좋습니다.',
    kcal: 220,
    allergens: ['계란', '우유'],
    tags: [],
    visible: true,
  },
  {
    id: 'side-cold',
    categoryId: 'side',
    name: '문어냉채',
    price: 24000,
    description: '여름에만 냅니다. 겨자를 조금 섞은 소스와 같이 드세요.',
    kcal: 190,
    allergens: ['문어', '겨자'],
    tags: [],
    visible: false,
  },
  {
    id: 'drink-soju',
    categoryId: 'drink',
    name: '소주',
    price: 5000,
    description: '지역마다 그 지역 것을 냅니다.',
    kcal: 0,
    allergens: [],
    tags: [],
    visible: true,
  },
  {
    id: 'drink-beer',
    categoryId: 'drink',
    name: '생맥주 (500ml)',
    price: 5500,
    description: '잔을 얼려 둡니다.',
    kcal: 0,
    allergens: ['밀'],
    tags: [],
    visible: true,
  },
  {
    id: 'drink-sikhye',
    categoryId: 'drink',
    name: '식혜',
    price: 3000,
    description: '직접 삭혀 답니다. 덜 답니다.',
    kcal: 140,
    allergens: [],
    tags: [],
    visible: true,
  },
];

/** 사이트 메뉴판에 서는 것만. 내려 둔 것은 값이 남되 손님에게는 없는 메뉴다. */
export function publicMenuItems(): MenuItem[] {
  return MENU_ITEMS.filter((one) => one.visible);
}

export function findMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((one) => one.id === id);
}

export function findMenuCategory(id: string): MenuCategory | undefined {
  return MENU_CATEGORIES.find((one) => one.id === id);
}

/* ── 매장 ─────────────────────────────────────────────────────────── */

/**
 * 매장 하나.
 *
 * ## 상태를 세 가지로 두는 이유
 * `영업중` 만 두고 나머지를 지우면, **곧 여는 매장**을 알릴 자리가 없어진다. 그 소식이 실제로
 * 가장 많이 찾는 값이다 — 우리 동네에 언제 생기나. `준비중` 을 두면 주소와 여는 달만 적어
 * 두고 전화번호는 비울 수 있다.
 *
 * `휴점` 은 지우지 않고 남긴다. 지도앱에는 남아 있어 손님이 찾아가므로, 사이트에서만 사라지면
 * 헛걸음이 그대로 생긴다.
 */
export type Store = {
  id: string;
  name: string;
  /** 매장 찾기의 거르개가 이 값으로 나뉜다 */
  region: string;
  address: string;
  /** `준비중` 인 매장은 비운다 — 없는 번호를 적어 두면 그리로 전화가 간다 */
  phone: string;
  /** `11:00 – 22:00` 처럼. 매장마다 달라 문장으로 받는다 */
  hours: string;
  /** 주차 · 포장 · 배달처럼 찾아가기 전에 확인하는 것들 */
  features: string[];
  state: '영업중' | '준비중' | '휴점';
  /** `2024-03` — 연 · 월까지만. 날짜까지 적으면 준비중 매장에 없는 값을 지어내게 된다 */
  openedOn: string;
  /**
   * 지도에 표식을 찍을 자리 — 위도 · 경도.
   *
   * ## 왜 주소를 지오코딩하지 않나
   * 카카오 지도에는 주소를 좌표로 바꿔 주는 기능이 있다. 그것을 화면에서 부르면 **매장 수만큼
   * 요청이 나가고**, 하나라도 실패하면 그 표식만 조용히 사라진다 — 사라진 것을 알아차리는 때는
   * 손님이 "우리 동네 매장이 지도에 없다" 고 말할 때다.
   *
   * 좌표는 매장을 등록할 때 한 번 정해지는 값이다. 값으로 들고 있으면 지도가 무엇을 하든
   * 표식은 늘 같은 자리에 선다.
   *
   * ## 지금 값은 **동네 수준**이다
   * 주소가 자리표시자라(`왕십리로 000`) 건물 단위로 정확할 수가 없다. 그 동네의 좌표를 적어
   * 두었고, 실제 매장이 등록되면 그때 정확한 좌표로 바뀐다.
   */
  lat: number;
  lng: number;
};

export const STORES: Store[] = [
  {
    id: 'gunsan',
    name: '군산 본점',
    region: '전라',
    address: '전라북도 군산시 조촌동 000',
    phone: '02-0000-0001',
    hours: '10:30 – 22:00',
    features: ['포장', '배달', '단체석'],
    state: '영업중',
    openedOn: '2019-04',
    lat: 37.5636,
    lng: 127.0369,
  },
  {
    id: 'yeoksam',
    name: '역삼점',
    region: '서울',
    address: '서울특별시 강남구 테헤란로 000',
    phone: '02-0000-0002',
    hours: '10:00 – 22:00',
    features: ['포장', '배달'],
    state: '영업중',
    openedOn: '2020-09',
    lat: 37.5006,
    lng: 127.0364,
  },
  {
    id: 'mapo',
    name: '마포점',
    region: '서울',
    address: '서울특별시 마포구 양화로 000',
    phone: '02-0000-0003',
    hours: '11:00 – 23:00',
    features: ['포장', '주차', '단체석'],
    state: '영업중',
    openedOn: '2021-06',
    lat: 37.5559,
    lng: 126.9145,
  },
  {
    id: 'bundang',
    name: '분당정자점',
    region: '경기',
    address: '경기도 성남시 분당구 정자일로 000',
    phone: '031-000-0004',
    hours: '10:30 – 22:00',
    features: ['포장', '배달', '주차'],
    state: '영업중',
    openedOn: '2022-03',
    lat: 37.366,
    lng: 127.108,
  },
  {
    id: 'suwon',
    name: '수원영통점',
    region: '경기',
    address: '경기도 수원시 영통구 봉영로 000',
    phone: '031-000-0005',
    hours: '10:30 – 21:30',
    features: ['포장', '주차'],
    state: '영업중',
    openedOn: '2023-05',
    lat: 37.2496,
    lng: 127.0713,
  },
  {
    id: 'daejeon',
    name: '대전둔산점',
    region: '충청',
    address: '대전광역시 서구 둔산로 000',
    phone: '042-000-0006',
    hours: '11:00 – 22:00',
    features: ['포장', '배달', '주차'],
    state: '영업중',
    openedOn: '2023-11',
    lat: 36.3512,
    lng: 127.3845,
  },
  {
    id: 'busan',
    name: '부산서면점',
    region: '경상',
    address: '부산광역시 부산진구 중앙대로 000',
    phone: '051-000-0007',
    hours: '10:00 – 23:00',
    features: ['포장', '배달', '단체석'],
    state: '영업중',
    openedOn: '2024-02',
    lat: 35.1578,
    lng: 129.0594,
  },
  {
    id: 'gwangju',
    name: '광주상무점',
    region: '전라',
    address: '광주광역시 서구 상무중앙로 000',
    phone: '',
    hours: '준비 중',
    features: ['주차'],
    state: '준비중',
    openedOn: '2026-09',
    lat: 35.152,
    lng: 126.851,
  },
  {
    id: 'incheon',
    name: '인천송도점',
    region: '경기',
    address: '인천광역시 연수구 컨벤시아대로 000',
    phone: '032-000-0009',
    hours: '휴점',
    features: [],
    state: '휴점',
    openedOn: '2022-08',
    lat: 37.3894,
    lng: 126.639,
  },
];

/**
 * 매장 찾기의 지역 거르개.
 *
 * 목록에서 뽑아낸다. 손으로 적어 두면 새 지역에 매장이 생기는 날 **그 매장만 어느 거르개로도
 * 걸리지 않고**, 목록이 짧아진 것은 빠뜨렸다는 표시로 보이지 않는다.
 */
export const STORE_REGIONS: string[] = [...new Set(STORES.map((one) => one.region))];

export function findStore(id: string): Store | undefined {
  return STORES.find((one) => one.id === id);
}

/** 손님에게 보이는 매장 — 휴점은 뺀다. 준비중은 남긴다(그쪽 머리말). */
export function publicStores(): Store[] {
  return STORES.filter((one) => one.state !== '휴점');
}

/**
 * 새로 여는 · 새로 연 매장 — 홈의 `GRAND OPEN` 칸이 쓴다.
 *
 * ## 차례를 여기서 세운다
 * 개점 시기가 늦은 것부터다. 준비중 매장은 개점 시기가 앞날이라 **저절로 맨 앞에 선다** —
 * `준비중을 먼저` 라는 규칙을 따로 두지 않는 이유가 그것이다. 규칙이 둘이 되면 준비중이면서
 * 개점일이 지난 매장(공사가 밀린 곳)에서 둘이 다투게 된다.
 *
 * 휴점은 `publicStores()` 가 이미 뺐다. 문 닫은 매장이 `GRAND OPEN` 옆에 서는 일은 없다.
 *
 * ## 몇 곳까지 보일지는 화면이 정한다
 * 여기서 자르면 `왜 다섯인가` 라는 물음이 값 쪽에 남는다. 그 수는 굴림판 한 줄에 몇 장이
 * 들어가느냐의 문제라 화면의 것이다.
 */
export function newestStores(): Store[] {
  return publicStores().sort((a, b) => b.openedOn.localeCompare(a.openedOn));
}

/**
 * 지금 문을 연 매장 — **`지금 N곳` 이라 적는 자리가 쓴다.**
 *
 * `publicStores()` 와 갈린다. 저쪽은 매장 목록에 세울 것(준비중 포함)이고 이쪽은 **오늘 가서
 * 먹을 수 있는 곳**이다. 홈과 브랜드 두 화면이 `state === '영업중'` 을 각각 적고 있었는데,
 * 준비중을 세는지 마는지는 셋 다(목록 · 홈 · 브랜드) 같은 답이어야 하는 물음이라 여기서 정한다.
 */
export function openStores(): Store[] {
  return STORES.filter((one) => one.state === '영업중');
}

/* ── 인테리어 ─────────────────────────────────────────────────────── */

/**
 * 인테리어 평당 단가(만원).
 *
 * **이 숫자 하나에서 둘이 나온다** — 평형별 공사비와 창업 비용표의 인테리어 줄. 두 곳에 각각
 * 적어 두면 단가가 오르는 날 한쪽만 고쳐지고, 그러면 같은 사이트 안에서 인테리어 값이 두
 * 가지가 된다. 그 어긋남은 두 화면을 나란히 열어야만 보인다.
 */
export const INTERIOR_PER_PYEONG = 450;

/**
 * 평형별 인테리어 안.
 *
 * ## 왜 컨셉이 아니라 평형으로 나누나
 * 인테리어 소개를 `모던` · `내추럴` 처럼 컨셉으로 나눈 사이트가 많다. 그런데 자리를 보고 있는
 * 사람이 묻는 것은 취향이 아니라 **내 평수에 얼마가 드느냐**다 — 컨셉은 계약하고 도면을 그릴
 * 때 정하는 것이고, 그때는 이 화면을 보지 않는다.
 *
 * 좌석 수를 함께 적는 이유: 평수만으로는 **하루에 몇 번 돌릴 수 있는지**를 셀 수 없다. 그 값이
 * 매출 계산의 시작이라, 상담 전에 스스로 두들겨 보는 사람이 실제로 많다.
 */
export type InteriorPlan = {
  id: string;
  name: string;
  /** 평. 공사비가 평당으로 매겨지므로 ㎡ 가 아니라 이쪽이 값의 기준이다 */
  pyeong: number;
  seats: number;
  /** 공사에 걸리는 주. 창업 절차의 `공사 · 교육` 단계와 같은 값을 봐야 한다 */
  weeks: number;
  desc: string;
  /** 어떤 자리에 맞는지 — 읽는 사람이 자기 자리를 여기서 찾는다 */
  fits: string[];
};

export const INTERIOR_PLANS: InteriorPlan[] = [
  {
    id: 'basic',
    name: '기본형',
    pyeong: 10,
    seats: 16,
    weeks: 4,
    desc: '주방을 최소로 잡고 좌석을 벽으로 붙입니다. 혼자 오시는 손님이 많은 자리에 맞습니다.',
    fits: ['오피스 상권', '역세권 이면', '1인 운영'],
  },
  {
    id: 'wide',
    name: '확장형',
    pyeong: 20,
    seats: 32,
    weeks: 5,
    desc: '4인석을 가운데 두고 단체석을 하나 냅니다. 지금 매장의 절반이 이 크기입니다.',
    fits: ['주거 상권', '점심 회식', '2인 운영'],
  },
  {
    id: 'road',
    name: '로드샵',
    pyeong: 30,
    seats: 48,
    weeks: 6,
    desc: '주차와 단체석을 함께 둡니다. 저녁 매출이 점심을 넘는 자리에 씁니다.',
    fits: ['대로변 1층', '주차 필요', '저녁 장사'],
  },
];

/** 평형별 공사비(만원). 평당 단가 하나에서 계산한다 — 표에 적어 두지 않는다. */
export function interiorCost(plan: InteriorPlan): number {
  return plan.pyeong * INTERIOR_PER_PYEONG;
}


/* ── 마케팅 ───────────────────────────────────────────────────────── */

/**
 * 브랜드가 말을 거는 창구.
 *
 * ## 왜 둘뿐인가
 * 있는 만큼만 적는다. 흔히 인스타 · 블로그 · 유튜브 · 카카오채널을 나란히 걸어 두는데, 그중
 * 절반이 글 셋에서 멈춰 있다. **비어 있는 창구는 없는 창구보다 나쁘다** — 눌러 본 사람이 이
 * 브랜드가 관리를 안 한다고 읽는다. 실제로 도는 곳이 생기면 그때 늘린다.
 *
 * ## 주소도 계정 이름도 갖고 있지 않다
 * 계정 주소를 값으로 적어 두면 아직 열지 않은 계정으로 사람을 보내게 되고, 그것은 **깨진 링크가
 * 아니라 남의 계정으로 가는 링크**라 더 나쁘다.
 *
 * 링크 없이 계정 이름만 적어 두는 것도 그만뒀다. 화면에서는 그것이 **누를 수 없는 주소**로
 * 보였다 — 적어 둔 쪽은 정보를 하나 더 준 셈이지만, 읽는 쪽은 눌리지 않는 것을 하나 만난다.
 * 계정이 열리는 날 `url` 한 줄이 늘고, 그때 이름도 함께 선다.
 */
export type MarketingChannel = {
  id: string;
  name: string;
  /** 무엇을 올리는 곳인지 — 고른 창구의 글 위에 한 줄로 선다 */
  note: string;
};

export const MARKETING_CHANNELS: MarketingChannel[] = [
  {
    id: 'instagram',
    name: '인스타그램',
    note: '그날 들어온 문어와 새로 나온 메뉴를 올립니다.',
  },
  {
    id: 'blog',
    name: '네이버 블로그',
    note: '개점 소식과 창업하신 분들의 이야기를 깁니다.',
  },
];

/**
 * 창구에 올라간 글 하나.
 *
 * ## 사진 주소를 갖고 있지 않다
 * 메뉴 카드와 같은 까닭이다(`MenuCard` 머리말) — 촬영과 교체가 따로 도는 일이라, 어드민에서
 * 올리는 자리가 생기기 전에 주소만 만들어 두면 **깨진 그림이 화면에 선다.** 지금은 제목 첫
 * 글자를 큰 글씨로 두는 자리(`PhotoSlot`)로 대신한다.
 *
 * ## 날짜를 적는다
 * 마케팅 창구에서 가장 먼저 재는 것이 **최근 것이 있는가**이다. 날짜가 없으면 잘 도는 계정과
 * 반년 멈춘 계정이 같아 보인다.
 */
export type MarketingPost = {
  id: string;
  /** 어느 창구의 글인가 — `MARKETING_CHANNELS` 의 `id` */
  channelId: string;
  title: string;
  desc: string;
  postedOn: string;
  visible: boolean;
};

export const MARKETING_POSTS: MarketingPost[] = [
  {
    id: 'MP-01',
    channelId: 'instagram',
    title: '오늘 들어온 문어',
    desc: '새벽 경매에서 받아 옵니다. 그날 들어온 것만 그날 씁니다.',
    postedOn: '2026-08-05',
    visible: true,
  },
  {
    id: 'MP-02',
    channelId: 'instagram',
    title: '문어냉채, 8월까지',
    desc: '여름에만 내는 메뉴입니다. 이번 달이 지나면 내년 6월에 다시 만납니다.',
    postedOn: '2026-07-28',
    visible: true,
  },
  {
    id: 'MP-03',
    channelId: 'instagram',
    title: '아기 의자 있습니다',
    desc: '전 매장에 둡니다. 덜 맵게 해 달라고 하시면 그렇게 냅니다.',
    postedOn: '2026-07-15',
    visible: true,
  },
  {
    id: 'MP-04',
    channelId: 'blog',
    title: '광주 상무점, 9월에 엽니다',
    desc: '전라권 첫 매장입니다. 자리를 고르고 도면을 그리기까지 넉 달이 걸렸습니다.',
    postedOn: '2026-07-22',
    visible: true,
  },
  {
    id: 'MP-05',
    channelId: 'blog',
    title: '첫 장사인 분들이 가장 많이 묻는 것',
    desc: '경험이 없어도 되는지, 교육은 얼마나 받는지. 상담에서 실제로 나온 물음만 추렸습니다.',
    postedOn: '2026-07-02',
    visible: true,
  },
  {
    id: 'MP-06',
    channelId: 'blog',
    title: '여섯 평 주방에서 하루 이백 그릇',
    desc: '역삼점 점주님의 하루를 따라다녔습니다. 동선을 어떻게 짜셨는지가 대부분이었습니다.',
    postedOn: '2026-06-18',
    visible: true,
  },
];

/**
 * 그 창구에 걸린 글 — 새것부터.
 *
 * 차례를 화면이 세우지 않고 여기서 세운다. 창구가 둘이라 두 화면이 아니라 한 화면이 두 번
 * 부르는데, 그 둘이 다른 차례로 서면 창구를 바꿀 때마다 눈이 다시 위에서부터 훑는다.
 */
export function postsOfChannel(channelId: string): MarketingPost[] {
  return MARKETING_POSTS.filter((one) => one.visible && one.channelId === channelId).sort((a, b) =>
    b.postedOn.localeCompare(a.postedOn),
  );
}

/**
 * 인테리어 사진 칸.
 *
 * ## 사진이 아니라 **자리**를 정해 둔다
 * 아직 사진이 없다(`PhotoSlot`). 그런데 사진이 생긴 다음에 자리를 만들면 그때 화면 배치를 다시
 * 짜야 하고, 그 일은 늘 촬영이 끝난 뒤 급하게 벌어진다. 무엇을 찍어야 하는지를 먼저 적어 두면
 * 촬영 목록이 곧 이 목록이 된다.
 *
 * ## 크기를 값으로 갖지 않는다
 * 어느 칸이 크고 어느 칸이 긴지는 **화면이 정한다**(`PhotoMosaic`). 여기에 `big` · `wide` 를
 * 적어 두면 사진 하나를 더할 때마다 격자가 어떻게 채워지는지를 머리로 그려 봐야 하고, 한 칸을
 * 지우면 그 아래가 통째로 어긋난다.
 *
 * ## 설명을 짧게 적는다
 * 사진 위에 얹히는 글이라 길면 사진을 덮는다. 무엇을 찍은 것인지 한 마디면 된다 — 왜 그렇게
 * 지었는지는 평형별 안의 설명이 이미 말하고 있다.
 */
export type InteriorShot = { id: string; name: string; note: string };

export const INTERIOR_GALLERY: InteriorShot[] = [
  { id: 'kitchen', name: '주방 동선', note: '국솥에서 카운터까지 세 걸음' },
  { id: 'wall-seat', name: '벽 좌석', note: '혼자 오신 분이 앉는 자리' },
  { id: 'group', name: '단체석', note: '확장형부터 하나씩 냅니다' },
  { id: 'counter', name: '카운터', note: '주문과 결제가 한자리에서' },
  { id: 'sign', name: '외부 간판', note: '창업 비용표에 따로 잡힙니다' },
  { id: 'light', name: '조명', note: '문어 색이 제대로 보이는 밝기' },
  { id: 'entry', name: '입구', note: '문을 열면 바로 카운터가 보이게' },
  { id: 'window', name: '창가', note: '점심에 줄이 서는 자리' },
];

/**
 * 홈에서 브랜드가 스스로 말하는 것 셋.
 *
 * ## 왜 셋인가
 * 넷이 되면 한 줄에 안 서고, 둘이면 견줄 것이 없어 슬로건처럼 읽힌다. 셋은 **고르는 것이
 * 아니라 읽는 것**이라 나란히 세울 수 있는 가장 큰 수다.
 *
 * ## 자랑이 아니라 하는 일을 적는다
 * `최고의 맛` · `차별화된 시스템` 같은 말은 어느 브랜드나 쓴다 — 읽는 사람에게 남는 것이 없다.
 * 여기 셋은 다 **매일 실제로 하는 일**이고, 그래서 안 지키면 티가 난다.
 */
export type BrandPoint = { id: string; title: string; desc: string };

export const BRAND_POINTS: BrandPoint[] = [
  {
    id: 'broth',
    title: '그날 들어온 문어만',
    desc: '새벽 경매에서 받아 그날 다 씁니다. 남은 것으로 다음 날을 열지 않습니다.',
  },
  {
    id: 'training',
    title: '본점에서 2주',
    desc: '문어 삶는 것부터 주문 받는 것까지 실제 영업 시간에 함께 섭니다.',
  },
  {
    id: 'delivery',
    title: '배달앱은 본사가',
    desc: '메뉴 등록과 사진, 리뷰 관리를 본사가 맡습니다. 점주는 주방만 보십니다.',
  },
];

/**
 * 창업을 검토하는 사람이 재는 숫자 셋.
 *
 * ## 이 값들은 **예시다**
 * 실제 가맹 상담에서 쓰는 숫자가 아니다. 가맹사업법은 예상 매출을 **정보공개서와 예상매출액
 * 산정서**로 서면 제공하게 하고, 그 서류의 숫자는 인근 매장의 실제 실적에서 나온다. 화면에
 * 적힌 값이 그 서류와 다르면 그 차이가 그대로 분쟁이 된다.
 *
 * 화면에는 지금 그 사실을 적어 두지 않는다. 실제 숫자로 바꿀 때는 **서류와 같은 값**인지를
 * 먼저 맞춰야 한다는 뜻이다.
 */
export type GrowthFigure = { id: string; label: string; value: string; note: string };

export const GROWTH_FIGURES: GrowthFigure[] = [
  {
    id: 'monthly',
    label: '월 매출 상위 매장',
    value: '1억 2,000만원',
    note: '점심 회전이 빠른 오피스 상권 기준입니다.',
  },
  {
    id: 'revisit',
    label: '한 달 안 재방문율',
    value: '62%',
    note: '한 번 오신 손님이 한 달 안에 다시 오시는 비율입니다.',
  },
  {
    id: 'breakeven',
    label: '개점 후 손익분기',
    value: '평균 11개월',
    note: '임차료를 포함해 계산한 값입니다.',
  },
];


/**
 * 매장별 월 매출 — **자리마다 다르다는 것을 숫자로 보인다.**
 *
 * 평균 하나만 적으면 그 값이 **내 매장의 예상치**로 읽힌다. 여러 매장을 나란히 두면 자리에
 * 따라 배가 갈린다는 것이 먼저 보이고, 그것이 상담에서 자리를 함께 보자고 말하는 근거가 된다.
 *
 * 좌석 수를 함께 적는 이유: 매출만 두면 큰 매장이 무조건 낫다고 읽힌다. 좌석당으로 나눠 보면
 * 작은 매장이 더 잘 도는 경우가 실제로 있고, 그것이 첫 장사에게 중요한 정보다.
 *
 * 이 값들도 예시다(`GROWTH_FIGURES` 머리말).
 */
export type StoreSales = {
  /** `STORES` 의 id — 이름과 지역은 거기서 가져온다 */
  storeId: string;
  /**
   * 좌석 수.
   *
   * `Store` 가 아니라 여기 있는 이유: 매장 찾기 화면은 좌석 수를 쓰지 않는다. 손님이 재는 것은
   * 여는 시간과 되는 것(포장 · 주차)이지 몇 석인지가 아니다 — 그것은 **차리려는 사람의 값**이라
   * 매출과 같은 자리에 둔다.
   */
  seats: number;
  monthly: number;
};

export const STORE_SALES: StoreSales[] = [
  { storeId: 'gunsan', seats: 16, monthly: 98_600_000 },
  { storeId: 'yeoksam', seats: 32, monthly: 120_400_000 },
  { storeId: 'mapo', seats: 24, monthly: 87_200_000 },
  { storeId: 'bundang', seats: 48, monthly: 76_500_000 },
  { storeId: 'suwon', seats: 40, monthly: 68_300_000 },
  { storeId: 'daejeon', seats: 36, monthly: 64_900_000 },
  { storeId: 'busan', seats: 32, monthly: 71_800_000 },
];

/**
 * 매출 줄에 세울 것 — 매장 이름 · 좌석 수 · 월 매출.
 *
 * 차례를 **매출 많은 곳부터**로 두지 않는다. 그렇게 세우면 줄이 순위표가 되고, 맨 아래 매장이
 * 못하는 곳으로 읽힌다. 좌석이 적은 곳부터 세우면 **작은 매장도 이만큼 돈다**가 먼저 보인다 —
 * 첫 장사를 검토하는 사람이 실제로 재는 것이 그쪽이다.
 */
export function storeSalesRows(): { id: string; name: string; seats: number; monthly: string }[] {
  return STORE_SALES.map((one) => ({
    id: one.storeId,
    name: findStore(one.storeId)?.name ?? one.storeId,
    seats: one.seats,
    monthly: `${comma(one.monthly)}원`,
  })).sort((a, b) => a.seats - b.seats);
}

/* ── 창업 ─────────────────────────────────────────────────────────── */

/**
 * 창업 절차 한 단계.
 *
 * 기간을 함께 적는다. 절차만 적으면 "그래서 몇 달 걸리나" 가 그대로 전화 문의로 남는데, 그
 * 물음이 창업 검토에서 가장 먼저 나온다(솔루션 상세와 같은 이유).
 */
export type FranchiseStep = { name: string; period: string; desc: string };

export const FRANCHISE_STEPS: FranchiseStep[] = [
  { name: '상담 신청', period: '1일', desc: '남겨 주신 번호로 하루 안에 연락드립니다. 이때는 아무것도 정하지 않습니다.' },
  { name: '상권 조사', period: '2~3주', desc: '보고 계신 자리를 함께 봅니다. 안 된다고 말씀드리는 경우가 실제로 있습니다.' },
  { name: '계약 · 설계', period: '2주', desc: '가맹 계약을 맺고 도면을 그립니다. 비용이 여기서 확정됩니다.' },
  { name: '공사 · 교육', period: '4~6주', desc: '인테리어와 동시에 조리 교육을 받습니다. 교육은 본점에서 2주입니다.' },
  { name: '개점', period: '1주', desc: '시식 영업으로 시작합니다. 첫 주는 본사 직원이 상주합니다.' },
];

/**
 * 창업 비용 한 줄.
 *
 * ## 금액을 숫자로 두고 화면이 단위를 붙인다
 * `1,000만원` 처럼 문자열로 두면 **더할 수 없다.** 합계를 화면에서 세는 순간 그 값은 손으로
 * 적은 값과 어긋나고, 어긋난 쪽은 언제나 손으로 적은 쪽이다.
 *
 * 평형에 따라 달라지는 항목은 `note` 에 조건을 적는다.
 */
export type FranchiseCost = {
  id: string;
  name: string;
  /** 만원 단위. 억 단위가 없는 업종이라 만원이 읽기 좋다 */
  amount: number;
  note: string;
};

/** 33㎡(10평) 기준. 기준을 안 적으면 이 표가 어느 크기의 값인지 알 수 없다. */
export const FRANCHISE_COST_BASIS = '33㎡(약 10평) 기준 · 부가세 별도';

export const FRANCHISE_COSTS: FranchiseCost[] = [
  { id: 'fee', name: '가맹비', amount: 800, note: '계약 시 1회. 5년 계약 기준입니다.' },
  { id: 'edu', name: '교육비', amount: 300, note: '본점 2주 교육. 추가 인원은 1인당 50만원.' },
  { id: 'deposit', name: '이행보증금', amount: 500, note: '계약 종료 시 정산 후 돌려드립니다.' },
  {
    id: 'interior',
    name: '인테리어',
    /* 평당 단가에서 나온다 — 인테리어 화면의 기본형과 같은 값이어야 한다(`INTERIOR_PER_PYEONG`). */
    amount: 10 * INTERIOR_PER_PYEONG,
    note: `평당 ${INTERIOR_PER_PYEONG}만원. 철거·소방은 별도입니다.`,
  },
  { id: 'equipment', name: '주방 설비', amount: 2200, note: '국솥·냉장·환기 일체. 중고 반입은 협의합니다.' },
  { id: 'sign', name: '간판 · 사인', amount: 600, note: '외부 간판과 내부 사인 일체.' },
];

/** 표 아래에 서는 합계. 화면마다 세면 화면 수만큼 다른 합계가 생긴다. */
export function franchiseCostTotal(): number {
  return FRANCHISE_COSTS.reduce((sum, one) => sum + one.amount, 0);
}

/* ── 창업 문의 ────────────────────────────────────────────────────── */

/**
 * 밖에서 들어온 창업 상담 신청.
 *
 * ## 지우는 자리를 두지 않는다
 * 이 값은 우리가 만든 것이 아니라 **손님이 남긴 것**이다. 잘못 들어온 것처럼 보여도 지우면
 * 그 사람이 언제 무엇을 물었는지가 사라지고, 나중에 "연락 못 받았다" 는 말에 댈 근거가 없다.
 * 처리가 끝난 것은 상태로 닫는다.
 *
 * ## 예산을 구간으로 받는다
 * 정확한 금액을 물으면 대부분 비워 둔다 — 아직 모르기 때문이다. 구간으로 물으면 답이 오고,
 * 상담 순서를 정하는 데는 구간이면 충분하다.
 */
export type FranchiseInquiry = {
  id: string;
  name: string;
  phone: string;
  /** 창업을 보고 있는 지역. 매장 거르개와 같은 말을 쓴다 */
  region: string;
  /** `1억 미만` 처럼 구간 */
  budget: string;
  message: string;
  /** `2026-08-04` */
  receivedOn: string;
  state: '접수' | '상담중' | '완료' | '보류';
};

export const FRANCHISE_BUDGETS: string[] = ['1억 미만', '1억 ~ 1억 5천', '1억 5천 ~ 2억', '2억 이상', '아직 모름'];

export const FRANCHISE_INQUIRIES: FranchiseInquiry[] = [
  {
    id: 'FQ-0108',
    name: '김도현',
    phone: '010-0000-0108',
    region: '경기',
    budget: '1억 5천 ~ 2억',
    message: '동탄에 자리를 보고 있습니다. 상권 조사부터 받아 볼 수 있을까요.',
    receivedOn: '2026-08-07',
    state: '접수',
  },
  {
    id: 'FQ-0107',
    name: '이수민',
    phone: '010-0000-0107',
    region: '서울',
    budget: '1억 ~ 1억 5천',
    message: '기존에 다른 브랜드로 운영 중입니다. 업종 변경도 상담되나요.',
    receivedOn: '2026-08-05',
    state: '상담중',
  },
  {
    id: 'FQ-0106',
    name: '박준영',
    phone: '010-0000-0106',
    region: '충청',
    budget: '아직 모름',
    message: '천안 쪽 알아보는 중입니다. 대략 얼마나 드는지부터 알고 싶습니다.',
    receivedOn: '2026-08-03',
    state: '상담중',
  },
  {
    id: 'FQ-0105',
    name: '최은지',
    phone: '010-0000-0105',
    region: '경상',
    budget: '2억 이상',
    message: '해운대 대로변 1층 40평입니다. 이 크기도 가능한지 궁금합니다.',
    receivedOn: '2026-07-29',
    state: '완료',
  },
  {
    id: 'FQ-0104',
    name: '정민석',
    phone: '010-0000-0104',
    region: '전라',
    budget: '1억 미만',
    message: '광주 상무점 근처는 이미 계약이 끝났나요.',
    receivedOn: '2026-07-24',
    state: '완료',
  },
  {
    id: 'FQ-0103',
    name: '한지우',
    phone: '010-0000-0103',
    region: '서울',
    budget: '1억 ~ 1억 5천',
    message: '연락 주시면 자세히 말씀드리겠습니다.',
    receivedOn: '2026-07-18',
    state: '보류',
  },
];

export function findFranchiseInquiry(id: string): FranchiseInquiry | undefined {
  return FRANCHISE_INQUIRIES.find((one) => one.id === id);
}

/* ── 공지 · 자주 묻는 것 ──────────────────────────────────────────── */

/**
 * 브랜드 공지.
 *
 * `pinned` 를 두는 이유: 가격 인상이나 원산지 변경처럼 **묻기 전에 읽혀야 하는 것**이 있다.
 * 날짜 순으로만 세우면 그 글이 한 달 만에 두 번째 장으로 넘어간다.
 */
export type FnbNotice = {
  id: string;
  title: string;
  body: string;
  postedOn: string;
  pinned: boolean;
  visible: boolean;
};

export const FNB_NOTICES: FnbNotice[] = [
  {
    id: 'N-012',
    title: '2026년 9월 일부 메뉴 가격 조정 안내',
    body: '문어 시세가 올라 숙회 세 종의 가격을 2,000원씩 올립니다. 9월 1일 주문부터 적용되며, 곁들임과 음료는 그대로입니다. 올리기 전에 알려 드리는 것이 맞다고 보아 한 달 앞서 공지합니다.',
    postedOn: '2026-08-01',
    pinned: true,
    visible: true,
  },
  {
    id: 'N-011',
    title: '광주 상무점 9월 개점 예정',
    body: '광주 상무점이 9월 문을 엽니다. 개점 주에는 숙회 전 메뉴를 20% 할인해 드립니다.',
    postedOn: '2026-07-22',
    pinned: false,
    visible: true,
  },
  {
    id: 'N-010',
    title: '여름 메뉴(문어냉채) 판매 종료',
    body: '8월 말까지만 냅니다. 내년 6월에 다시 시작합니다.',
    postedOn: '2026-07-10',
    pinned: false,
    visible: true,
  },
  {
    id: 'N-009',
    title: '인천 송도점 휴점 안내',
    body: '내부 사정으로 당분간 문을 닫습니다. 재개점이 정해지면 다시 알려 드리겠습니다.',
    postedOn: '2026-06-30',
    pinned: false,
    visible: true,
  },
];

export function publicFnbNotices(): FnbNotice[] {
  return FNB_NOTICES.filter((one) => one.visible);
}

/**
 * 사이트에 서는 **차례** — 고정한 것이 먼저, 그다음 날짜 역순.
 *
 * ## 왜 화면이 아니라 여기서 세우나
 * 이 차례를 읽는 곳이 둘이다 — 공지 목록 화면과 홈의 공지 띠(맨 위 한 줄). 화면마다 정렬하면
 * 두 곳이 **서로 다른 글을 최신으로** 보일 수 있고, 그 어긋남은 홈과 목록을 나란히 열어야만
 * 보인다. 홈에서 본 글을 누르고 들어갔더니 다른 글이 맨 위에 있는 상태가 그래서 생긴다.
 *
 * `sort` 가 원본을 뒤집으므로 복사본에 건다 — `FNB_NOTICES` 는 어드민 화면도 읽는다.
 */
export function orderedFnbNotices(): FnbNotice[] {
  return [...publicFnbNotices()].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.postedOn.localeCompare(a.postedOn);
  });
}

/**
 * 자주 묻는 것.
 *
 * **손님 것과 점주 것을 나눠 둔다.** 한 목록에 섞으면 "가맹비가 얼마인가" 와 "포장이 되나" 가
 * 나란히 서고, 그러면 어느 쪽으로 온 사람도 자기 물음을 셋째 줄 아래에서 찾는다.
 */
export type FnbFaq = {
  id: string;
  /** `손님` 인지 `창업` 인지 */
  audience: '손님' | '창업';
  /**
   * 무엇에 대한 물음인가 — 창업 문의 화면의 **왼쪽 분류**가 이것으로 선다.
   *
   * 자유 입력이 아니라 `FAQ_TOPICS` 안에서 고른다. 화면에서 새 이름을 만들 수 있게 두면 같은
   * 것이 `비용` 과 `가격` 두 분류로 쌓이고, 그러면 왼쪽 기둥이 길어지면서 **어느 쪽을 눌러야
   * 하는지**가 사라진다.
   */
  topic: FaqTopic;
  question: string;
  answer: string;
  visible: boolean;
};

/**
 * 물음의 분류.
 *
 * 손님 것과 창업 것을 한 목록으로 둔다. 물음이 실제로 갈리는 자리가 `audience` 라 분류까지
 * 갈라 두면 같은 뜻의 이름이 양쪽에 하나씩 생긴다(`값` 과 `비용`).
 *
 * 차례는 **묻는 순서**다 — 얼마 드는지를 먼저 묻고, 그다음 내가 할 수 있는지를 묻는다.
 */
export const FAQ_TOPICS = ['비용', '자격 · 교육', '매장 · 공사', '상권', '주문 · 이용'] as const;

export type FaqTopic = (typeof FAQ_TOPICS)[number];

/**
 * 그 갈래에서 실제로 쓰이는 분류만.
 *
 * 다섯을 늘 세우지 않는 이유: 창업 화면에 `주문 · 이용` 이 서면 눌렀을 때 빈 목록이 나오고,
 * 그러면 답이 없어진 줄 안다. 목록에서 뽑되 `FAQ_TOPICS` 의 **차례는 지킨다** — 데이터가
 * 쌓인 순서대로 세우면 글이 하나 늘 때마다 왼쪽 기둥의 차례가 바뀐다.
 */
export function faqTopicsOf(audience: FnbFaq['audience']): FaqTopic[] {
  const used = new Set(publicFnbFaqs().filter((one) => one.audience === audience).map((one) => one.topic));
  return FAQ_TOPICS.filter((one) => used.has(one));
}

export const FNB_FAQS: FnbFaq[] = [
  {
    id: 'F-01',
    topic: '주문 · 이용',
    audience: '손님',
    question: '포장이나 배달이 되나요?',
    answer: '매장마다 다릅니다. 매장 찾기에서 각 매장의 표시를 확인해 주세요. 배달은 배달앱으로만 받습니다.',
    visible: true,
  },
  {
    id: 'F-02',
    topic: '주문 · 이용',
    audience: '손님',
    question: '아이와 함께 가도 되나요?',
    answer: '됩니다. 아기 의자는 전 매장에 있고, 덜 맵게 해 달라고 하시면 그렇게 냅니다.',
    visible: true,
  },
  {
    id: 'F-03',
    topic: '주문 · 이용',
    audience: '손님',
    question: '단체 예약이 되나요?',
    answer: '단체석이 있는 매장만 됩니다. 10인 이상은 매장으로 직접 전화 주세요.',
    visible: true,
  },
  {
    id: 'F-04',
    topic: '주문 · 이용',
    audience: '손님',
    question: '원산지는 어디인가요?',
    answer: '문어는 국내산과 수입산을 함께 씁니다. 그날 들어온 것의 원산지를 매장 게시판에 붙여 둡니다.',
    visible: true,
  },
  {
    id: 'F-05',
    topic: '비용',
    audience: '창업',
    question: '창업 비용은 총 얼마인가요?',
    answer: '33㎡ 기준 부가세 별도로 약 8,900만원입니다. 자리와 평형에 따라 달라지므로 상권 조사 뒤에 확정해 드립니다. 임차료와 권리금은 포함되지 않습니다.',
    visible: true,
  },
  {
    id: 'F-06',
    topic: '자격 · 교육',
    audience: '창업',
    question: '외식업 경험이 없어도 되나요?',
    answer: '됩니다. 지금 점주의 절반 이상이 첫 장사입니다. 본점에서 2주 교육을 받고, 개점 첫 주는 본사 직원이 매장에 함께 있습니다.',
    visible: true,
  },
  {
    id: 'F-07',
    topic: '매장 · 공사',
    audience: '창업',
    question: '기존 매장을 업종만 바꿔도 되나요?',
    answer: '주방 설비를 다시 넣어야 해서 대부분 새로 공사합니다. 다만 환기와 급배수가 이미 되어 있으면 비용이 줄어듭니다. 도면을 보내 주시면 확인해 드립니다.',
    visible: true,
  },
  {
    id: 'F-08',
    topic: '상권',
    audience: '창업',
    question: '가까운 곳에 이미 매장이 있으면 안 되나요?',
    answer: '상권이 겹치면 열지 않습니다. 기존 점주의 매출이 먼저이기 때문이고, 그 선은 상권 조사에서 함께 확인해 드립니다.',
    visible: true,
  },
  {
    id: 'F-09',
    topic: '비용',
    audience: '창업',
    question: '가맹비 말고 매달 나가는 것이 있나요?',
    answer:
      '로열티는 매출의 3%이고 매달 정산합니다. 그 밖에 본사로 나가는 고정비는 없습니다. 식자재는 쓰신 만큼만 계산합니다.',
    visible: true,
  },
  {
    id: 'F-10',
    topic: '자격 · 교육',
    audience: '창업',
    question: '교육은 어디서 얼마나 받나요?',
    answer:
      '본점에서 2주입니다. 문어 고르는 것과 삶는 시간 재는 것까지 실제 영업 시간에 함께 섭니다. 개점 뒤에도 분기마다 한 번씩 다시 오십니다.',
    visible: true,
  },
  {
    id: 'F-11',
    topic: '매장 · 공사',
    audience: '창업',
    question: '공사는 얼마나 걸리나요?',
    answer:
      '평형에 따라 4주에서 6주입니다. 소방과 급배수를 새로 해야 하면 더 걸립니다. 도면을 보시고 먼저 기간부터 말씀드립니다.',
    visible: true,
  },
  {
    id: 'F-12',
    topic: '상권',
    audience: '창업',
    question: '자리를 아직 못 정했는데 상담이 되나요?',
    answer:
      '됩니다. 오히려 계약 전에 오시는 편이 낫습니다. 보고 계신 자리 두세 곳을 함께 보고 어느 쪽이 나은지 말씀드립니다.',
    visible: true,
  },
];

export function publicFnbFaqs(): FnbFaq[] {
  return FNB_FAQS.filter((one) => one.visible);
}

/* ── 배너 ─────────────────────────────────────────────────────────── */

/**
 * 첫 화면에 거는 메인 비주얼.
 *
 * ## 기간을 값으로 갖고, 지금 걸리는지는 계산한다
 * `노출 중` 을 손으로 켜고 끄게 두면 개점 행사가 끝난 다음 날 아무도 안 끈다. 시작·종료를
 * 적어 두면 그날이 지나는 순간 저절로 내려간다(`bannerState`).
 *
 * 그렇다고 `visible` 을 없애지는 않는다. **기간과 상관없이 지금 당장 내려야 하는 일**이
 * 있다 — 값이 잘못 적혔거나 행사가 취소됐을 때다.
 *
 * ## 사진 주소가 없다
 * 다른 자리와 같은 까닭이다(`PhotoSlot`). 촬영이 끝나면 여기에 `imageUrl` 한 줄이 는다.
 */
export type FnbBanner = {
  id: string;
  title: string;
  /** 제목 아래 한 줄. 없어도 된다 — 사진이 다 말하는 배너가 있다 */
  subtitle: string;
  /** 눌렀을 때 가는 곳. 비우면 누를 수 없는 배너가 된다 */
  href: string;
  startAt: string;
  /** 비우면 상시 */
  endAt: string;
  visible: boolean;
};

export const FNB_BANNERS: FnbBanner[] = [
  {
    id: 'BN-01',
    title: '통문어 한 마리, 그날 삶아 냅니다',
    subtitle: '새벽 경매에서 받아 그날 다 씁니다.',
    href: '/menu',
    startAt: '2026-01-01',
    endAt: '',
    visible: true,
  },
  {
    id: 'BN-02',
    title: '광주 상무점 9월 개점',
    subtitle: '개점 주에는 숙회 전 메뉴 20% 할인.',
    href: '/stores',
    startAt: '2026-08-20',
    endAt: '2026-09-30',
    visible: true,
  },
  {
    id: 'BN-03',
    title: '차리려는 분께',
    subtitle: '자리부터 함께 봅니다. 안 되는 자리는 안 된다고 말씀드립니다.',
    href: '/franchise',
    startAt: '2026-03-01',
    endAt: '',
    visible: false,
  },
];

/**
 * 화면 가운데 뜨는 팝업.
 *
 * ## 배너와 나눠 두는 까닭
 * 둘 다 기간이 있고 둘 다 사이트에 걸리지만, **팝업은 읽는 것을 막는다.** 배너는 지나가며 보고
 * 팝업은 닫아야 다음으로 간다. 한 목록에 섞으면 그 무게 차이가 사라져, 배너 하나 올리듯 팝업이
 * 올라간다.
 *
 * ## `오늘 하루 보지 않기` 를 켤지 정한다
 * 대부분 켜 둔다. 끄는 것은 **반드시 읽혀야 하는 것**뿐이다(휴점 · 가격 조정). 그 구분을 값으로
 * 두면 올리는 사람이 매번 한 번 생각하게 된다.
 */
export type FnbPopup = {
  id: string;
  title: string;
  body: string;
  startAt: string;
  endAt: string;
  /** `오늘 하루 보지 않기` 를 보여 줄지 */
  dismissible: boolean;
  visible: boolean;
};

export const FNB_POPUPS: FnbPopup[] = [
  {
    id: 'PU-01',
    title: '9월 일부 메뉴 가격 조정',
    body: '숙회 세 종의 가격을 2,000원씩 올립니다. 9월 1일 주문부터 적용됩니다.',
    startAt: '2026-08-01',
    endAt: '2026-09-01',
    dismissible: false,
    visible: true,
  },
  {
    id: 'PU-02',
    title: '인천 송도점 휴점',
    body: '내부 사정으로 당분간 문을 닫습니다. 재개점이 정해지면 다시 알려 드리겠습니다.',
    startAt: '2026-06-30',
    endAt: '',
    dismissible: false,
    visible: true,
  },
  {
    id: 'PU-03',
    title: '창업 설명회 안내',
    body: '9월 12일 본점에서 엽니다. 자리가 스무 분으로 한정됩니다.',
    startAt: '2026-08-25',
    endAt: '2026-09-12',
    dismissible: true,
    visible: false,
  },
];

/**
 * 배너·팝업이 **지금 걸려 있는가.**
 *
 * 목록에서 손으로 켠 `visible` 과 기간을 함께 본다. 화면이 저마다 이 계산을 하면 배너 목록과
 * 팝업 목록이 다른 답을 내는 날이 오고, 그때 어느 쪽이 맞는지 아무도 모른다.
 *
 * 오늘 날짜를 인자로 받는 이유: 여기서 `new Date()` 를 부르면 **미리 만들어 두는 화면**에서
 * 빌드한 날이 굳는다. 부르는 쪽이 그 시점을 정한다.
 */
export type BannerState = '노출 중' | '예정' | '종료' | '숨김';

export function bannerState(item: { visible: boolean; startAt: string; endAt: string }, today: string): BannerState {
  if (!item.visible) return '숨김';
  if (item.startAt && today < item.startAt) return '예정';
  if (item.endAt && today > item.endAt) return '종료';
  return '노출 중';
}

export function findFnbBanner(id: string): FnbBanner | undefined {
  return FNB_BANNERS.find((one) => one.id === id);
}

export function findFnbPopup(id: string): FnbPopup | undefined {
  return FNB_POPUPS.find((one) => one.id === id);
}

/* ── 설정 ─────────────────────────────────────────────────────────── */

/**
 * 이 콘솔에 들어오는 사람.
 *
 * ## 권한을 셋으로만 나눈다
 * 자원마다 읽기·쓰기를 따로 주는 방식도 있다. 그러면 조합이 수십 가지가 되고, **누가 무엇을 할 수
 * 있는지 아무도 설명하지 못하게 된다.** 셋이면 한 줄로 설명된다.
 *
 * - `대표` — 전부. 관리자를 늘리고 지울 수 있는 유일한 권한이다.
 * - `운영` — 메뉴 · 매장 · 배너 · 문의. 매일 쓰는 것 전부.
 * - `조회` — 보기만. 가맹점주나 외부 대행사에 준다.
 *
 * ## 마지막 접속을 적는다
 * 안 쓰는 계정이 남아 있는 것이 이 종류의 콘솔에서 가장 흔한 구멍이다. 목록에서 날짜가 오래된
 * 줄이 보이면 그때 정리한다.
 */
export const ADMIN_ROLES = ['대표', '운영', '조회'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type FnbAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  /** `2026-08-09` — 접속한 적이 없으면 빈 값 */
  lastSeenOn: string;
  active: boolean;
};

export const FNB_ADMINS: FnbAdmin[] = [
  { id: 'AD-01', name: '정현우', email: 'ceo@example.com', role: '대표', lastSeenOn: '2026-08-10', active: true },
  { id: 'AD-02', name: '김도현', email: 'ops1@example.com', role: '운영', lastSeenOn: '2026-08-10', active: true },
  { id: 'AD-03', name: '이수연', email: 'ops2@example.com', role: '운영', lastSeenOn: '2026-07-28', active: true },
  { id: 'AD-04', name: '박정민', email: 'view@example.com', role: '조회', lastSeenOn: '2026-05-02', active: true },
  { id: 'AD-05', name: '최은영', email: 'former@example.com', role: '운영', lastSeenOn: '', active: false },
];

export function findFnbAdmin(id: string): FnbAdmin | undefined {
  return FNB_ADMINS.find((one) => one.id === id);
}

export function findMarketingPost(id: string): MarketingPost | undefined {
  return MARKETING_POSTS.find((one) => one.id === id);
}

export function findMarketingChannel(id: string): MarketingChannel | undefined {
  return MARKETING_CHANNELS.find((one) => one.id === id);
}

/* ── 새로 만들 때의 밑값 ───────────────────────────────────────────── */

/**
 * 등록 화면이 여는 **빈 레코드**.
 *
 * ## 왜 store 가 갖나
 * `visible: true` 로 열지 `false` 로 열지, 값을 `0` 으로 둘지 같은 것은 **그 자원이 무엇인가**에
 * 딸린 판단이다. 화면마다 객체를 손으로 적으면 새 칸이 늘 때 등록 화면만 그 칸을 빠뜨리고,
 * 무엇보다 화면마다 다른 기본값이 생긴다.
 *
 * ## `id` 를 비워 둔다
 * 번호는 저장할 때 매겨진다. 화면이 미리 만들어 두면 **저장하지 않고 나간 번호**가 생기고,
 * 다음 사람이 같은 번호를 받는다. 지금은 프론트엔드 전용이라 저장 자체가 없지만, 서버가
 * 붙는 날 그 자리가 여기여야 한다.
 *
 * ## 공개를 꺼 둔다
 * 메뉴 · 마케팅 글 · 배너 · 팝업 넷 다 `visible: false` 로 연다. 등록하다 만 것이 **사이트에
 * 바로 서는 것**이 이 종류의 콘솔에서 가장 흔한 사고다. 켜는 것은 다 적은 뒤에 한 번 더
 * 누르는 일이어야 한다.
 *
 * 공급자와 관리자는 반대로 켜 둔다(`active: true`). 그 둘은 사이트에 안 나가고, 등록하는
 * 까닭이 곧 **지금부터 쓰겠다**는 뜻이다.
 */
export function blankMenuItem(): MenuItem {
  return {
    id: '',
    categoryId: MENU_CATEGORIES[0]?.id ?? '',
    name: '',
    price: 0,
    description: '',
    kcal: 0,
    allergens: [],
    tags: [],
    visible: false,
  };
}

export function blankMarketingPost(): MarketingPost {
  return {
    id: '',
    channelId: MARKETING_CHANNELS[0]?.id ?? '',
    title: '',
    desc: '',
    postedOn: '',
    visible: false,
  };
}

export function blankStore(): Store {
  return {
    id: '',
    name: '',
    region: STORE_REGIONS[0] ?? '',
    address: '',
    phone: '',
    hours: '',
    features: [],
    /* 새 가맹점은 `준비중` 으로 연다 — 등록하는 시점이 대개 공사 중이다. */
    state: '준비중',
    openedOn: '',
    lat: 0,
    lng: 0,
  };
}

export function blankFnbBanner(): FnbBanner {
  return { id: '', title: '', subtitle: '', href: '', startAt: '', endAt: '', visible: false };
}

export function blankFnbPopup(): FnbPopup {
  return {
    id: '',
    title: '',
    body: '',
    startAt: '',
    endAt: '',
    /* 새 팝업은 하루 감추기를 켜 둔다 — 끄는 것이 무거운 결정이라 일부러 고르게 한다. */
    dismissible: true,
    visible: false,
  };
}


export function blankFnbAdmin(): FnbAdmin {
  return {
    id: '',
    name: '',
    email: '',
    /* 새 계정은 가장 좁은 권한으로 연다. 넓히는 것은 한 번 더 고르는 일이어야 한다. */
    role: '조회',
    lastSeenOn: '',
    active: true,
  };
}

/**
 * 새 FAQ — 어느 갈래에서 열었는지를 받는다.
 *
 * 창업 화면에서 만든 글이 손님 목록에 서면 안 되고, 그 반대도 안 된다. 화면이 자기 갈래를
 * 넘기면 등록한 사람이 갈래를 고를 일이 없어진다 — **고를 수 있게 두면 잘못 고른다.**
 */
export function blankFnbFaq(audience: FnbFaq['audience']): FnbFaq {
  return { id: '', audience, topic: FAQ_TOPICS[0], question: '', answer: '', visible: false };
}

/** 새 공지 — 고정과 공개를 꺼 둔다. 적다 만 글이 홈 띠에 흐르는 일이 없게. */
export function blankFnbNotice(): FnbNotice {
  return { id: '', title: '', body: '', postedOn: '', pinned: false, visible: false };
}

export function findFnbFaq(id: string): FnbFaq | undefined {
  return FNB_FAQS.find((one) => one.id === id);
}

export function findFnbNotice(id: string): FnbNotice | undefined {
  return FNB_NOTICES.find((one) => one.id === id);
}

/**
 * 지금 사이트에 걸리는 배너·팝업.
 *
 * ## 왜 store 가 고르나
 * 화면마다 `bannerState(one, today) === '노출 중'` 을 적으면 그 한 줄을 빠뜨리는 화면이 생기고,
 * 그러면 **내려 둔 배너가 그 화면에만 뜬다.** 공개 필터를 한 벌로 두는 것은 이 저장소의 규칙이다
 * (`publicMenuItems` · `publicStores` 와 같은 자리).
 *
 * ## 오늘을 받는다
 * 여기서 `new Date()` 를 부르면 미리 만들어 두는 화면에서 **빌드한 날에 굳는다.** 부르는 쪽이
 * 그 시점을 정한다.
 *
 * ## 차례는 목록 순서 그대로
 * 기간이 겹치면 위에 있는 것이 이긴다. 날짜로 다시 정렬하지 않는 이유: 시작일이 같은 둘이
 * 있으면 그때는 **사람이 정한 차례**가 답이고, 그 차례가 곧 목록의 순서다.
 */
export function liveBanners(today: string): FnbBanner[] {
  return FNB_BANNERS.filter((one) => bannerState(one, today) === '노출 중');
}

export function livePopups(today: string): FnbPopup[] {
  return FNB_POPUPS.filter((one) => bannerState(one, today) === '노출 중');
}
