import { Badge } from '@winpilot/ui';

/**
 * 노출 여부를 나타내는 말. **화면에 적는 것과 확인 창에 적는 것이 같아야 한다.**
 *
 * 목록은 배지로, 저장 확인 창은 요약 줄의 값으로 같은 말을 쓴다. 두 자리에 따로 적어 두면
 * 한쪽만 `공개`로 바뀌는 날이 오고, 그때 운영자는 방금 무엇을 저장했는지 확신하지 못한다.
 */
export function visibilityLabel(visible: boolean): '노출' | '숨김' {
  return visible ? '노출' : '숨김';
}

/**
 * 노출/숨김 배지 — 어드민 목록 일곱 화면이 같은 것을 쓴다.
 *
 * 배너 · 팝업 · 연혁 · FAQ · 뉴스 · 공지 · 포트폴리오 · 리뷰 · 카테고리. 전부
 * `<Badge tone={x.visible ? 'ok' : 'neutral'}>{x.visible ? '노출' : '숨김'}</Badge>` 를
 * 손으로 적고 있었다. 짧아서 눈에 안 띄는 되풀이인데, 되풀이의 값이 **두 군데**(색과 말)라
 * 한쪽만 바꾼 화면이 생기기 쉽다.
 *
 * `ok` 를 쓰는 이유: 노출은 '잘 되고 있다' 는 뜻이지 '좋다' 는 뜻이 아니다. 숨김은 잘못이
 * 아니라 운영자가 그렇게 정한 상태이므로 `danger` 가 아니라 `neutral` 이다 — 붉게 두면
 * 고쳐야 할 것으로 읽힌다.
 */
export function AdminVisibilityBadge({ visible }: { visible: boolean }) {
  return <Badge tone={visible ? 'ok' : 'neutral'}>{visibilityLabel(visible)}</Badge>;
}
