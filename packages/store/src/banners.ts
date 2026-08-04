/**
 * 배너 시드 데이터 — **프론트엔드 전용**.
 *
 * 메인 비주얼(`banner`)과 팝업(`popup`)은 노출 기간·순서를 갖는다는 점이 같고,
 * 보여지는 자리가 달라 따로 둔다.
 */
export type BannerRecord = {
  id: string;
  title: string;
  /** 제목 아래 한 줄 — 고객 화면 히어로에 함께 나간다 */
  subtitle: string;
  /** 제목 위 작은 딱지 (예: Promotion). 비우면 그리지 않는다 */
  badge: string;
  /** 클릭 시 이동할 주소 — 비우면 링크 없는 이미지가 된다 */
  linkUrl: string;
  /** 낮을수록 먼저 나온다 */
  order: number;
  startAt: string;
  /** 비우면 종료일 없이 계속 노출 */
  endAt: string;
  visible: boolean;
  createdAt: string;
};

export type PopupPosition = '왼쪽 위' | '가운데' | '오른쪽 아래';

export type PopupRecord = {
  id: string;
  title: string;
  /** HTML — RichTextEditor 가 만든다 */
  body: string;
  linkUrl: string;
  startAt: string;
  endAt: string;
  position: PopupPosition;
  /** 팝업 가로 폭 (px) */
  width: string;
  /** '오늘 하루 보지 않기' 제공 여부 */
  todayClose: boolean;
  visible: boolean;
  createdAt: string;
};

export const POPUP_POSITIONS: PopupPosition[] = ['왼쪽 위', '가운데', '오른쪽 아래'];

export const BANNERS: BannerRecord[] = [
  {
    id: 'B-501',
    title: '여름 리빙 기획전',
    subtitle: '리빙 카테고리 전 품목 ~40%',
    badge: 'Promotion',
    linkUrl: 'https://example.com/events/summer-living',
    order: 1,
    startAt: '2026-07-25',
    endAt: '2026-08-31',
    visible: true,
    createdAt: '2026-07-24',
  },
  {
    id: 'B-502',
    title: '신규 가입 적립금 안내',
    subtitle: '가입 즉시 사용 가능한 적립금',
    badge: '',
    linkUrl: 'https://example.com/events/welcome',
    order: 2,
    startAt: '2026-07-01',
    endAt: '',
    visible: true,
    createdAt: '2026-06-28',
  },
  {
    id: 'B-503',
    title: '아웃도어 브랜드 입점',
    subtitle: '새로 들어온 캠핑 · 등산 용품',
    badge: 'New',
    linkUrl: '',
    order: 3,
    startAt: '2026-06-10',
    endAt: '2026-07-10',
    visible: false,
    createdAt: '2026-06-08',
  },
  {
    id: 'B-504',
    title: '오버셔츠의 계절',
    subtitle: '가볍게 걸치는 여름 아우터',
    badge: '',
    linkUrl: 'https://example.com/events/overshirt',
    order: 4,
    startAt: '2026-07-20',
    endAt: '2026-09-30',
    visible: true,
    createdAt: '2026-07-20',
  },
  {
    id: 'B-505',
    title: '주방 살림 새단장',
    subtitle: '밀폐용기 · 조리도구 ~50%',
    badge: 'Promotion',
    linkUrl: 'https://example.com/events/kitchen',
    order: 5,
    startAt: '2026-07-15',
    endAt: '2026-09-15',
    visible: true,
    createdAt: '2026-07-15',
  },
  {
    id: 'B-506',
    title: '침구 교체 시즌',
    subtitle: '구스 이불 · 커버 세트 기획전',
    badge: 'Promotion',
    linkUrl: 'https://example.com/events/bedding',
    order: 6,
    startAt: '2026-07-10',
    endAt: '2026-09-10',
    visible: true,
    createdAt: '2026-07-10',
  },
];

export const POPUPS: PopupRecord[] = [
  {
    id: 'P-801',
    title: '추석 배송 마감 안내',
    body: '<p>9월 24일 15시 이전 결제 건까지 연휴 전 출고됩니다.</p>',
    linkUrl: 'https://example.com/notices/holiday',
    startAt: '2026-08-01',
    endAt: '2026-08-20',
    position: '가운데',
    width: '360',
    todayClose: true,
    visible: true,
    createdAt: '2026-07-30',
  },
  {
    id: 'P-802',
    title: '앱 설치 안내',
    body: '<p>앱에서 주문하면 적립금을 두 배로 드립니다.</p>',
    linkUrl: '',
    startAt: '2026-07-01',
    endAt: '',
    position: '오른쪽 아래',
    width: '280',
    todayClose: true,
    visible: false,
    createdAt: '2026-06-25',
  },
];

export function findBanner(id: string): BannerRecord | undefined {
  return BANNERS.find((banner) => banner.id === id);
}

/**
 * 다음 노출 순서 — 마지막 번호 다음이다.
 * 사람이 정하면 번호가 겹치거나 비고, 그 상태가 고객 화면 순서로 새어 나간다.
 */
export function nextBannerOrder(banners: readonly BannerRecord[] = BANNERS): number {
  return banners.reduce((biggest, banner) => Math.max(biggest, banner.order), 0) + 1;
}

export function findPopup(id: string): PopupRecord | undefined {
  return POPUPS.find((popup) => popup.id === id);
}

/**
 * 노출 기간에 따른 지금 상태.
 * 노출로 켜 두었어도 기간이 지났으면 고객 화면에는 나오지 않는다 — 그 사실이 목록에 보여야 한다.
 */
export type ScheduleState = '노출 중' | '예정' | '종료' | '숨김';

export function scheduleState(
  item: { visible: boolean; startAt: string; endAt: string },
  today: string,
): ScheduleState {
  if (!item.visible) return '숨김';
  if (item.startAt && today < item.startAt) return '예정';
  if (item.endAt && today > item.endAt) return '종료';
  return '노출 중';
}

export const SCHEDULE_TONE: Record<ScheduleState, string> = {
  '노출 중': 'bg-signal-ok/12 text-signal-ok',
  예정: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  종료: 'bg-signal-danger/12 text-signal-danger',
  숨김: 'bg-surface text-ink-muted',
};

/** 기간을 한 줄로. 종료일이 없으면 '상시'. */
export function periodText(item: { startAt: string; endAt: string }): string {
  if (!item.startAt) return '기간 미설정';
  return item.endAt ? `${item.startAt} ~ ${item.endAt}` : `${item.startAt} ~ 상시`;
}
