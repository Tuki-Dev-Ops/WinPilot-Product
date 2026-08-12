/**
 * 목록 표 — 이제 `@winpilot/ui` 의 `RecordTable` 이다.
 *
 * F&B 어드민이 같은 표를 쓰기로 하면서 올렸다. 콘솔마다 두면 나중에 만든 콘솔일수록 확인 창이
 * 빠지고 검사가 느슨해진다 — 이미 다른 두 콘솔에서 겪은 일이다.
 *
 * 열두 칸 중 아홉만 넘긴다는 규칙과 그 이유는 올라간 쪽 머리말에 그대로 있다.
 *
 * 이 겹을 남겨 두는 이유는 `IrPanel` 과 같다.
 */
export { RecordTable as IrRecordTable, type RecordColumn as IrColumn } from '@winpilot/ui';
