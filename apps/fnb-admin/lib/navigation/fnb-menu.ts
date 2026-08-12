/**
 * F&B Admin 의 갈래.
 *
 * ## 사이트가 읽는 값마다 고치는 자리가 하나씩 있다
 * 이 콘솔의 화면은 **사이트에 실제로 나가는 것**에서 거꾸로 짰다. 손님이 보는 메뉴판 · 매장
 * 찾기 · 마케팅 · 배너, 차리려는 사람이 보는 창업 문의와 FAQ. 사이트에 있는데 여기서 못 고치는
 * 값이 남으면 그 값은 결국 개발자에게 부탁하는 일이 되고, 그러면 아무도 안 고친다.
 *
 * ## 하는 일로 나눈다 — 자원으로 나누지 않고
 * `메뉴 · 매장 · 배너 · FAQ` 를 최상위에 평평하게 늘어놓을 수도 있었다. 그러면 갈래가 여덟이
 * 넘고, **매일 쓰는 것과 한 달에 한 번 쓰는 것**이 같은 층에 선다.
 *
 * 지금은 **등록**(매일 손대는 것) · **창업**(문의가 들어오면) · **고객센터** · **배너** ·
 * **설정**(가끔) 다섯이다. 오른쪽으로 갈수록 손대는 주기가 길어진다.
 *
 * ## 설정에 `공급자 관리` 가 있었다
 * 식자재를 대는 업체 목록으로 만들었다가 걷어냈다. 이 콘솔의 다른 화면은 전부 **사이트에 그대로
 * 나가는 값**을 다루는데 그 하나만 아니었고, 무엇보다 이 브랜드가 지금 그 목록을 어드민에서
 * 관리하기로 정한 적이 없다. 필요해지는 날 **무엇을 위한 목록인지 정한 뒤에** 다시 만든다.
 *
 * ## FAQ 가 두 곳에 있다
 * 창업 아래와 고객센터 아래에 하나씩. 같은 목록(`FNB_FAQS`)을 `audience` 로 갈라 본다.
 * 한 화면에 두고 거르개로 나눌 수도 있었지만, **답하는 사람이 다르다** — 창업 물음은 가맹
 * 담당이 답하고 손님 물음은 매장 담당이 답한다. 자기 것만 보이는 편이 낫다.
 *
 * ## 통계가 없다
 * IR 어드민에는 있다. 여기는 없다 — 매장 매출과 방문자 수는 POS 와 배달앱이 갖고 있고, 그것을
 * 여기로 옮겨 오면 **두 곳의 숫자가 다른 상태**가 만들어진다. 어느 쪽이 맞는지 아무도 모르게
 * 되면 두 화면 다 안 보게 된다. 필요해지는 날 POS 를 읽어 오는 방식으로 붙인다.
 */
export type FnbMenuChild = {
  id: string;
  label: string;
  href: string;
};

/** 갈래 하나. */
export type FnbMenuItem = FnbMenuChild & {
  children?: FnbMenuChild[];
  /** 성격이 다른 갈래 앞의 선 */
  separatedBefore?: boolean;
};

export const FNB_MENU: readonly FnbMenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/' },
  {
    id: 'register',
    label: '등록',
    href: '/menus',
    children: [
      { id: 'register-menu', label: '메뉴', href: '/menus' },
      { id: 'register-marketing', label: '마케팅', href: '/marketing' },
      { id: 'register-store', label: '가맹점', href: '/stores' },
    ],
  },
  {
    id: 'franchise',
    label: '창업',
    href: '/inquiries',
    children: [
      { id: 'franchise-inquiry', label: '문의 내역', href: '/inquiries' },
      { id: 'franchise-faq', label: 'FAQ', href: '/franchise/faqs' },
      /*
        창업 비용과 절차. 요청한 트리에는 없었는데, **사이트의 창업 안내 화면이 이 값을 읽는다** —
        여기서 뺐다면 비용표를 고칠 자리가 어디에도 없어진다. 창업 아래가 제자리다.
      */
      { id: 'franchise-cost', label: '비용 · 절차', href: '/settings/franchise' },
    ],
  },
  {
    id: 'support',
    label: '고객센터',
    href: '/support/faqs',
    children: [
      { id: 'support-faq', label: 'FAQ', href: '/support/faqs' },
      /* 공지사항도 같은 까닭으로 남긴다 — 홈의 공지 띠와 고객센터 화면이 이 값을 읽는다. */
      { id: 'support-notice', label: '공지사항', href: '/support/notices' },
    ],
  },
  {
    id: 'banner',
    label: '배너',
    href: '/banners/main',
    children: [
      { id: 'banner-main', label: '메인 비주얼', href: '/banners/main' },
      { id: 'banner-popup', label: '팝업', href: '/banners/popups' },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/brand',
    separatedBefore: true,
    children: [
      /*
        브랜드 정보가 먼저다. 사이트의 첫 화면 · 푸터 · 창구 번호가 이 값을 읽어, 설정 아래에서
        **실제로 손대는 일이 가장 잦은** 화면이다.
      */
      { id: 'settings-brand', label: '브랜드 정보', href: '/settings/brand' },
      { id: 'settings-admin', label: '관리자', href: '/settings/admins' },
    ],
  },
];

export function findFnbSection(id: string): FnbMenuItem | undefined {
  return FNB_MENU.find((item) => item.id === id);
}
