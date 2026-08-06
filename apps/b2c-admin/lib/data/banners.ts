/**
 * 저장된 값은 @winpilot/store 한 곳에만 있다.
 * 어드민과 고객 화면이 각자 시드를 들면 두 화면이 서로 다른 것을 보여주게 된다.
 */
import type { BadgeTone } from '@winpilot/ui';
import type { ScheduleState } from '@winpilot/store';

export {
  BANNERS,
  POPUPS,
  POPUP_POSITIONS,
  findBanner,
  findPopup,
  nextBannerOrder,
  periodText,
  scheduleState,
  type BannerRecord,
  type PopupPosition,
  type PopupRecord,
  type ScheduleState,
} from '@winpilot/store';

/**
 * 노출 상태를 무슨 색으로 그릴지. **어드민만 쓴다** — 그래서 공유 패키지가 아니라 여기 있다
 * (`@winpilot/store` 의 `banners.ts` 에 그 경위를 적어 두었다).
 *
 * 값이 클래스 이름이 아니라 `BadgeTone` 인 것이 요점이다. 전에는 `'bg-signal-ok/12
 * text-signal-ok'` 처럼 적혀 있어, 색을 바꾸려면 이런 표 스물한 개를 찾아 고쳐야 했고
 * 다크 모드 접두어를 빠뜨려도 타입이 통과했다. 이제 무엇을 뜻하는지만 적고 실제 색은
 * `Badge` 하나가 안다.
 */
export const SCHEDULE_TONE: Record<ScheduleState, BadgeTone> = {
  '노출 중': 'ok',
  예정: 'brand',
  종료: 'danger',
  숨김: 'neutral',
};
