/**
 * IR Admin 내비게이션.
 *
 * 규칙은 다른 콘솔과 같다 — **사이드바는 최상위만**, 세부는 본문 왼쪽 보조 메뉴에 둔다
 * (`docs/spec/04-ia.md` §4.4). 다르게 두면 콘솔을 오가는 사람이 구조를 두 번 배운다.
 *
 * ## 차례가 곧 IR 담당자의 일 순서다
 * 공시가 먼저다 — 기한이 있고 늦으면 제재를 받는 유일한 갈래다. 그다음이 숫자(재무·주가·배당),
 * 그다음이 사람(주주), 마지막이 밖으로 내보내는 것(자료실·일정·알림).
 *
 * 설정 앞에 선을 하나 긋는다. 위쪽은 **투자자에게 나가는 값**이고 설정부터는 사이트 자체의
 * 값이다(다른 두 콘솔과 같은 규칙).
 */
export type IrMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

export type IrMenuItem = IrMenuChild & {
  children?: IrMenuChild[];
  /** 성격이 다른 갈래 앞의 선 */
  separatedBefore?: boolean;
};

export const IR_MENU: readonly IrMenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/', ready: true },
  {
    /*
      홈페이지 — **투자자 화면이 아니라 회사 홈페이지**를 고치는 자리다.

      공시·재무 위에 두는 이유: 처음 온 사람이 보는 것이 홈페이지이고, 그것을 고치는 일이 가장
      잦다. 아래 갈래들은 정해진 서식이 있어 **때가 되면** 올리는 것(분기 실적, 주주총회)이라
      찾아 들어가는 일이 드물지 않다.
    */
    id: 'site',
    label: '홈페이지',
    href: '/site/services',
    children: [
      { id: 'site-services', label: '서비스', href: '/site/services', ready: true },
      { id: 'site-solutions', label: '솔루션', href: '/site/solutions', ready: true },
      { id: 'site-media', label: '미디어', href: '/site/media', ready: true },
      { id: 'site-legal', label: '약관 · 방침', href: '/site/legal', ready: true },
    ],
  },
  {
    id: 'disclosure',
    label: '공시',
    href: '/disclosures',
    ready: true,
    children: [
      { id: 'disclosure-list', label: '공시 관리', href: '/disclosures', ready: true },
      { id: 'disclosure-dart', label: 'DART 연동', href: '/disclosures/dart', ready: true },
    ],
  },
  {
    id: 'financial',
    label: '재무',
    href: '/financials',
    ready: true,
    children: [
      { id: 'financial-list', label: '재무 정보', href: '/financials', ready: true },
      { id: 'financial-stock', label: '주가 연동', href: '/financials/stock', ready: true },
      { id: 'financial-dividend', label: '배당 정보', href: '/financials/dividends', ready: true },
    ],
  },
  {
    id: 'shareholder',
    label: '주주',
    href: '/shareholders/meetings',
    ready: true,
    children: [
      { id: 'shareholder-meeting', label: '주주총회', href: '/shareholders/meetings', ready: true },
      { id: 'shareholder-governance', label: '지배구조', href: '/shareholders/governance', ready: true },
    ],
  },
  {
    id: 'library',
    label: '자료',
    href: '/library',
    ready: true,
    children: [
      { id: 'library-list', label: 'IR 자료실', href: '/library', ready: true },
      { id: 'library-schedule', label: 'IR 일정', href: '/library/schedules', ready: true },
      { id: 'library-notify', label: '알림 발송', href: '/library/notifications', ready: true },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/locales',
    ready: true,
    separatedBefore: true,
    children: [{ id: 'settings-locale', label: '국문 · 영문', href: '/settings/locales', ready: true }],
  },
];

export function findIrSection(id: string): IrMenuItem | undefined {
  return IR_MENU.find((item) => item.id === id);
}

/** 아직 만들지 않은 화면은 링크를 걸지 않는다. */
export function linkFor(item: IrMenuChild): string {
  return item.ready ? item.href : '#none';
}
