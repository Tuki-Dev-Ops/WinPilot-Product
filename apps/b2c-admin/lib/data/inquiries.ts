/**
 * 문의 시드 데이터 — **프론트엔드 전용**.
 *
 * 고객 화면의 문의하기 폼은 한 곳이 아니다. 회사 소개, 상품 상세, 포트폴리오마다
 * 같은 폼이 놓이고, **어느 화면에서 보냈는지(`path`)** 를 알아야 답변의 맥락이 잡힌다.
 * 그래서 경로를 목록의 열로 두고 필터로도 쓴다.
 */
export type InquiryState = '접수' | '처리중' | '답변완료' | '보류';

export type InquiryRecord = {
  id: string;
  /** 고객이 문의를 보낸 화면의 경로 */
  path: string;
  category: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  /** 고객이 적은 내용 — 글자 그대로 보관한다 */
  message: string;
  state: InquiryState;
  createdAt: string;
  /** 답변 HTML — 아직 없으면 빈 문자열 */
  answer: string;
  answeredAt: string;
  answeredBy: string;
};

/** 고객 화면에서 문의 폼이 놓인 경로 */
export type InquiryPathRecord = {
  path: string;
  label: string;
  visible: boolean;
};

export const INQUIRY_PATHS: InquiryPathRecord[] = [
  { path: '/contact', label: '문의하기', visible: true },
  { path: '/company/about', label: '회사 소개', visible: true },
  { path: '/products/[productId]', label: '상품 상세', visible: true },
  { path: '/portfolios/[portfolioId]', label: '포트폴리오 상세', visible: true },
  { path: '/partnership', label: '제휴 문의', visible: false },
];

export const INQUIRY_CATEGORIES = ['상품 문의', '주문·배송', '교환·반품', '제휴 제안', '기타'];

export const INQUIRIES: InquiryRecord[] = [
  {
    id: 'Q-3301',
    path: '/products/[productId]',
    category: '상품 문의',
    name: '김서연',
    email: 'seoyeon.kim@example.com',
    phone: '01043215678',
    title: '리넨 오버셔츠 사이즈 문의',
    message: '평소 95 입는데 M과 L 중 어느 쪽이 맞을까요? 어깨가 넓은 편입니다.',
    state: '접수',
    createdAt: '2026-08-03 10:24',
    answer: '',
    answeredAt: '',
    answeredBy: '',
  },
  {
    id: 'Q-3300',
    path: '/contact',
    category: '주문·배송',
    name: '박지훈',
    email: 'jihoon.park@example.com',
    phone: '01088776655',
    title: '주문한 상품 배송이 지연됩니다',
    message: '8월 1일에 결제했는데 아직 배송 시작 안내를 못 받았습니다. 확인 부탁드립니다.',
    state: '처리중',
    createdAt: '2026-08-02 18:03',
    answer: '',
    answeredAt: '',
    answeredBy: '',
  },
  {
    id: 'Q-3299',
    path: '/company/about',
    category: '제휴 제안',
    name: '이하늘',
    email: 'haneul.lee@example.com',
    phone: '01033334444',
    title: '오프라인 팝업 스토어 제휴 제안',
    message: '9월 성수동 팝업에 브랜드 입점 제안드립니다. 담당자 연결 부탁드립니다.',
    state: '답변완료',
    createdAt: '2026-07-30 09:41',
    answer: '<p>제안 감사합니다. 제휴 담당자가 영업일 기준 2일 내로 메일 드리겠습니다.</p>',
    answeredAt: '2026-07-31 11:20',
    answeredBy: '한지원',
  },
  {
    id: 'Q-3298',
    path: '/portfolios/[portfolioId]',
    category: '기타',
    name: '정민우',
    email: 'minwoo.jung@example.com',
    phone: '01055667788',
    title: '포트폴리오에 소개된 프로젝트 문의',
    message: '무드하우스 프로젝트 기간이 어느 정도였는지 알 수 있을까요?',
    state: '보류',
    createdAt: '2026-07-28 15:12',
    answer: '',
    answeredAt: '',
    answeredBy: '',
  },
  {
    id: 'Q-3297',
    path: '/products/[productId]',
    category: '교환·반품',
    name: '최유진',
    email: 'yujin.choi@example.com',
    phone: '01012349876',
    title: '색상이 사진과 달라 교환하고 싶습니다',
    message: '주문한 그라인더 색상이 화면과 많이 다릅니다. 교환 가능한가요?',
    state: '답변완료',
    createdAt: '2026-07-26 20:55',
    answer: '<p>불편을 드려 죄송합니다. 교환 접수해 드렸으며 회수 기사님이 방문 예정입니다.</p>',
    answeredAt: '2026-07-27 09:30',
    answeredBy: '한지원',
  },
];

export function findInquiry(id: string): InquiryRecord | undefined {
  return INQUIRIES.find((inquiry) => inquiry.id === id);
}

/** 경로 코드를 사람이 읽는 이름으로 — 목록에서 `/products/[productId]` 만 보이면 뜻이 안 잡힌다. */
export function pathLabel(path: string): string {
  return INQUIRY_PATHS.find((item) => item.path === path)?.label ?? '알 수 없는 경로';
}

export const INQUIRY_STATE_TONE: Record<InquiryState, string> = {
  접수: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  처리중: 'bg-surface text-ink-muted',
  답변완료: 'bg-signal-ok/12 text-signal-ok',
  보류: 'bg-signal-danger/12 text-signal-danger',
};

export const INQUIRY_STATES: InquiryState[] = ['접수', '처리중', '답변완료', '보류'];

/** 문의 폼 설정 — 고객 화면의 문의하기 폼이 이 값을 따른다. */
export type InquiryFieldKey = 'name' | 'email' | 'phone' | 'company' | 'attachment' | 'privacy';

export type InquiryFieldSetting = {
  key: InquiryFieldKey;
  label: string;
  /** 폼에 넣을지 */
  enabled: boolean;
  /** 넣는다면 필수인지 */
  required: boolean;
  /** 끌 수 없는 항목 — 없으면 답변을 보낼 방법이 사라진다 */
  locked?: boolean;
};

export const DEFAULT_INQUIRY_FIELDS: InquiryFieldSetting[] = [
  { key: 'name', label: '이름', enabled: true, required: true, locked: true },
  { key: 'email', label: '이메일', enabled: true, required: true, locked: true },
  { key: 'phone', label: '연락처', enabled: true, required: false },
  { key: 'company', label: '회사명', enabled: false, required: false },
  { key: 'attachment', label: '첨부파일', enabled: true, required: false },
  { key: 'privacy', label: '개인정보 수집 동의', enabled: true, required: true, locked: true },
];

export type InquirySettings = {
  categories: string[];
  fields: InquiryFieldSetting[];
  paths: InquiryPathRecord[];
  guideText: string;
  doneText: string;
  autoReply: boolean;
};

export const DEFAULT_INQUIRY_SETTINGS: InquirySettings = {
  categories: INQUIRY_CATEGORIES,
  fields: DEFAULT_INQUIRY_FIELDS,
  paths: INQUIRY_PATHS,
  guideText: '문의 주신 내용은 영업일 기준 1~2일 내에 답변드립니다.',
  doneText: '문의가 접수되었습니다. 입력하신 이메일로 답변드리겠습니다.',
  autoReply: true,
};
