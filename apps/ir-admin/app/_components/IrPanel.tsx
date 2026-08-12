/**
 * 카드 · 요약 숫자 · 빈 상태 · 표 머리와 발 — 이제 `@winpilot/ui` 가 갖는다.
 *
 * ## 왜 올렸나
 * F&B 어드민이 생기면서 같은 것을 쓰기로 정했다. 그때부터 앱마다 두는 것은 **두 벌을 만드는
 * 일**이 된다 — 올릴지 말지의 기준은 "화면 구조를 아느냐" 가 아니라 "두 앱이 같은 것을 쓰기로
 * 정했느냐" 다(`@winpilot/ui` 머리말).
 *
 * ## 이 겹을 남겨 두는 이유
 * 이 콘솔의 화면 마흔일곱이 여기서 가져다 쓴다. import 를 한꺼번에 고치지 않으려는 것이 아니라,
 * **이 콘솔이 앞으로 갈라질 수 있는 자리**를 하나로 유지하기 위해서다 — IR 어드민에만 필요한
 * 칸이 생기는 날 고치는 곳은 여기 한 곳이다. `IrField` 가 `Field` 를 감싸는 것과 같은 판단이다.
 */
export {
  Panel as IrPanel,
  PanelEmpty as IrEmpty,
  PanelSummary as IrSummary,
  TableHead as IrTableHead,
  TableFoot as IrTableFoot,
  type SummaryCard,
} from '@winpilot/ui';
