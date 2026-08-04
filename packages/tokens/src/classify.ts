import { readFileSync } from 'node:fs';

export type DtcgType = 'color' | 'fontFamily' | 'fontWeight' | 'dimension' | 'number' | 'shadow';

export type Classification = {
  /** DTCG 최상위 그룹 */
  group: string;
  /**
   * 그룹 내 토큰명 — **평탄한 이름**을 쓴다.
   *
   * `--color-ink` 와 `--color-ink-muted` 가 동시에 존재하므로 하이픈으로 중첩하면
   * 'ink' 가 토큰이면서 그룹이어야 하는 충돌이 생긴다. 평탄하게 두면 충돌이 없고,
   * Tailwind 유틸리티명(`bg-ink-muted`)과 1:1 로 대응해 추적도 쉽다.
   */
  name: string;
  type: DtcgType;
};

/** 내부 구현 변수 또는 Figma 로 옮길 대상이 아닌 네임스페이스 */
const EXCLUDED_PREFIXES = [
  '--tw-', // Tailwind 런타임 내부 변수
  '--default-',
  '--text-shadow-',
  '--inset-shadow-',
  '--drop-shadow-',
  '--animate-',
  '--ease-',
  '--blur-',
  '--perspective-',
  '--aspect-',
];

/** 순서가 의미를 가진다 — `--font-weight-` 는 `--font-` 보다 먼저 검사해야 한다. */
const PREFIX_RULES: ReadonlyArray<{ prefix: string; group: string; type: DtcgType }> = [
  { prefix: '--color-', group: 'color', type: 'color' },
  { prefix: '--font-weight-', group: 'fontWeight', type: 'fontWeight' },
  { prefix: '--font-', group: 'fontFamily', type: 'fontFamily' },
  { prefix: '--text-', group: 'fontSize', type: 'dimension' },
  { prefix: '--leading-', group: 'lineHeight', type: 'number' },
  { prefix: '--tracking-', group: 'letterSpacing', type: 'dimension' },
  { prefix: '--radius-', group: 'radius', type: 'dimension' },
  { prefix: '--shadow-', group: 'shadow', type: 'shadow' },
  { prefix: '--container-', group: 'container', type: 'dimension' },
  { prefix: '--breakpoint-', group: 'breakpoint', type: 'dimension' },
];

const EXACT_RULES: Readonly<Record<string, Classification>> = {
  '--spacing': { group: 'spacing', name: 'base', type: 'dimension' },
};

/**
 * CSS 변수명 → DTCG 분류. 대상이 아니면 null.
 *
 * `--canvas` / `--ink` 같은 맨몸 변수는 의도적으로 제외한다.
 * 이들은 `--color-canvas: var(--canvas)` 의 입력일 뿐이라, 포함하면 같은 값이 두 번 나온다.
 */
export function classify(cssVar: string): Classification | null {
  if (EXCLUDED_PREFIXES.some((p) => cssVar.startsWith(p))) return null;

  const exact = EXACT_RULES[cssVar];
  if (exact) return exact;

  // Tailwind v4 는 폰트 크기에 딸린 속성을 `--text-sm--line-height` 형태로 함께 내보낸다.
  // `--text-` 접두어 규칙보다 먼저 걸러내야 fontSize 로 잘못 분류되지 않는다.
  const paired = /^--text-(.+?)--(line-height|letter-spacing|font-weight)$/.exec(cssVar);
  if (paired) {
    const size = paired[1];
    const prop = paired[2];
    if (!size || !prop) return null;
    if (prop === 'line-height') return { group: 'lineHeight', name: `text-${size}`, type: 'number' };
    if (prop === 'letter-spacing') return { group: 'letterSpacing', name: `text-${size}`, type: 'dimension' };
    return { group: 'fontWeight', name: `text-${size}`, type: 'fontWeight' };
  }

  for (const rule of PREFIX_RULES) {
    if (cssVar.startsWith(rule.prefix)) {
      const name = cssVar.slice(rule.prefix.length);
      if (!name) return null;
      return { group: rule.group, name, type: rule.type };
    }
  }

  return null;
}

/**
 * `@theme static { ... }` 블록에 우리가 직접 선언한 토큰명을 읽는다.
 *
 * **값이 아니라 소유권만** 여기서 가져온다 — 값은 언제나 브라우저 계산값이 진실이다.
 * 이 구분으로 우리 디자인 시스템 토큰과 Tailwind 기본 팔레트 잔재를 리포트에서 갈라낼 수 있다.
 */
export function readOwnedTokenNames(cssPath: string): Set<string> {
  const css = readFileSync(cssPath, 'utf8');
  const owned = new Set<string>();

  const start = css.indexOf('@theme static');
  if (start === -1) return owned;

  const open = css.indexOf('{', start);
  if (open === -1) return owned;

  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const block = css.slice(open + 1, end);
  for (const match of block.matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
    const name = match[1];
    if (name) owned.add(name);
  }

  return owned;
}
