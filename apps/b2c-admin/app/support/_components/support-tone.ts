import type { BadgeTone } from '@winpilot/ui';
import type { SupportState } from '@winpilot/store';

/**
 * 상태에 붙는 색.
 *
 * 공유 패키지(`@winpilot/store`)에 두지 않는 이유: 그쪽은 `@winpilot/ui` 를 알지 못하고,
 * 알게 하면 값만 쓰려는 곳까지 UI 를 함께 끌고 온다. 사내 콘솔에도 같은 표가 따로 있는데
 * (`internal-admin` 의 `INQUIRY_TONE`), **색은 콘솔마다 다를 수 있는 것**이라 그대로 둔다 —
 * 갈라지면 안 되는 것은 상태 이름이고, 그 이름은 한 곳에서 온다.
 */
export const SUPPORT_TONE: Record<SupportState, BadgeTone> = {
  접수: 'brand',
  처리중: 'brand',
  답변완료: 'ok',
  보류: 'neutral',
};
