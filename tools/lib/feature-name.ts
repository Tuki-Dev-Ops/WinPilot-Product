import { kindIn, type ActionKind } from './action-kind';

/**
 * 화면 명세의 기능 한 줄을 **기능 명칭**으로 바꾼다 — `상품 등록 기능 제공` 꼴.
 *
 * ## 왜 원문을 그대로 쓰지 않나
 * 화면 명세는 만드는 사람끼리 읽는 글이라 손짓으로 적혀 있다 — `지키는 것 셋 읽기`,
 * `왼쪽 기둥에서 묶음 고르기`. 그 말은 화면 앞에 앉은 사람에게는 통하지만, **기능 목록에
 * 나열되면 무슨 기능인지 읽히지 않는다.** 발주처가 세는 것은 손짓이 아니라 기능이다.
 *
 * 여기서 하는 일은 번역이지 창작이 아니다. 대상은 원문의 것을 그대로 쓰고, 동사만 동작 유형이
 * 정한 말로 바꿔 세운다. 원문에 없는 대상을 지어내지 않는다.
 *
 * ## 세 갈래로 가른다
 * 1. 이미 기능을 가리키는 말로 끝나면(`상담 신청`) 그대로 두고 `기능 제공` 만 붙인다.
 * 2. 손짓으로 끝나면(`… 읽기`) 그 꼬리를 떼고 유형이 정한 말을 세운다.
 * 3. 어느 쪽도 아니면 원문을 그대로 두고 유형만 세운다 — 떼어 낼 것이 없으면 떼지 않는다.
 */

/** 그 자체로 기능을 가리키는 말. 떼면 남는 것이 뜻을 잃는다 — `개인정보 수집 · 이용 동의`. */
const FEATURE = [
  '동의',
  '신청',
  '접수',
  '등록',
  '검색',
  '저장',
  '삭제',
  '수정',
  '이동',
  '전송',
  '발송',
  '인쇄',
  '초기화',
  '다운로드',
  '필터',
  '조회',
  '상태 변경',
];

/**
 * 손짓을 가리키는 꼬리. 긴 것이 먼저 걸려야 한다 — `펴 보기` 가 `보기` 로 잘리면
 * `펴` 라는 말만 남는다.
 */
const GESTURE = [
  '선택 시 상세 페이지로 이동',
  '선택 시 답변 표시',
  '선택 시 본문 표시',
  '넘겨 보기',
  '밀어 보기',
  '펴 보기',
  '끄고 켜기',
  '들어가기',
  '돌아가기',
  '바로가기',
  '내려받기',
  '살펴보기',
  '확인하기',
  '읽어보기',
  '고르기',
  '거르기',
  '좁히기',
  '고치기',
  '바꾸기',
  '정하기',
  '지우기',
  '남기기',
  '채우기',
  '올리기',
  '만들기',
  '당기기',
  '누르기',
  '훑기',
  '열기',
  '읽기',
  '보기',
  '넣기',
  '쓰기',
  '빼기',
  '세기',
  '확인',
  '조회',
  '선택',
  '입력',
  '설정',
];

/** 유형이 정한 기능 말. 손짓을 뗀 자리에 이것이 선다. */
const WORD: Record<ActionKind, string> = {
  이동: '이동',
  검색: '검색',
  필터: '필터',
  등록: '등록',
  수정: '수정',
  삭제: '삭제',
  '상태 변경': '상태 변경',
  표시: '조회',
  미분류: '',
};

/** 꼬리를 뗀 자리에 남는 조사. `매장 찾기로` 의 `로` 가 그대로 서면 문장이 끊긴 것처럼 읽힌다. */
const PARTICLE = /(으로|로|를|을|이|가|은|는|와|과|에서|에)$/;

/** 여는 자리를 가리키는 말. `왼쪽 기둥에서 묶음` 의 앞부분은 기능이 아니라 위치다. */
const PLACE = /^\S+(?:\s\S+)?에서\s+/;

/** 앞의 자리말과 뒤의 조사를 턴다. `왼쪽 기둥에서 자주 묻는 질문으로` 에서 남길 것은 가운데뿐이다. */
const bareTarget = (text: string): string => text.replace(PLACE, '').replace(PARTICLE, '').trim();

/**
 * 기능 한 줄의 이름.
 *
 * 괄호는 떼었다가 뒤에 다시 붙인다 — `(선택)` 은 기능의 이름이 아니라 그 기능의 조건인데,
 * 이름 가운데에 끼면 `하고 싶은 말(선택) 등록 기능` 처럼 읽힌다.
 */
export const featureName = (action: string, kind: ActionKind): string => {
  const paren = /\s*\(([^)]*)\)\s*$/.exec(action);
  const bare = (paren ? action.slice(0, paren.index) : action).trim();
  const tail = paren ? ` (${paren[1]})` : '';

  /* 꼬리가 이미 기능을 가리키면 그 말을 그대로 세우고, 손짓이면 유형이 정한 말로 바꾼다. */
  const feature = FEATURE.find((one) => bare.endsWith(one));
  const gesture = feature ? undefined : GESTURE.find((one) => bare.endsWith(one));
  const word = feature ?? WORD[kind];
  const cut = feature ?? gesture;

  const target = bareTarget(cut ? bare.slice(0, -cut.length).trim() : bare);
  if (target === '' || word === '') return `${bare} 기능 제공${tail}`;
  return `${target} ${word} 기능 제공${tail}`;
};

/** 화면 하나의 기능 명칭. 화면 성격이 유형을 가르므로 경로와 읽기 전용 여부가 함께 필요하다. */
export const featureNames = (screen: {
  spec: { actions: readonly string[] };
  route: string;
  readOnly: boolean;
}): string[] =>
  screen.spec.actions.map((one) => featureName(one, kindIn(one, screen.route, screen.readOnly)));
