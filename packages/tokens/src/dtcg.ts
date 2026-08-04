import type { ThemeSnapshot } from './browser';
import { classify, type DtcgType } from './classify';

export type DtcgDimension = { value: number; unit: 'px' };
export type DtcgValue = string | number | string[] | DtcgDimension;

export type DtcgToken = {
  $type: DtcgType;
  $value: DtcgValue;
  $extensions: {
    'com.winpilot.cssVar': string;
    'com.winpilot.source': 'project' | 'tailwind-default';
    'com.winpilot.raw': { light: string; dark: string };
    /** 라이트/다크 값이 다를 때만 존재한다 */
    'com.winpilot.modes'?: { light: DtcgValue; dark: DtcgValue };
  };
};

export type DtcgDocument = {
  $description: string;
  $extensions: {
    'com.winpilot.generatedFrom': string;
    'com.winpilot.rootFontSizePx': number;
    'com.winpilot.schemes': ['light', 'dark'];
  };
} & Record<string, unknown>;

export type BuildResult = {
  document: DtcgDocument;
  stats: {
    total: number;
    byGroup: Record<string, number>;
    bySource: { project: number; 'tailwind-default': number };
    modeDependent: number;
    skipped: string[];
  };
};

/** `1.5rem` → 24. rem/em 은 루트 폰트 크기로 환산한다 (Figma 는 px 만 받는다). */
function toPx(raw: string, rootFontSizePx: number): number | null {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(raw.trim());
  if (!match) return null;
  const rawNumber = match[1];
  if (rawNumber === undefined) return null;
  const n = Number.parseFloat(rawNumber);
  if (Number.isNaN(n)) return null;
  return (match[2] ?? 'px') === 'px' ? n : n * rootFontSizePx;
}

/** 최상위 콤마로만 분리하고 따옴표를 벗긴다. */
function splitFontFamily(raw: string): string[] {
  const parts: string[] = [];
  let buffer = '';
  let quote: string | null = null;

  for (const char of raw) {
    if (quote) {
      if (char === quote) quote = null;
      else buffer += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === ',') {
      parts.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += char;
  }
  if (buffer.trim()) parts.push(buffer.trim());
  return parts.filter(Boolean);
}

function resolveValue(
  type: DtcgType,
  cssVar: string,
  raw: string,
  snapshot: ThemeSnapshot,
): DtcgValue | null {
  switch (type) {
    case 'color': {
      // 캔버스로 해석된 sRGB 값을 쓴다 — 원본 문자열은 lab()/oklch() 일 수 있다.
      return snapshot.colors[cssVar]?.hex ?? null;
    }
    case 'dimension': {
      const px = toPx(raw, snapshot.rootFontSizePx);
      return px === null ? null : { value: px, unit: 'px' };
    }
    case 'number': {
      const n = Number.parseFloat(raw);
      if (!Number.isNaN(n) && /^-?\d*\.?\d+$/.test(raw.trim())) return n;
      // `calc(2 / 1.5)` 같은 계산식은 브라우저가 계산해 둔 배수를 쓴다.
      return snapshot.ratios[cssVar] ?? null;
    }
    case 'fontWeight': {
      const n = Number.parseInt(raw, 10);
      return Number.isNaN(n) ? null : n;
    }
    case 'fontFamily': {
      const families = splitFontFamily(raw);
      return families.length > 0 ? families : null;
    }
    case 'shadow': {
      // Figma Effect 로의 분해는 Phase 3 머티리얼라이저 소관이다. 여기서는 원본을 보존한다.
      return raw;
    }
  }
}

function sameValue(a: DtcgValue, b: DtcgValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function buildDtcg(
  light: ThemeSnapshot,
  dark: ThemeSnapshot,
  owned: ReadonlySet<string>,
  sourceUrl: string,
): BuildResult {
  const document: DtcgDocument = {
    $description:
      '프론트엔드 코드(SSOT)에서 추출한 디자인 토큰. Tailwind @theme 가 컴파일한 CSS 커스텀 프로퍼티를 ' +
      '브라우저 계산값 그대로 읽었다. 수기 편집 금지 — pnpm ssot:tokens 로 재생성한다.',
    $extensions: {
      'com.winpilot.generatedFrom': sourceUrl,
      'com.winpilot.rootFontSizePx': light.rootFontSizePx,
      'com.winpilot.schemes': ['light', 'dark'],
    },
  };

  const stats: BuildResult['stats'] = {
    total: 0,
    byGroup: {},
    bySource: { project: 0, 'tailwind-default': 0 },
    modeDependent: 0,
    skipped: [],
  };

  const cssVars = [...new Set([...Object.keys(light.vars), ...Object.keys(dark.vars)])].sort();

  for (const cssVar of cssVars) {
    const classification = classify(cssVar);
    if (!classification) continue;

    const rawLight = light.vars[cssVar] ?? '';
    const rawDark = dark.vars[cssVar] ?? rawLight;

    const valueLight = resolveValue(classification.type, cssVar, rawLight, light);
    const valueDark = resolveValue(classification.type, cssVar, rawDark, dark);

    if (valueLight === null || valueDark === null) {
      stats.skipped.push(`${cssVar} (값 해석 실패: '${rawLight}')`);
      continue;
    }

    const source: 'project' | 'tailwind-default' = owned.has(cssVar) ? 'project' : 'tailwind-default';

    const token: DtcgToken = {
      $type: classification.type,
      $value: valueLight,
      $extensions: {
        'com.winpilot.cssVar': cssVar,
        'com.winpilot.source': source,
        'com.winpilot.raw': { light: rawLight, dark: rawDark },
      },
    };

    if (!sameValue(valueLight, valueDark)) {
      token.$extensions['com.winpilot.modes'] = { light: valueLight, dark: valueDark };
      stats.modeDependent += 1;
    }

    const group = (document[classification.group] ??= {}) as Record<string, DtcgToken>;
    group[classification.name] = token;

    stats.total += 1;
    stats.byGroup[classification.group] = (stats.byGroup[classification.group] ?? 0) + 1;
    stats.bySource[source] += 1;
  }

  return { document, stats };
}
