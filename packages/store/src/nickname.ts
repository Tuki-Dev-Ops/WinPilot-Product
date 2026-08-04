/**
 * 닉네임 자동 생성 — **규칙은 한 곳에만 둔다.**
 *
 * 가입 화면과 내 정보 수정 화면이 각각 재료를 들고 있으면, 가입 때 만들어지는 이름과 나중에
 * 다시 만드는 이름이 다른 모양이 된다. 운영자가 사용자를 추가할 때도 같은 규칙을 써야 한다.
 *
 * 무작위를 쓰지만 **어디서 쓰는지가 중요하다**: 화면을 그릴 때가 아니라 사용자가 단추를
 * 누를 때만 부른다. 렌더 중에 부르면 서버와 브라우저가 다른 값을 그려 화면이 어긋난다.
 *
 * ## 어드민 연동
 * - `b2c-admin` 사용자 > 사용자 추가에서도 같은 함수를 쓴다 (닉네임을 비우고 저장할 때)
 */
const HEAD = ['푸른', '고요한', '느긋한', '작은', '단단한', '맑은', '따뜻한', '조용한', '가벼운'];
const TAIL = ['바람', '숲길', '오후', '항해', '언덕', '물결', '겨울', '골목', '나침반'];

export function randomNickname(): string {
  const head = HEAD[Math.floor(Math.random() * HEAD.length)];
  const tail = TAIL[Math.floor(Math.random() * TAIL.length)];
  // 네 자리 숫자를 붙여 같은 조합이 겹칠 확률을 줄인다 — 서버가 생기면 중복 검사가 이 자리에 온다.
  const number = 1000 + Math.floor(Math.random() * 9000);
  return `${head}${tail}${number}`;
}
