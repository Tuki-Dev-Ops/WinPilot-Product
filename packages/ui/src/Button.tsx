import type { ReactNode } from 'react';

/**
 * 단추의 뜻. **무엇으로 보일지가 아니라 무엇을 하는지**로 고른다.
 *
 * - `primary` — 이 화면에서 하려던 일. 한 화면에 하나만 둔다
 * - `secondary` — 그 옆에 서는 일. 취소·닫기·초기화처럼 되돌리는 쪽
 * - `danger` — 되돌릴 수 없는 일. 확인 창의 마지막 단추
 *
 * `danger` 에 `hover:` 가 없는 것은 빠뜨린 것이 아니다. 이 단추는 확인 창에서 마지막으로
 * 누르는 것이라 이미 한 번 멈춰 세운 뒤이고, 여기서 색이 더 움직이면 누르라고 재촉하는
 * 것처럼 보인다.
 */
const TONE_CLASS = {
  primary: 'bg-brand-500 font-medium text-white hover:bg-brand-600',
  secondary: 'border border-border-strong text-ink-muted hover:border-ink-faint',
  danger: 'bg-signal-danger font-medium text-white',
} as const;

export type ButtonTone = keyof typeof TONE_CLASS;

export type ButtonProps = {
  children: ReactNode;
  tone?: ButtonTone;
  /** 폼 안에서 제출을 맡는 단추만 `submit`. 기본이 `button` 인 이유는 아래 머리말에 있다 */
  type?: 'button' | 'submit';
  /**
   * 묶일 `<form>` 의 `id`. **폼 밖에 서는 제출 단추**에만 쓴다 — 모달은 아래줄이 본문 밖이라
   * 단추를 폼 안에 넣을 수 없는데, 이 속성이 없으면 Enter 키로 저장하는 길이 사라진다.
   */
  form?: string;
  disabled?: boolean;
  /** 좁은 화면에서 한 줄을 채운다. 폭은 바깥이 정한다 — 단추가 자기 자리를 정하지 않는다 */
  block?: boolean;
  onClick?: () => void;
};

/**
 * 폼·툴바·모달 아래줄에 서는 단추 — **두 어드민이 같은 것을 쓴다.**
 *
 * ## 여기 올라온 이유 — 같은 단추가 열다섯 가지로 적혀 있었다
 * 같은 파란 단추를 화면마다 손으로 적다 보니 이렇게 갈라졌다.
 *
 * - `transition-colors duration-150` 이 있는 것과 없는 것 — 어떤 단추는 색이 스르륵 바뀌고
 *   바로 옆 단추는 탁 바뀐다
 * - `shrink-0 whitespace-nowrap` 이 있는 것과 없는 것 — 좁은 폭에서 어떤 단추만 글자가 접힌다
 * - 취소 단추에 `hover:border-ink-faint` 가 있는 것과 없는 것 — 어떤 취소는 마우스에 반응하고
 *   어떤 취소는 죽어 있다
 *
 * 셋 다 **고칠 때 한 곳만 고쳐서** 생긴 자리다. 눈에 잘 안 띄는 어긋남이라 오래 남는다.
 *
 * ## 높이가 32px 인 단추는 여기 없다
 * 표 안의 행 동작은 `RowTextButton`(h-8)이 따로 맡는다. 행은 한 줄 안에 대여섯 칸이 들어가는
 * 자리라 36px 단추를 넣으면 줄 높이가 그 단추에 끌려간다. 둘을 한 컴포넌트의 `size` 로 묶지
 * 않는 이유: 크기가 아니라 **서는 자리**가 다르고, 자리가 다르면 나중에 갈라질 것(테두리 색·
 * 아이콘 짝)도 다르다.
 *
 * ## `type` 기본값이 `button` 인 이유
 * HTML 기본값은 `submit` 이라, 폼 안에 아무 생각 없이 단추를 두면 그것이 폼을 보낸다.
 * 취소 단추가 저장을 실행하는 사고가 여기서 나온다 — 기본을 뒤집어 막는다.
 */
export function Button({
  children,
  tone = 'primary',
  type = 'button',
  form,
  disabled = false,
  block = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      {...(form === undefined ? {} : { form })}
      disabled={disabled}
      onClick={onClick}
      className={`h-9 shrink-0 whitespace-nowrap rounded-lg px-4 text-sm transition-colors duration-150 disabled:opacity-50 ${
        block ? 'w-full' : ''
      } ${TONE_CLASS[tone]}`}
    >
      {children}
    </button>
  );
}
