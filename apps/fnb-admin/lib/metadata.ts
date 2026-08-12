import { FNB_BRAND } from '@winpilot/store';

/**
 * 브라우저 탭에 서는 제목.
 *
 * ## 왜 화면마다 적지 않나
 * 이 콘솔의 화면 열둘이 전부 `— {브랜드} F&B Admin` 으로 끝난다. 화면마다 적어 두었더니
 * 브랜드명을 바꾸는 날 **열두 곳이 옛 이름으로 남았다.** 탭 제목은 화면 안에 안 보이는 값이라,
 * 그 어긋남은 탭을 여럿 띄워 놓고 훑기 전에는 드러나지 않는다.
 *
 * 실제로 겪은 일이다 — 이 파일은 그 뒤에 생겼다.
 *
 * ## 이름 순서
 * `메뉴 | 목록` 처럼 **큰 갈래를 앞에** 둔다. 탭이 좁아지면 뒤가 잘리는데, 그때 남아야 하는
 * 것은 어느 갈래인지다.
 */
export function adminTitle(...trail: string[]): string {
  return `${trail.join(' | ')} — ${FNB_BRAND.nameEn} F&B Admin`;
}
