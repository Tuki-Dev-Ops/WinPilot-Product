import type { GlossaryEntry } from './glossary';

/**
 * F&B 한 쌍이 쓰는 정규 용어. 나눠 둔 까닭은 `features-ir.ts` 머리말과 같다.
 *
 * 여기에는 **F&B 에서 처음 생긴 자원만** 적는다. `notice` `faq` `banner` `popup` `inquiry`
 * `staff` `category` `terms` `privacy` `site` 는 이미 `glossary.ts` 에 있고, 같은 자원을
 * 제품마다 다른 이름으로 부르는 순간 이 사전이 막으려던 표류가 그대로 돌아오므로 재사용한다.
 */
export const FNB_GLOSSARY: readonly GlossaryEntry[] = [
  {
    canonical: 'brand',
    ko: '브랜드',
    banned: ['identity', 'logo'],
    note: "상호·로고·연락처·푸터 문구처럼 사이트 전체에 깔리는 값 한 벌. `profile`(회사 소개)과 나눈 이유는 이것이 읽을거리가 아니라 **모든 화면이 읽는 설정**이기 때문이다 — 국밥 브랜드에서 이름을 갈아 끼울 때 화면에 박아 둔 글자가 남는 자리가 실제로 있었다.",
  },
  {
    canonical: 'menu',
    ko: '메뉴',
    banned: ['dish', 'food', 'recipe', 'lineup'],
    note: "메뉴판에 오르는 한 품목. `menuItem` 으로 쓰면 `item` 이 product 의 금지어라 걸린다 — 한 낱말 `menu` 로 쓴다. 사이드바의 '메뉴'(내비게이션)와 글자가 같지만 그쪽은 자원이 아니라 화면 구성이므로 엔티티로 올라오지 않는다.",
  },
  {
    canonical: 'store',
    ko: '가맹점',
    banned: ['shop', 'branch', 'outlet'],
    note: "문을 연 가맹점 하나. 본사(brand)와 나눈다 — 사이트의 `지금 N곳` 은 store 를 세고, 푸터에 적히는 상호는 brand 에서 온다.",
  },
  {
    canonical: 'franchise',
    ko: '창업',
    banned: ['startup', 'recruit'],
    note: '창업 비용·절차처럼 **가맹 조건 한 벌**을 가리킨다. 개별 가맹점(store)이 아니라 그것을 열기까지의 조건이라 이름을 나눈다. 사이트의 창업안내와 인테리어가 둘 다 이 값을 읽는다.',
  },
  {
    canonical: 'interior',
    ko: '인테리어',
    banned: ['construction', 'fitout', 'remodel'],
    note: '평형별 계획·평당 단가·완성 매장 사진. 창업 비용(franchise)의 한 항목이지만 사이트에서 화면 하나를 통째로 쓰므로 자원 이름을 갖는다.',
  },
  {
    canonical: 'marketing',
    ko: '마케팅',
    banned: ['campaign', 'promotion', 'sns'],
    note: '본사가 채널별로 올리는 글. 손님에게 나가는 배너(banner)와 달리 **가맹점주에게 보여 주는 본사의 활동**이라 자원이 다르다.',
  },
];
