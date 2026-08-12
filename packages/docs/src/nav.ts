/**
 * 문서 사이드바가 받는 모양.
 *
 * ## 왜 타입만 여기 있고 목록은 앱에 있나
 * 갈래와 항목은 일곱 앱이 거의 같지만 **완전히 같지는 않다** — 사내 콘솔의 마지막 항목은
 * `Admin Mapping` 이 아니라 `Deployment Mapping` 이고, 장수(`hint`)는 앱마다 다르다.
 * 그래서 `docsNav()` 는 앱이 갖는다.
 *
 * 반면 **모양**은 갈릴 이유가 없다. 타입이 앱마다 한 벌씩 있으면 `DocsSidebar` 를 공유
 * 패키지로 올릴 수 없고, 못 올리면 오십 줄짜리 조각이 일곱 벌로 남는다.
 */
export type NavLink = {
  href: string;
  label: string;
  /** 오른쪽에 작게 붙는 말 — `34장` 처럼 세어 둔 값 */
  hint?: string;
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};
