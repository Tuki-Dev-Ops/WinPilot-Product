'use client';

import { Eye, Pencil, Trash2, type LucideIcon } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';

/**
 * 표 행 오른쪽 끝의 동작 단추 — **두 어드민이 같은 것을 쓴다.**
 *
 * 글자 단추를 아이콘으로 바꾼 이유: 행마다 `조회`·`삭제` 두 마디가 붙으면 열 하나가 통째로
 * 글자에 먹힌다. 좁은 화면에서 먼저 잘리는 것도 이 열이다. 정사각 아이콘은 폭이 고정이라
 * 어느 너비에서나 같은 자리에 선다.
 *
 * **아이콘만 있는 단추에는 `aria-label` 을 반드시 붙인다.** 눈으로 못 읽는 사람에게 아이콘은
 * 아무 말도 하지 않는다 (`docs/NFS/accessibility/`). `title` 도 함께 두어 마우스를 올린
 * 사람에게도 같은 말이 보이게 한다 — 둘은 읽는 사람이 다르므로 하나로 줄이지 않는다.
 *
 * 아이콘은 **SVG 컴포넌트**(`lucide-react`)다. 아이콘 폰트나 비트맵은 글리프·그림이라 Figma
 * 에서 벡터로 복원되지 않고, 바깥 CDN 은 배포가 끊기면 화면에서 사라진다 — 라이브러리는 번들에
 * 함께 들어가므로 그 둘 다 아니다.
 *
 * ## 아이콘으로 바꾸지 않는 것
 * 뜻이 한 번에 읽히는 동작만 아이콘으로 둔다. `연동 설정`·`답변`처럼 그림 하나로 옮기면
 * 다른 뜻으로도 읽히는 동작은 **글자로 남긴다** — 애매한 아이콘은 글자보다 느리다.
 */
export type RowActionIcon = 'view' | 'delete' | 'edit';

/** 눈은 **열어서 본다**, 휴지통은 지운다, 연필은 고친다. 셋 다 설명 없이 읽히는 그림이다. */
const ICONS: Record<RowActionIcon, LucideIcon> = {
  view: Eye,
  delete: Trash2,
  edit: Pencil,
};

/**
 * 아이콘 단추와 글자 단추가 나눠 갖는 것 — 높이(32px) · 테두리 자리 · 전환 속도.
 *
 * 둘이 같은 줄에 나란히 서기 때문에 이 셋이 어긋나면 눈에 바로 띈다. 실제로 어긋나 있었다:
 * 화면 아홉 곳이 `ACTION_BUTTON` 이라는 같은 이름의 상수를 각자 선언해 두고 있었고, 그중
 * 넷은 아이콘 단추로 옮긴 뒤 **쓰이지 않는 채로 남아** 있었다.
 *
 * ## 테두리는 자리만 잡고 평소에는 보이지 않는다
 * 목록 한 화면에 행이 스물이면 **테두리 상자가 마흔 개**가 선다. 눈에 먼저 드는 것이 값이
 * 아니라 그 상자들이고, 정작 알려야 하는 배지(연체·만료)가 그 사이에 묻힌다.
 *
 * 그래서 평소에는 투명한 테두리를 두고 — 자리는 그대로라 마우스를 올려도 글자가 밀리지
 * 않는다 — **행이나 단추에 마우스가 닿을 때** 드러낸다. 없애지 않고 흐리게만 두는 이유:
 * 완전히 감추면 터치 화면에서 누를 것이 있는지조차 알 수 없다.
 */
const SHAPE = 'h-8 shrink-0 rounded-lg border border-transparent transition-colors duration-150';

/**
 * 색은 톤이 정한다. 테두리 색이 같고 글자 색만 갈리는 이유는 아래 `RowTextButton` 주석에 있다.
 *
 * `group-hover:` 는 **행 전체**에 마우스가 닿을 때다(목록 행이 `group` 을 갖는다). 단추에 직접
 * 닿기 전에 먼저 드러나야, 어디를 눌러야 하는지 찾는 시간이 없다.
 */
const TONE_CLASS = {
  default:
    'text-ink-muted group-hover:border-border-strong hover:!border-ink-faint focus-visible:border-ink-faint',
  danger:
    'text-signal-danger group-hover:border-border-strong hover:!border-signal-danger focus-visible:border-signal-danger',
} as const;

export type RowActionTone = keyof typeof TONE_CLASS;

export type RowIconButtonProps = {
  icon: RowActionIcon;
  /** 낭독기와 마우스가 함께 읽는 말. `상세`가 아니라 `고객사 상세`처럼 무엇의 동작인지 적는다 */
  label: string;
  /** 되돌릴 수 없는 동작은 붉게 — 색만으로 알리지 않도록 `label` 에도 그 말이 들어간다 */
  tone?: RowActionTone;
  onClick?: () => void;
};

export function RowIconButton({ icon, label, tone = 'default', onClick }: RowIconButtonProps) {
  const Icon = ICONS[icon];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${SHAPE} grid size-8 place-items-center ${TONE_CLASS[tone]}`}
    >
      <Icon aria-hidden className="size-4" strokeWidth={1.5} />
    </button>
  );
}

export type RowTextButtonProps = {
  /** 화면에 보이는 말. 이것이 곧 낭독기가 읽는 말이라 `aria-label` 을 따로 두지 않는다 */
  children: ReactNode;
  tone?: RowActionTone;
  disabled?: boolean;
  onClick?: () => void;
};

/**
 * 글자로 남는 행 동작 — `연동 설정`·`답변`처럼 **그림 하나로 옮기면 다른 뜻으로도 읽히는 것**.
 *
 * `RowIconButton` 의 머리말에 적은 기준(뜻이 한 번에 읽히는 동작만 아이콘)의 반대쪽이다.
 * 둘을 한 파일에 두는 이유: 기준을 읽은 자리에서 두 선택지가 같이 보여야 고를 때 헷갈리지
 * 않는다. 떨어뜨려 두면 아이콘 단추가 있는 줄 모르고 글자 단추만 쓰게 된다.
 *
 * **테두리는 톤과 무관하게 회색이다.** 삭제 단추까지 붉은 테두리를 두르면 행마다 붉은 상자가
 * 하나씩 서서 정작 위험한 상태(연체·만료)를 알리는 배지가 묻힌다. 글자만 붉게 두고, 마우스를
 * 올렸을 때 테두리가 따라 붉어진다 — 누르기 직전에 한 번 더 알리는 셈이다.
 *
 * 그 테두리조차 **행에 마우스가 닿기 전에는 투명하다**(`SHAPE` 머리말).
 *
 * `whitespace-nowrap` 을 여기서 건다. `조회` 두 자는 안 접히지만 `연동 설정` 은 좁은 폭에서
 * 접힌다 — 접히는 것만 골라 붙이면 붙이는 것을 잊은 자리가 생긴다.
 */
export function RowTextButton({ children, tone = 'default', disabled = false, onClick }: RowTextButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${SHAPE} whitespace-nowrap px-3 text-sm disabled:opacity-50 ${TONE_CLASS[tone]}`}
    >
      {children}
    </button>
  );
}

/**
 * 동작 묶음 — 행 맨 오른쪽 칸 안에서 **가운데**로 선다.
 *
 * 오른쪽 맞춤이 아니라 가운데인 이유: 이 칸의 머리글(`관리`)도 가운데에 서기 때문이다.
 * 오른쪽으로 밀면 머리글과 아이콘이 서로 다른 세로선 위에 놓여, 표를 훑을 때 어느 열의
 * 것인지 눈이 한 번 더 확인하게 된다. 아이콘은 폭이 고정(32px)이라 가운데에 두면 행마다
 * 같은 자리에 선다 — 글자 단추가 섞여 폭이 달라져도 중심선은 유지된다.
 *
 * 행 전체를 눌러 상세로 가는 목록에서는 이 묶음 안의 누름이 행까지 번지면 안 된다.
 * `stopRowClick` 을 여기서 한 번만 걸어 화면마다 되풀이하지 않는다.
 */
export function RowActions({ children }: { children: ReactNode }) {
  const stopRowClick = (event: MouseEvent) => event.stopPropagation();
  return (
    <div className="flex items-center gap-2 lg:justify-center" onClick={stopRowClick}>
      {children}
    </div>
  );
}
