import type { ReactNode } from 'react';

/**
 * 상태를 알리는 색 이름. **클래스가 아니라 뜻이다.**
 *
 * 이 목록이 닫혀 있는 것이 이 파일의 핵심이다. 전에는 화면과 시드 파일이 색을 각자
 * `'bg-signal-ok/12 text-signal-ok'` 처럼 **클래스 문자열로** 들고 있었다. 서른세 장에
 * 마흔아홉 자리, 톤 표만 스물한 개였는데 실제로 쓰인 값은 아래 넷뿐이었다 — 같은 말을
 * 스물한 번 적어 둔 셈이다.
 *
 * 그렇게 두면 셋이 어긋난다.
 *
 * 1. **어긋나도 아무도 모른다.** `dark:bg-brand-900` 을 빠뜨린 표가 하나 있어도 그 화면을
 *    다크 모드로 열어 보기 전에는 드러나지 않는다. 타입은 `string` 이라 통과한다.
 * 2. **색을 바꾸려면 스물한 곳을 고쳐야 한다.** 한 곳이라도 놓치면 그 화면만 옛 색으로 남는다.
 * 3. **시드가 화면을 안다.** `lib/data/tenants.ts` 는 값이 있는 곳인데 Tailwind 클래스를
 *    들고 있었다. 서버에서 값을 받아 오게 되는 날 이 문자열은 갈 곳이 없다.
 *
 * 이제 표는 뜻만 적는다 — `엔터프라이즈: 'ok'`. 클래스는 이 파일만 안다.
 *
 * `wait` 는 아직 쓰는 곳이 없지만 넣어 둔다. `--color-signal-wait` 는 토큰에 이미 있고,
 * '만료 임박'·'보류' 처럼 **끝난 것이 아니라 기다리는 것**을 지금은 `danger` 나 `neutral` 로
 * 적고 있어 '만료' 와 '만료 임박' 이 같은 붉은색으로 선다. 색을 바꾸는 것은 디자인 결정이라
 * 여기서 하지 않고, 자리만 열어 둔다.
 */
export type BadgeTone = 'neutral' | 'brand' | 'ok' | 'wait' | 'danger';

/**
 * 배경은 `/12` 로 옅게 깐다. 꽉 찬 색을 쓰면 배지가 단추처럼 보여 누르려 든다.
 * 브랜드 톤만 명도 단계를 직접 고르는데, 브랜드 색은 다크 모드에서 그대로 두면
 * 배경이 너무 밝게 들뜨기 때문이다.
 */
const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-ink-muted',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  ok: 'bg-signal-ok/12 text-signal-ok',
  wait: 'bg-signal-wait/12 text-signal-wait',
  danger: 'bg-signal-danger/12 text-signal-danger',
};

/**
 * `sm` 은 배지 안에 배지가 들어가는 자리에만 쓴다 — 고객사 행 안의 배포 상태처럼
 * 이미 다른 배지가 선 줄에서 같은 크기로 서면 어느 쪽이 그 행의 상태인지 알 수 없다.
 */
const SIZE_CLASS = {
  md: 'px-2.5 py-1 text-xs',
  sm: 'px-2 py-0.5 text-3xs',
} as const;

export type BadgeProps = {
  tone?: BadgeTone;
  size?: keyof typeof SIZE_CLASS;
  children: ReactNode;
};

/**
 * 상태 배지 — **두 어드민이 같은 것을 쓴다.**
 *
 * ## 자리잡기 클래스를 왜 전부 여기서 거는가
 * 배지가 서는 자리는 셋이다 — 보통 흐름 · 가로 flex · 세로 flex. 지금까지는 화면마다 그 자리에
 * 맞는 클래스를 손으로 붙여 왔고(`inline-block` 을 붙인 곳 아홉, `w-fit` 을 붙인 곳 둘, 아무것도
 * 안 붙인 곳 나머지), 그래서 같은 배지가 자리에 따라 다르게 섰다. 넷을 한 벌로 묶으면 어느
 * 자리에 두든 같은 모양이 나온다.
 *
 * | 클래스 | 없으면 |
 * |---|---|
 * | `inline-flex` | 보통 흐름에서 위아래 여백이 줄 높이에 반영되지 않아 알약이 납작해진다 |
 * | `w-fit` | 세로 flex 안에서 가로로 늘어나 한 줄을 통째로 차지한다 |
 * | `shrink-0` | 가로 flex 안에서 눌려 글자가 잘린다 |
 * | `whitespace-nowrap` | 좁은 폭에서 `배송 준비` 가 두 줄로 접힌다 |
 *
 * **색만으로 뜻을 전하지 않는다.** 배지는 언제나 글자를 함께 갖는다 — 색을 구분하지 못하는
 * 사람에게 톤은 아무 말도 하지 않기 때문이다 (`docs/NFS/accessibility/`). 그래서 이 컴포넌트에는
 * 글자 없는 형태가 없다.
 */
export function Badge({ tone = 'neutral', size = 'md', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full font-medium ${SIZE_CLASS[size]} ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
