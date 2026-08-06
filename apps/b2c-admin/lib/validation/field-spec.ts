/**
 * 폼의 **필수 여부를 적어 두는 한 곳**.
 *
 * ## 왜 필요한가
 * 검증 함수(`validateNotice` 등)는 이미 있었지만, "이 칸이 필수인가" 라는 사실이 함수
 * **안쪽에** 묻혀 있었다. 화면은 그것을 볼 방법이 없어서 별표를 붙이지 못했고, 운영자는
 * 저장을 눌러야 무엇이 필수인지 알 수 있었다.
 *
 * 별표를 손으로 붙이면 필수라는 사실이 **화면과 검사 두 곳**에 적힌다. 그러면 반드시
 * 어긋난다 — 검사에서 필수를 뺐는데 별표는 남거나, 검사에 넣었는데 별표를 잊는다.
 * 둘 다 타입은 통과하고, 화면을 하나씩 열어 보기 전에는 드러나지 않는다.
 *
 * 그래서 여기 한 번 적고 **화면과 검사가 같은 것을 읽는다.**
 *
 * ## 검증 함수를 대체하지 않는다
 * 이 표는 `required` 와 라벨만 안다. "http 로 시작하는가" · "2자 이상인가" 같은 **모양
 * 규칙은 여전히 각 `validateX()` 안**에 있다 — 그쪽이 자원마다 다르고 서로 참조하기
 * 때문이다(`banner-record.ts` 가 `content-record.ts` 의 링크 검사를 가져다 쓴다).
 *
 * 나누는 선은 이렇다.
 * - **비어 있는가** → 이 표 (`requiredErrors`)
 * - **모양이 맞는가** → `validateX()`
 */

export type FieldSpec = {
  /** 화면에 그대로 나가는 라벨. 오류 문구도 이 말로 만든다 */
  label: string;
  required?: boolean;
  /** 넣기 **전에** 읽는 안내. 오류가 나면 오류가 이 자리를 대신한다 */
  hint?: string;
};

export type FormSpec<K extends string> = Record<K, FieldSpec>;

/** 화면이 `required` 를 물을 때 쓴다 — `<ContentField required={isRequired(SPEC, 'title')}>` */
export function isRequired<K extends string>(spec: FormSpec<K>, field: K): boolean {
  return spec[field].required === true;
}

/**
 * 스키마가 필수라고 적은 칸 중 **비어 있는 것**을 잡는다.
 *
 * 값이 `string` 이 아닌 칸(불리언 토글·숫자)은 비었다는 개념이 없으므로 건너뛴다 —
 * 체크박스는 끄는 것도 값이라 "비었다" 고 말할 수 없다.
 */
export function requiredErrors<K extends string>(
  spec: FormSpec<K>,
  values: Partial<Record<K, unknown>>,
): Partial<Record<K, string>> {
  const found: Partial<Record<K, string>> = {};

  for (const key of Object.keys(spec) as K[]) {
    if (!spec[key].required) continue;
    const value = values[key];
    if (typeof value !== 'string') continue;
    if (value.trim() === '') found[key] = `${spec[key].label}을(를) 입력해 주세요.`;
  }

  return found;
}

/**
 * 두 검사 결과를 합친다. **앞의 것을 이긴다** — 비어 있다는 말이 모양이 틀렸다는 말보다
 * 먼저 읽혀야 한다. 빈 칸에 대고 "형식이 올바르지 않습니다" 라고 하면 무엇을 하라는 것인지
 * 알 수 없다.
 */
export function mergeErrors<K extends string>(
  first: Partial<Record<K, string>>,
  second: Partial<Record<K, string>>,
): Partial<Record<K, string>> {
  return { ...second, ...first };
}
