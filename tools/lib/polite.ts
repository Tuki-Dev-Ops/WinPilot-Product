/**
 * 저장소 안의 글을 **밖으로 내보내는 문체**로 올린다 — 해라체(`-ㄴ다`)와 명사형(`-기`)을
 * 합쇼체(`-습니다`)로.
 *
 * ## 왜 원본을 안 고치나
 * 화면 명세(`lib/screen-specs.ts`)는 만드는 사람끼리 읽는 글이라 짧고 단정적인 해라체로
 * 적혀 있다. 그 문체가 나쁜 것이 아니라 **읽는 사람이 다르다** — 코드 옆에서는 "내려 둔
 * 메뉴는 굴림판에 오지 않는다" 가 낫고, 발주처에 내는 문서에서는 "…오지 않습니다" 여야 한다.
 *
 * 그렇다고 명세를 합쇼체로 바꾸면 코드 옆의 글이 길어지고 읽는 속도가 떨어진다. 그래서
 * **원본은 그대로 두고 내보낼 때만 바꾼다.** 문서를 두 벌로 두지 않으려는 것이다.
 *
 * ## 손으로 규칙을 짐작하지 않았다
 * 어미 규칙을 머리로 정하면 코퍼스에 없는 경우까지 처리하려다 있는 경우를 틀린다. 먼저
 * 명세 866문장의 끝 세 글자를 전부 세어 실제로 쓰인 어미만 추렸고(`않는다` 62 · `없다` 41 ·
 * `한다` 36 · `읽는다` 23 · `쓴다` 22 …), 그 목록에 맞춰 규칙을 짰다.
 *
 * ## 자모를 직접 만진다
 * `한다 → 합니다` 는 낱말을 바꿔치기하는 것이 아니라 **받침 ㄴ 을 ㅂ 으로 바꾸는** 일이다.
 * 낱말 사전을 두면 `세운다` · `넘긴다` 처럼 목록에 없던 말이 나올 때마다 사전을 고쳐야 하고,
 * 실제로는 아무도 안 고친다. 한글은 자모가 규칙적이라 이렇게 다루는 편이 오래간다.
 */

const BASE = 0xac00;
const LAST = 0xd7a3;
const JUNG = 21;
const JONG = 28;

/** 종성 자리 번호 — 표준 순서. 여기서 쓰는 것만 이름을 붙인다. */
const NONE = 0;
const NIEUN = 4;
const RIEUL = 8;
const BIEUP = 17;

type Syllable = { cho: number; jung: number; jong: number };

const isHangul = (ch: string): boolean => {
  const code = ch.codePointAt(0) ?? 0;
  return code >= BASE && code <= LAST;
};

const split = (ch: string): Syllable => {
  const code = (ch.codePointAt(0) ?? 0) - BASE;
  return {
    cho: Math.floor(code / (JUNG * JONG)),
    jung: Math.floor((code % (JUNG * JONG)) / JONG),
    jong: code % JONG,
  };
};

const join = ({ cho, jung, jong }: Syllable): string =>
  String.fromCodePoint(BASE + cho * JUNG * JONG + jung * JONG + jong);

/** 마지막 글자의 받침을 바꾼다. 한글이 아니면 그대로 둔다. */
const withJong = (word: string, jong: number): string => {
  const last = word.at(-1) ?? '';
  if (!isHangul(last)) return word;
  return word.slice(0, -1) + join({ ...split(last), jong });
};

const jongOf = (word: string): number => {
  const last = word.at(-1) ?? '';
  return isHangul(last) ? split(last).jong : -1;
};

/**
 * 어간에 합쇼체 종결을 붙인다.
 *
 * - 받침이 없으면 `ㅂ니다` — 고르 → 고릅니다
 * - 받침이 `ㄹ` 이면 `ㄹ` 이 빠지고 `ㅂ니다` — 열 → 엽니다
 * - 그 밖의 받침이면 `습니다` — 넣 → 넣습니다
 */
export const conjugate = (stem: string): string => {
  const jong = jongOf(stem);
  if (jong === NONE) return `${withJong(stem, BIEUP)}니다`;
  if (jong === RIEUL) return `${withJong(stem, BIEUP)}니다`;
  return `${stem}습니다`;
};

/** `-하다` 를 붙여 쓰는 한자어. 여기 없는 명사에는 아무것도 붙이지 않는다 — `묶음합니다` 가 되어서는 안 된다. */
const VERBAL_NOUN = new Set([
  '이동', '검색', '삭제', '등록', '저장', '공개', '확인', '노출', '수정', '추가', '취소',
  '복사', '정렬', '선택', '입력', '발행', '게시', '신청', '조회', '변경', '해제', '첨부',
  '제출', '반려', '승인', '보관', '고정', '해지', '연동', '적용', '반영', '초기화',
]);

/**
 * 문장 하나를 합쇼체로. 이미 합쇼체(`…니다`)면 손대지 않는다.
 *
 * 마침표와 그 뒤의 여백은 그대로 돌려준다 — 문장 끝을 다듬느라 문단의 생김새가 바뀌면
 * 원본과 대조할 수 없게 된다.
 */
const oneSentence = (text: string, navigates: boolean): string => {
  const match = /^(.*?)([.!?]*)$/s.exec(text.trimEnd());
  if (!match) return text;
  const [, body, mark] = match;
  const tail = text.slice(text.trimEnd().length);

  /*
    줄표 앞뒤는 각각 하나의 절이다. 뒤만 고치면 "…않는다 — …아닙니다." 처럼 한 문장 안에서
    말투가 갈린다. 명세가 줄표로 까닭을 덧붙이는 꼴을 자주 쓰므로 절마다 손본다.
  */
  const clauses = body
    .split(/( — )/)
    .map((part) => (part === ' — ' ? part : parenthesised(part)))
    .join('');

  return clauses + mark + tail;

  /**
   * 괄호로 덧붙인 말도 문장이다 — `당기기(다시 누르면 놓는다)` 는 두 군데를 고쳐야 한다.
   *
   * 다만 괄호 안이 `(선택)` · `(필수)` 처럼 한 낱말이면 그것은 문장이 아니라 표시다. 손대면
   * `(선택합니다)` 가 된다. 띄어쓰기가 있는 것만 절로 본다.
   */
  function parenthesised(part: string): string {
    const wrapped = /^(.*)\((.+)\)$/s.exec(part);
    if (!wrapped) return polite(part);
    const inner = wrapped[2].includes(' ') ? polite(wrapped[2]) : wrapped[2];
    return `${polite(wrapped[1])}(${inner})`;
  }

  function polite(word: string): string {
    /* `아니다` 가 `니다` 로 끝나 이미 합쇼체로 보인다. 아래 검사보다 먼저 걸러야 한다. */
    if (word.endsWith('아니다')) return `${word.slice(0, -3)}아닙니다`;
    if (word.endsWith('니다')) return word;

    if (word.endsWith('이다')) return `${word.slice(0, -2)}입니다`;
    /* `읽는다 → 읽습니다`. `-는다` 는 앞말에 받침이 있을 때의 현재 서술형이다. */
    if (word.endsWith('는다')) return `${word.slice(0, -2)}습니다`;

    if (word.endsWith('다')) {
      const stem = word.slice(0, -1);
      const jong = jongOf(stem);
      /* `한다 → 합니다`. 받침 ㄴ 이 곧 현재 서술형 표지라, ㅂ 으로 바꾸고 `니다` 를 붙인다. */
      if (jong === NIEUN) return `${withJong(stem, BIEUP)}니다`;
      if (jong > 0) return `${stem}습니다`;
      /*
        받침 없는 말 뒤의 `다` 는 `이다` 가 줄어든 것이다 — 순서다 → 순서입니다.
        한글이 아닌 것 뒤에 온 `다` 도 같다 — `404 다` → `404 입니다`.
      */
      if (jong <= NONE) return `${stem}입니다`;
      return word;
    }

    /* 명사형 `-기` — 명세의 기능 목록이 이 꼴로 적혀 있다. 고르기 → 고릅니다 */
    if (word.endsWith('기') && word.length > 1) return conjugate(word.slice(0, -1));

    /*
      `-하다` 명사에 종결을 붙이는 것은 **기능 목록에서만** 한다. 구성 영역 설명은
      `코드 · 이름 · 묶음 · 값 · 열량 · 설명 · 노출` 처럼 명사를 늘어놓고 끝나는데,
      거기에 붙이면 마지막 낱말만 `노출합니다` 가 되어 나열이 깨진다.
    */
    if (navigates && VERBAL_NOUN.has(word.slice(-2))) return `${word}합니다`;

    /*
      `…공지사항으로` 처럼 자리만 가리키고 끝나는 기능 줄이 있다. 기능 목록에서는 이것이
      "그리로 간다" 는 뜻이므로 종결을 채운다. 구성 영역 설명에서는 뜻이 다르므로
      (`표가 붙은 것부터 굴림판으로`) 그쪽에서는 이 규칙을 켜지 않는다.
    */
    if (navigates && /[으]?로$/.test(word)) return `${word} 이동합니다`;

    /* 여기까지 오면 명사구다. 억지로 종결을 붙이면 없던 말이 생긴다 — 그대로 둔다. */
    return word;
  }
};

/**
 * 여러 문장이 든 글을 합쇼체로.
 *
 * 문장을 마침표로 나눌 때 소수점과 줄임표를 건드리지 않도록, **마침표 뒤에 공백이 오는
 * 자리**에서만 자른다.
 */
export const formal = (text: string): string =>
  text
    .split(/(?<=[.!?])(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : oneSentence(part, false)))
    .join('');

/**
 * 기능 목록에 쓰는 글. `formal` 과 같되, 자리만 가리키고 끝나는 줄에 `이동합니다` 를 채운다.
 *
 * 이 규칙을 `formal` 에 넣지 않은 것은 같은 `…로` 가 자리에 따라 다른 뜻이기 때문이다 —
 * 기능에서는 "그리로 간다" 지만, 구성 영역 설명에서는 "그것으로 채운다" 에 가깝다.
 */
export const formalAction = (text: string): string =>
  text
    .split(/(?<=[.!?])(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : oneSentence(part, true)))
    .join('');
