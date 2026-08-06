/**
 * 폼 검증 — 이 콘솔에는 **검증 계층이 아예 없었다.**
 *
 * ## 전에는 어땠나
 * 열한 개 폼이 저마다 이렇게 적고 있었다.
 *
 * ```ts
 * if (!draft.name.trim() || !draft.team.trim()) {
 *   toast.error({ message: '등록하지 못했습니다.', detail: '이름과 소속은 반드시 입력해야 합니다.' });
 *   return;                                     // ← 여기서 끝난다
 * }
 * if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) { ... return; }
 * ```
 *
 * 세 가지가 잘못돼 있었다.
 *
 * 1. **첫 실패에서 멈춘다.** 이름과 이메일이 둘 다 틀렸으면 이름을 고쳐 다시 누르고 나서야
 *    이메일이 틀렸다는 것을 안다. 칸이 여섯인 폼에서는 여섯 번 눌러야 다 고친다.
 * 2. **어느 칸이 틀렸는지 화면에 남지 않는다.** 토스트는 몇 초 뒤 사라지고, 그 뒤에는
 *    무엇을 고쳐야 하는지 알 방법이 없다.
 * 3. **필수라는 사실이 코드 안에만 있다.** 화면에 별표가 없으니 저장을 눌러야 알 수 있었다.
 *
 * ## 지금
 * 폼마다 **필드 표**를 두고, 그 표가 별표와 검사를 함께 만든다. 검사는 **모든 칸을 끝까지
 * 돌아** 틀린 것을 한꺼번에 돌려준다.
 */

export type Rule = {
  /** 규칙에 걸렸을 때 보여 줄 말. 무엇을 하라는 말로 적는다 */
  message: string;
  /** 값이 규칙에 맞으면 true. **빈 값은 여기 오지 않는다** — 필수 검사가 먼저 끝난다 */
  test: (value: string) => boolean;
};

export type FieldSpec = {
  label: string;
  required?: boolean;
  /** 넣기 전에 읽는 안내 */
  hint?: string;
  /** 모양 규칙. 위에서부터 보고 처음 걸린 것 하나만 알린다 */
  rules?: Rule[];
};

export type FormSpec<K extends string> = Record<K, FieldSpec>;
export type FormErrors<K extends string> = Partial<Record<K, string>>;

/* ── 자주 쓰는 규칙 ──────────────────────────────────────────────────────
   화면마다 정규식을 다시 적으면 같은 검사가 조금씩 다르게 굳는다. 실제로
   이메일 검사가 `settings/staff` 와 `tenants/contacts` 에 따로 적혀 있었다. */

export const EMAIL: Rule = {
  message: '이메일 형식이 올바르지 않습니다. (예: name@example.com)',
  test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
};

export const DATE: Rule = {
  message: '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.',
  test: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
};

/** 숫자만. 천 단위 쉼표는 사람이 넣기 마련이라 지우고 본다. */
export const DIGITS: Rule = {
  message: '숫자만 입력해 주세요.',
  test: (value) => /^\d+$/.test(value.replace(/,/g, '')),
};

export const PHONE: Rule = {
  message: '숫자와 하이픈만 입력해 주세요. (예: 02-1234-5678)',
  test: (value) => /^[\d-]{7,}$/.test(value),
};

/** 0보다 커야 하는 금액·수량. `DIGITS` 다음에 둔다. */
export const POSITIVE: Rule = {
  message: '0보다 큰 값을 입력해 주세요.',
  test: (value) => Number(value.replace(/,/g, '')) > 0,
};

export function minLength(n: number): Rule {
  return { message: `${n}자 이상 입력해 주세요.`, test: (value) => value.length >= n };
}

export function maxLength(n: number): Rule {
  return { message: `${n}자 이하로 입력해 주세요.`, test: (value) => value.length <= n };
}

/** 이미 있는 값인지. 목록을 넘겨 받아 확인한다 — 중복은 폼 밖의 사실이라 규칙으로 받는다. */
export function notIn(taken: readonly string[], message: string): Rule {
  const lowered = taken.map((one) => one.trim().toLowerCase());
  return { message, test: (value) => !lowered.includes(value.trim().toLowerCase()) };
}

/**
 * 폼 하나를 검사한다.
 *
 * **끝까지 돈다.** 처음 걸린 칸에서 멈추지 않으므로, 운영자는 한 번 누르고 틀린 곳을
 * 전부 본다.
 *
 * 한 칸 안에서는 처음 걸린 규칙 하나만 알린다 — 한 칸에 오류 세 줄이 붙으면 무엇부터
 * 고쳐야 할지 알 수 없다.
 */
export function validate<K extends string>(
  spec: FormSpec<K>,
  values: Record<K, string>,
): FormErrors<K> {
  const errors: FormErrors<K> = {};

  for (const key of Object.keys(spec) as K[]) {
    const field = spec[key];
    const raw = values[key] ?? '';
    const value = raw.trim();

    if (!value) {
      if (field.required) errors[key] = `${field.label}을(를) 입력해 주세요.`;
      // 선택 항목이 비어 있으면 모양은 보지 않는다 — 비울 수 있다고 해 놓고 형식을 따지면 안 된다.
      continue;
    }

    const broken = (field.rules ?? []).find((rule) => !rule.test(value));
    if (broken) errors[key] = broken.message;
  }

  return errors;
}

export function hasErrors<K extends string>(errors: FormErrors<K>): boolean {
  return Object.keys(errors).length > 0;
}

/** 토스트에 적을 한 줄. 몇 개가 남았는지가 먼저 읽혀야 한다. */
export function errorSummary<K extends string>(errors: FormErrors<K>): string {
  const count = Object.keys(errors).length;
  return `확인이 필요한 항목이 ${count}개 있습니다.`;
}
