/**
 * 브라우저 안에서 실행되는 추출 스크립트.
 *
 * page.evaluate 는 함수를 **소스 문자열로 직렬화**해 브라우저에서 실행하므로,
 * 이 함수는 바깥의 어떤 것도 참조할 수 없다. 모든 헬퍼가 안에 들어 있는 이유다.
 * (타입은 컴파일 시 지워지므로 import type 은 무해하다.)
 */
export const EXTRACT_SCRIPT = (): unknown => {
  const EPS = 1e-6;

  const notes: string[] = [];
  let visitedElements = 0;
  let prunedElements = 0;
  let fallbackNodes = 0;

  const note = (message: string) => {
    if (!notes.includes(message)) notes.push(message);
  };

  // ── 색: 브라우저에게 시킨다 ────────────────────────────────────────────
  // lab()/oklch()/color-mix() 를 JS 로 파싱하면 파서가 하나 더 생기고,
  // 그 파서가 브라우저와 다르게 반올림하는 순간 픽셀 검증이 깨진다.
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map<string, { r: number; g: number; b: number; a: number } | null>();

  const parseColor = (value: string) => {
    if (!value) return null;
    const cached = colorCache.get(value);
    if (cached !== undefined) return cached;
    if (!colorCtx) return null;

    colorCtx.fillStyle = '#000000';
    colorCtx.fillStyle = value;
    const a = colorCtx.fillStyle;
    colorCtx.fillStyle = '#ffffff';
    colorCtx.fillStyle = value;
    const b = colorCtx.fillStyle;
    if (a !== b) {
      colorCache.set(value, null);
      return null;
    }

    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = value;
    colorCtx.fillRect(0, 0, 1, 1);
    const d = colorCtx.getImageData(0, 0, 1, 1).data;
    const result = {
      r: (d[0] ?? 0) / 255,
      g: (d[1] ?? 0) / 255,
      b: (d[2] ?? 0) / 255,
      a: (d[3] ?? 0) / 255,
    };
    colorCache.set(value, result);
    return result;
  };

  const isTransparent = (color: { a: number } | null) => !color || color.a < EPS;

  // ── 숫자 · 문자열 ──────────────────────────────────────────────────────
  const num = (value: string) => {
    const n = Number.parseFloat(value);
    return Number.isNaN(n) ? 0 : n;
  };

  /** 괄호 깊이를 세며 최상위 콤마로만 분리한다 (`rgb(1, 2, 3), url(...)`). */
  const splitTopLevel = (input: string, separator = ',') => {
    const parts: string[] = [];
    let depth = 0;
    let buffer = '';
    let quote: string | null = null;
    for (const char of input) {
      if (quote) {
        buffer += char;
        if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        buffer += char;
        continue;
      }
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;
      if (char === separator && depth === 0) {
        parts.push(buffer.trim());
        buffer = '';
        continue;
      }
      buffer += char;
    }
    if (buffer.trim()) parts.push(buffer.trim());
    return parts;
  };

  const FONT_STYLE_BY_WEIGHT: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };

  const figmaFontStyle = (weight: number, italic: boolean) => {
    const rounded = Math.round(weight / 100) * 100;
    const base = FONT_STYLE_BY_WEIGHT[rounded] ?? 'Regular';
    if (!italic) return base;
    return base === 'Regular' ? 'Italic' : `${base} Italic`;
  };

  /** CSS 제네릭 패밀리 — 실제 폰트 이름이 아니므로 Figma 에 존재할 수 없다. */
  const GENERIC_FAMILIES = new Set([
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'math',
    'emoji',
    'fangsong',
  ]);

  const familyCache = new Map<string, string>();

  /**
   * 선언된 폰트 스택에서 **실제로 렌더에 쓰이는 폰트**를 고른다.
   *
   * 첫 항목을 그냥 쓰면 `ui-monospace, 'Cascadia Mono', …` 같은 스택에서
   * 실존하지 않는 제네릭 이름이 UIR 에 박히고, 플러그인이 Figma 에서 그 폰트를 못 찾아 멈춘다.
   * 제네릭을 건너뛰고 `document.fonts.check()` 로 사용 가능한 첫 폰트를 찾는다.
   */
  const primaryFamily = (fontFamily: string) => {
    const cached = familyCache.get(fontFamily);
    if (cached !== undefined) return cached;

    const candidates = splitTopLevel(fontFamily).map((item) => item.replace(/^["']|["']$/g, '').trim());
    const concrete = candidates.filter((item) => item && !GENERIC_FAMILIES.has(item.toLowerCase()));

    let resolved = concrete.find((item) => {
      try {
        return document.fonts.check(`16px "${item}"`);
      } catch {
        return false;
      }
    });

    if (!resolved) {
      resolved = concrete[0] ?? candidates[0] ?? 'sans-serif';
      note(
        `폰트 스택에서 사용 가능한 실물 폰트를 찾지 못했습니다: '${fontFamily}' → '${resolved}' 로 기록. ` +
          `Figma 에 이 폰트가 없으면 플러그인이 생성을 중단한다.`,
      );
    }

    familyCache.set(fontFamily, resolved);
    return resolved;
  };

  const fonts = new Map<string, { family: string; style: string; weight: number; italic: boolean }>();
  const registerFont = (family: string, weight: number, italic: boolean) => {
    const style = figmaFontStyle(weight, italic);
    fonts.set(`${family}|${style}`, { family, style, weight, italic });
  };

  // ── 변환 행렬 ──────────────────────────────────────────────────────────
  /**
   * `getBoundingClientRect()` 는 이미 변환이 적용된 축정렬 박스를 돌려준다.
   * 따라서 회전·기울임이 없으면(이동·확대만) 그 박스를 그대로 쓰면 되고 별도 transform 이 필요 없다.
   * 회전이나 기울임이 있으면 원래 박스를 역산해야 하는데 오차가 크므로 폴백으로 강등한다.
   */
  const analyzeTransform = (value: string): 'none' | 'axis-aligned' | 'rotate' | 'skew' | '3d' => {
    if (!value || value === 'none') return 'none';
    if (value.startsWith('matrix3d')) return '3d';
    const match = /^matrix\(([^)]+)\)$/.exec(value);
    if (!match) return '3d';
    const parts = (match[1] ?? '').split(',').map((piece) => Number.parseFloat(piece));
    const [a = 1, b = 0, c = 0, d = 1] = parts;
    if (Math.abs(b) < EPS && Math.abs(c) < EPS) return 'axis-aligned';
    // 직교성이 깨지면 기울임이다. 유지되면 회전(+균등 확대)이다.
    return Math.abs(a * c + b * d) > 1e-4 ? 'skew' : 'rotate';
  };

  // ── 모서리 ────────────────────────────────────────────────────────────
  /** `10px` → 10 · `10px 20px` → 타원형(둘째 값이 다르면) */
  const readRadius = (value: string): { radius: number; elliptical: boolean } => {
    const parts = value.trim().split(/\s+/);
    const first = num(parts[0] ?? '0');
    const second = parts.length > 1 ? num(parts[1] ?? '0') : first;
    return { radius: first, elliptical: Math.abs(first - second) > EPS };
  };

  /**
   * 코너 반경을 박스에 맞게 조인다.
   *
   * Tailwind 의 `rounded-full` 은 `calc(infinity * 1px)` 로 컴파일되고 Chromium 은 이를
   * 33554400px 같은 값으로 계산해 돌려준다. 브라우저는 이를 박스에 맞춰 줄여 그리지만
   * 그 원본 숫자를 그대로 Figma 에 넣으면 값이 튄다. CSS 가 실제로 그리는 값으로 정규화한다.
   */
  const clampRadius = (radius: number[], width: number, height: number) => {
    const limit = Math.max(Math.min(width, height) / 2, 0);
    return radius.map((value) => Math.min(value, limit));
  };

  // ── 그림자 ────────────────────────────────────────────────────────────
  /** 계산된 box-shadow 한 겹을 Figma Effect 로. 형식: `rgb(...) 0px 1px 2px 0px [inset]` */
  const parseShadowLayer = (layer: string) => {
    const inset = /(^|\s)inset(\s|$)/.test(layer);
    const withoutInset = layer.replace(/(^|\s)inset(\s|$)/, ' ').trim();
    const colorMatch = /^(rgba?\([^)]*\)|lab\([^)]*\)|oklch\([^)]*\)|color\([^)]*\)|#[0-9a-f]+|[a-z]+)/i.exec(
      withoutInset,
    );
    if (!colorMatch) return null;
    const colorText = colorMatch[0];
    const color = parseColor(colorText);
    if (!color) return null;
    const numbers = withoutInset
      .slice(colorText.length)
      .trim()
      .split(/\s+/)
      .map((piece) => num(piece));
    const [x = 0, y = 0, blur = 0, spread = 0] = numbers;
    return {
      type: inset ? ('INNER_SHADOW' as const) : ('DROP_SHADOW' as const),
      color,
      offset: { x, y },
      radius: blur,
      spread,
      blendMode: 'NORMAL' as const,
      visible: true,
    };
  };

  // ── 필터 ──────────────────────────────────────────────────────────────
  /** blur() 하나만 지원한다. 나머지 필터 함수는 폴백 사유가 된다. */
  const parseBlurOnly = (value: string): { radius: number } | 'unsupported' | null => {
    if (!value || value === 'none') return null;
    const match = /^blur\(([-\d.]+)px\)$/.exec(value.trim());
    if (!match) return 'unsupported';
    return { radius: num(match[1] ?? '0') };
  };

  // ── 배경 ──────────────────────────────────────────────────────────────
  const OBJECT_FIT_TO_SCALE: Record<string, 'FILL' | 'FIT' | 'CROP'> = {
    fill: 'CROP',
    contain: 'FIT',
    cover: 'FILL',
    none: 'CROP',
    'scale-down': 'FIT',
  };

  type PaintOut =
    | { type: 'SOLID'; color: { r: number; g: number; b: number; a: number }; opacity: number; blendMode: 'NORMAL'; visible: true }
    | { type: 'IMAGE'; src: string; scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE'; opacity: number; blendMode: 'NORMAL'; visible: true };

  /**
   * 배경 레이어를 Paint 배열로.
   * CSS 는 첫 레이어가 위, Figma 는 배열 뒤쪽이 위이므로 **역순**으로 담는다.
   */
  const readBackground = (style: CSSStyleDeclaration): { paints: PaintOut[]; fallback: string | null } => {
    const paints: PaintOut[] = [];
    let fallback: string | null = null;

    const image = style.backgroundImage;
    if (image && image !== 'none') {
      const layers = splitTopLevel(image);
      const sizes = splitTopLevel(style.backgroundSize || 'auto');
      const repeats = splitTopLevel(style.backgroundRepeat || 'repeat');

      for (let i = layers.length - 1; i >= 0; i -= 1) {
        const layer = layers[i] ?? '';
        if (/gradient\(/.test(layer)) {
          fallback = 'gradient';
          continue;
        }
        const urlMatch = /^url\((["']?)(.*?)\1\)$/.exec(layer);
        if (!urlMatch) {
          fallback = fallback ?? 'unknown';
          continue;
        }
        const size = (sizes[i] ?? sizes[0] ?? 'auto').trim();
        const repeat = (repeats[i] ?? repeats[0] ?? 'repeat').trim();
        const scaleMode: PaintOut extends never ? never : 'FILL' | 'FIT' | 'CROP' | 'TILE' =
          repeat !== 'no-repeat' ? 'TILE' : size === 'contain' ? 'FIT' : size === 'cover' ? 'FILL' : 'CROP';
        paints.push({
          type: 'IMAGE',
          src: urlMatch[2] ?? '',
          scaleMode,
          opacity: 1,
          blendMode: 'NORMAL',
          visible: true,
        });
      }
    }

    const bg = parseColor(style.backgroundColor);
    if (!isTransparent(bg) && bg) {
      // 배경색은 이미지보다 아래 → 배열 앞쪽
      paints.unshift({ type: 'SOLID', color: bg, opacity: 1, blendMode: 'NORMAL', visible: true });
    }

    return { paints, fallback };
  };

  // ── 테두리 ────────────────────────────────────────────────────────────
  const readStroke = (style: CSSStyleDeclaration) => {
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const widths = sides.map((side) => {
      const styleName = style.getPropertyValue(`border-${side.toLowerCase()}-style`);
      if (!styleName || styleName === 'none' || styleName === 'hidden') return 0;
      return num(style.getPropertyValue(`border-${side.toLowerCase()}-width`));
    });
    if (widths.every((width) => width < EPS)) return null;

    const colors = sides.map((side) => parseColor(style.getPropertyValue(`border-${side.toLowerCase()}-color`)));
    const visible = colors.filter((color, index) => (widths[index] ?? 0) > EPS && !isTransparent(color));
    const base = visible[0];
    if (!base) return null;

    const differs = visible.some(
      (color) =>
        Math.abs((color?.r ?? 0) - base.r) > EPS ||
        Math.abs((color?.g ?? 0) - base.g) > EPS ||
        Math.abs((color?.b ?? 0) - base.b) > EPS ||
        Math.abs((color?.a ?? 0) - base.a) > EPS,
    );

    const styleName = style.borderTopStyle;
    const dashPattern =
      styleName === 'dashed'
        ? [(widths[0] ?? 1) * 3, (widths[0] ?? 1) * 2]
        : styleName === 'dotted'
          ? [widths[0] ?? 1, widths[0] ?? 1]
          : undefined;

    const result: Record<string, unknown> = {
      color: base,
      align: 'INSIDE',
      weights: { top: widths[0] ?? 0, right: widths[1] ?? 0, bottom: widths[2] ?? 0, left: widths[3] ?? 0 },
    };
    if (dashPattern) result['dashPattern'] = dashPattern;
    if (differs) {
      result['perSideColors'] = colors.map((color) => color ?? { r: 0, g: 0, b: 0, a: 0 });
    }
    return result;
  };

  // ── 텍스트 ────────────────────────────────────────────────────────────
  const isInlineDisplay = (display: string) => display === 'inline' || display === 'contents';

  /** 직접 텍스트를 가지고 있고 모든 자손이 인라인인 요소 = 하나의 텍스트 블록 */
  const isTextBlock = (el: Element) => {
    let hasText = false;
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim()) hasText = true;
    }
    if (!hasText) return false;
    for (const descendant of Array.from(el.querySelectorAll('*'))) {
      if (!isInlineDisplay(getComputedStyle(descendant).display)) return false;
    }
    return true;
  };

  const buildTextSpec = (el: Element, style: CSSStyleDeclaration) => {
    // `<br>` 도 잡아야 한다. 텍스트 노드만 훑으면 줄바꿈이 사라져 두 줄이 한 줄로 붙는다.
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let characters = '';
    const runs: Array<Record<string, unknown>> = [];

    let cursor: Node | null = walker.nextNode();
    while (cursor) {
      if (cursor.nodeType === Node.ELEMENT_NODE) {
        if ((cursor as Element).tagName === 'BR') {
          characters += '\n';
          // 줄바꿈 문자도 어떤 런엔가 속해야 한다. 빈 구간이 남으면 Figma 에서
          // 그 문자에만 기본 스타일이 적용되어 행간이 어긋난다.
          const last = runs[runs.length - 1];
          if (last) last['end'] = characters.length;
        }
        cursor = walker.nextNode();
        continue;
      }
      const current = cursor as Text;
      const parent = current.parentElement ?? el;
      const parentStyle = getComputedStyle(parent);
      const preserve = /^(pre|pre-wrap|break-spaces)$/.test(parentStyle.whiteSpace);
      let text = current.textContent ?? '';
      if (!preserve) {
        text = text.replace(/\s+/g, ' ');
        if (/[ \n]$/.test(characters) && text.startsWith(' ')) text = text.slice(1);
        if (characters === '') text = text.replace(/^ /, '');
      }
      if (text) {
        const start = characters.length;
        characters += text;
        const weight = num(parentStyle.fontWeight) || 400;
        const italic = parentStyle.fontStyle === 'italic' || parentStyle.fontStyle === 'oblique';
        const family = primaryFamily(parentStyle.fontFamily);
        registerFont(family, weight, italic);

        // 브라우저는 폰트가 못 그리는 글자만 다른 폰트로 대체한다(글리프 단위 폴백).
        // Figma 의 TextNode 는 한 구간에 하나의 폰트만 쓸 수 있으므로, 이 경우 반드시 어긋난다.
        try {
          if (!document.fonts.check(`${num(parentStyle.fontSize)}px "${family}"`, text)) {
            note(
              `폰트 '${family}' 가 커버하지 못하는 문자가 있습니다 — 브라우저는 글리프 단위로 대체하지만 ` +
                `Figma 는 못 합니다. 해당 텍스트: "${text.trim().slice(0, 24)}"`,
            );
          }
        } catch {
          /* fonts.check 미지원 환경은 무시 */
        }
        runs.push({
          start,
          end: characters.length,
          fontFamily: family,
          fontStyle: figmaFontStyle(weight, italic),
          fontWeight: weight,
          italic,
          fontSizePx: num(parentStyle.fontSize),
          letterSpacingPx: parentStyle.letterSpacing === 'normal' ? 0 : num(parentStyle.letterSpacing),
          fill: parseColor(parentStyle.color) ?? { r: 0, g: 0, b: 0, a: 1 },
          decoration: /line-through/.test(parentStyle.textDecorationLine)
            ? 'STRIKETHROUGH'
            : /underline/.test(parentStyle.textDecorationLine)
              ? 'UNDERLINE'
              : 'NONE',
          textCase:
            parentStyle.textTransform === 'uppercase'
              ? 'UPPER'
              : parentStyle.textTransform === 'lowercase'
                ? 'LOWER'
                : parentStyle.textTransform === 'capitalize'
                  ? 'TITLE'
                  : 'ORIGINAL',
        });
      }
      cursor = walker.nextNode();
    }

    characters = characters.replace(/ $/, '');
    if (!characters || runs.length === 0) return null;

    // 인접한 동일 스타일 런을 합친다. `<br>` 이나 인라인 요소 경계 때문에 쪼개진 것뿐이면
    // Figma 에서 굳이 나눌 이유가 없고, 수치 검증에서 런 개수까지 대조하기 쉬워진다.
    const mergedRuns: Array<Record<string, unknown>> = [];
    for (const run of runs) {
      const previous = mergedRuns[mergedRuns.length - 1];
      if (previous && previous['end'] === run['start']) {
        const { start: _s1, end: _e1, ...styleA } = previous;
        const { start: _s2, end: _e2, ...styleB } = run;
        if (JSON.stringify(styleA) === JSON.stringify(styleB)) {
          previous['end'] = run['end'];
          continue;
        }
      }
      mergedRuns.push(run);
    }

    // 줄 박스: Range 가 돌려주는 사각형을 세로 겹침으로 묶는다.
    // (인라인 박스마다 사각형이 따로 나오므로 그대로 쓰면 한 줄이 여러 개로 쪼개진다.)
    const range = document.createRange();
    range.selectNodeContents(el);
    const rawRects = Array.from(range.getClientRects()).filter((rect) => rect.width > EPS && rect.height > EPS);
    range.detach?.();

    const lines: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (const rect of [...rawRects].sort((a, b) => a.top - b.top || a.left - b.left)) {
      const center = rect.top + rect.height / 2;
      const existing = lines.find((line) => center >= line.y && center <= line.y + line.h);
      if (existing) {
        const right = Math.max(existing.x + existing.w, rect.right);
        const bottom = Math.max(existing.y + existing.h, rect.bottom);
        existing.x = Math.min(existing.x, rect.left);
        existing.y = Math.min(existing.y, rect.top);
        existing.w = right - existing.x;
        existing.h = bottom - existing.y;
      } else {
        lines.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      }
    }
    if (lines.length === 0) return null;

    const lineHeight = style.lineHeight === 'normal' ? num(style.fontSize) * 1.2 : num(style.lineHeight);

    return {
      characters,
      runs: mergedRuns,
      align:
        style.textAlign === 'center'
          ? 'CENTER'
          : style.textAlign === 'right' || style.textAlign === 'end'
            ? 'RIGHT'
            : style.textAlign === 'justify'
              ? 'JUSTIFIED'
              : 'LEFT',
      verticalAlign: 'TOP',
      lineHeightPx: lineHeight,
      letterSpacingPx: style.letterSpacing === 'normal' ? 0 : num(style.letterSpacing),
      paragraphSpacingPx: 0,
      lineBoxes: lines,
    };
  };

  // ── 페인트 순서 ───────────────────────────────────────────────────────
  /**
   * CSS 페인팅 순서의 실용적 근사.
   * 정적 비위치 요소(-1) → 위치 요소/z-index:auto(0) → z-index 값 순.
   * 음수 z-index 가 부모 배경보다 아래로 가는 경우는 Figma 가 표현하지 못하므로 형제 중 맨 앞에 둔다.
   */
  const paintRank = (style: CSSStyleDeclaration) => {
    const positioned = style.position !== 'static';
    const z = style.zIndex;
    if (!z || z === 'auto') return positioned ? 0 : -1;
    const parsed = Number.parseInt(z, 10);
    return Number.isNaN(parsed) ? (positioned ? 0 : -1) : parsed;
  };

  // ── 폴백 판정 ─────────────────────────────────────────────────────────
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'BASE']);

  const hasPaintedPseudo = (el: Element) => {
    for (const which of ['::before', '::after']) {
      const pseudo = getComputedStyle(el, which);
      const content = pseudo.content;
      if (!content || content === 'none' || content === 'normal') continue;
      const hasText = content !== '""' && content !== "''";
      const hasBg = !isTransparent(parseColor(pseudo.backgroundColor));
      const hasImage = pseudo.backgroundImage && pseudo.backgroundImage !== 'none';
      const hasBorder = num(pseudo.borderTopWidth) > EPS || num(pseudo.borderLeftWidth) > EPS;
      if (hasText || hasBg || hasImage || hasBorder) return true;
    }
    return false;
  };

  const detectFallback = (el: Element, style: CSSStyleDeclaration, backgroundFallback: string | null) => {
    const transform = analyzeTransform(style.transform);
    if (transform === '3d') return { reason: 'transform-3d', detail: style.transform };
    if (transform === 'skew') return { reason: 'transform-skew', detail: style.transform };
    if (transform === 'rotate') return { reason: 'transform-rotate', detail: style.transform };

    const filter = parseBlurOnly(style.filter);
    if (filter === 'unsupported') return { reason: 'css-filter', detail: style.filter };

    const backdrop = parseBlurOnly((style as unknown as Record<string, string>)['backdropFilter'] ?? 'none');
    if (backdrop === 'unsupported') return { reason: 'backdrop-filter', detail: style.backdropFilter ?? '' };

    if (style.clipPath && style.clipPath !== 'none') return { reason: 'clip-path', detail: style.clipPath };
    if (style.maskImage && style.maskImage !== 'none') return { reason: 'mask', detail: style.maskImage };

    const textStroke = (style as unknown as Record<string, string>)['webkitTextStrokeWidth'];
    if (textStroke && num(textStroke) > EPS) return { reason: 'text-stroke', detail: textStroke };

    for (const corner of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const) {
      if (readRadius(style[corner]).elliptical) return { reason: 'elliptical-radius', detail: style[corner] };
    }

    if (backgroundFallback === 'gradient') return { reason: 'gradient', detail: style.backgroundImage };
    if (backgroundFallback) return { reason: 'unknown', detail: style.backgroundImage };

    if (hasPaintedPseudo(el)) return { reason: 'pseudo-element', detail: '::before / ::after' };

    return null;
  };

  // ── 노드 빌드 ─────────────────────────────────────────────────────────
  const buildNode = (el: Element, path: string): Record<string, unknown> | null => {
    if (SKIP_TAGS.has(el.tagName)) return null;

    const style = getComputedStyle(el);
    if (style.display === 'none') {
      prunedElements += 1;
      return null;
    }
    visitedElements += 1;

    const box = el.getBoundingClientRect();
    const invisible = style.visibility !== 'visible';

    const { paints: backgroundPaints, fallback: backgroundFallback } = invisible
      ? { paints: [] as PaintOut[], fallback: null }
      : readBackground(style);
    const stroke = invisible ? null : readStroke(style);

    const effects: Array<Record<string, unknown>> = [];
    if (!invisible) {
      if (style.boxShadow && style.boxShadow !== 'none') {
        for (const layer of splitTopLevel(style.boxShadow)) {
          const parsed = parseShadowLayer(layer);
          if (parsed) effects.push(parsed);
          else note(`box-shadow 해석 실패: ${layer}`);
        }
      }
      const blur = parseBlurOnly(style.filter);
      if (blur && blur !== 'unsupported') effects.push({ type: 'LAYER_BLUR', radius: blur.radius, visible: true });
      const backdrop = parseBlurOnly((style as unknown as Record<string, string>)['backdropFilter'] ?? 'none');
      if (backdrop && backdrop !== 'unsupported') {
        effects.push({ type: 'BACKGROUND_BLUR', radius: backdrop.radius, visible: true });
      }
    }

    const radius = clampRadius(
      [
        readRadius(style.borderTopLeftRadius).radius,
        readRadius(style.borderTopRightRadius).radius,
        readRadius(style.borderBottomRightRadius).radius,
        readRadius(style.borderBottomLeftRadius).radius,
      ],
      box.width,
      box.height,
    );

    const fallback = invisible ? null : detectFallback(el, style, backgroundFallback);

    const node: Record<string, unknown> = {
      id: `n${path}`,
      tag: el.tagName.toLowerCase(),
      rect: { x: box.left, y: box.top, w: box.width, h: box.height },
      paintIndex: 0,
      fills: backgroundPaints,
      radius,
      effects,
      opacity: Number.parseFloat(style.opacity) || (style.opacity === '0' ? 0 : 1),
      blendMode: style.mixBlendMode === 'normal' ? 'NORMAL' : style.mixBlendMode.toUpperCase().replace(/-/g, '_'),
      clip: style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden',
      // `visibility: hidden` 은 자리를 차지하되 그려지지 않는다.
      // 이 값을 넘기지 않으면 Figma 에서 그대로 보여 픽셀이 어긋난다.
      visible: !invisible,
      children: [] as Array<Record<string, unknown>>,
    };
    if (stroke) node['stroke'] = stroke;

    const cid = el.getAttribute('data-ssot-cid');
    if (cid) node['cid'] = cid;

    const variantAttr = el.getAttribute('data-ssot-variant');
    let variant: Record<string, string> | undefined;
    if (variantAttr) {
      try {
        variant = JSON.parse(variantAttr) as Record<string, string>;
        node['variant'] = variant;
      } catch {
        note(`data-ssot-variant 파싱 실패: ${variantAttr}`);
      }
    }

    // Figma 컴포넌트 정의 — 같은 이름끼리 variant 축으로 ComponentSet 이 된다.
    const componentName = el.getAttribute('data-ssot-component');
    if (componentName) {
      const definition: Record<string, unknown> = { name: componentName };
      if (variant) definition['variant'] = variant;
      node['component'] = definition;
    }

    // Figma 컴포넌트 속성 — TEXT 는 문구를, BOOLEAN 은 표시 여부를 인스턴스마다 바꾼다.
    const propText = el.getAttribute('data-ssot-prop-text');
    const propBool = el.getAttribute('data-ssot-prop-bool');
    // BOOLEAN 은 이 요소의 표시 여부이므로 여기에 남기고,
    // TEXT 는 실제 글자를 가진 `#text` 자식에 붙여야 Figma 가 characters 를 바꿀 수 있다.
    if (propBool) node['property'] = { boolean: propBool };

    if (fallback) {
      node['fallback'] = fallback;
      fallbackNodes += 1;
      // 폴백 노드는 영역 전체를 브라우저 렌더 이미지로 대체하므로 자식을 내려가지 않는다.
      return node;
    }

    // SVG 는 통째로 넘긴다 — 플러그인이 createNodeFromSvg 에 그대로 투입한다.
    if (el.tagName.toLowerCase() === 'svg') {
      let markup = el.outerHTML;
      // `currentColor` 는 CSS 상속값이라 Figma 가 해석하지 못하고 검정으로 그린다.
      // 브라우저가 계산한 color 를 그 자리에 박아 넣어야 색이 맞는다.
      if (markup.indexOf('currentColor') !== -1) {
        const resolved = parseColor(style.color);
        if (resolved) {
          const channel = (value: number) =>
            Math.round(value * 255)
              .toString(16)
              .padStart(2, '0');
          const literal =
            resolved.a >= 1
              ? `#${channel(resolved.r)}${channel(resolved.g)}${channel(resolved.b)}`
              : `rgba(${Math.round(resolved.r * 255)}, ${Math.round(resolved.g * 255)}, ${Math.round(resolved.b * 255)}, ${resolved.a})`;
          markup = markup.split('currentColor').join(literal);
        } else {
          note(`SVG 의 currentColor 를 해석하지 못했습니다 (${node['id'] as string}) — Figma 에서 검정으로 그려집니다.`);
        }
      }
      node['svg'] = markup;
      return node;
    }

    // 폼 필드의 값·placeholder 는 DOM 텍스트 노드가 아니라 브라우저 내부에서 그려진다.
    // 즉 **추출되지 않는다** — Figma 에는 빈 상자로 나온다. 조용히 사라지지 않도록 알린다.
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      const field = el as HTMLInputElement;
      // 체크박스·라디오의 `value` 는 전송값이지 화면에 보이는 글자가 아니다 (기본값 'on').
      const valueIsVisible = !/^(checkbox|radio|hidden|file|range|color)$/.test(field.type ?? '');
      const shown = ((valueIsVisible ? field.value : '') || field.placeholder || '').trim();
      if (shown) {
        note(
          `${el.tagName.toLowerCase()} 안의 텍스트는 추출되지 않습니다: "${shown.slice(0, 24)}" — ` +
            `Figma 에는 빈 상자로 나옵니다. 라벨을 요소 밖에 두세요.`,
        );
      }
      return node;
    }

    if (el.tagName === 'IMG') {
      const img = el as HTMLImageElement;
      if (img.currentSrc || img.src) {
        (node['fills'] as PaintOut[]).push({
          type: 'IMAGE',
          src: img.currentSrc || img.src,
          scaleMode: OBJECT_FIT_TO_SCALE[style.objectFit] ?? 'CROP',
          opacity: 1,
          blendMode: 'NORMAL',
          visible: true,
        });
      }
      return node;
    }

    const children: Array<{ node: Record<string, unknown>; rank: number; order: number }> = [];
    let order = 0;

    if (isTextBlock(el)) {
      // 인라인 자손이 배경·테두리를 가지면 그 칠은 텍스트 아래에 따로 놓아야 한다.
      for (const inline of Array.from(el.querySelectorAll('*'))) {
        const inlineStyle = getComputedStyle(inline);
        const inlineBg = readBackground(inlineStyle);
        const inlineStroke = readStroke(inlineStyle);
        if (inlineBg.paints.length === 0 && !inlineStroke) continue;
        const rects = Array.from(inline.getClientRects());
        rects.forEach((rect, index) => {
          const decoration: Record<string, unknown> = {
            id: `n${path}_i${order}_${index}`,
            tag: `${inline.tagName.toLowerCase()}#inline`,
            rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
            paintIndex: 0,
            fills: inlineBg.paints,
            radius: clampRadius(
              [
                readRadius(inlineStyle.borderTopLeftRadius).radius,
                readRadius(inlineStyle.borderTopRightRadius).radius,
                readRadius(inlineStyle.borderBottomRightRadius).radius,
                readRadius(inlineStyle.borderBottomLeftRadius).radius,
              ],
              rect.width,
              rect.height,
            ),
            effects: [],
            opacity: 1,
            blendMode: 'NORMAL',
            clip: false,
            visible: true,
            children: [],
          };
          if (inlineStroke) decoration['stroke'] = inlineStroke;
          children.push({ node: decoration, rank: -1, order: order++ });
        });
      }

      const text = buildTextSpec(el, style);
      if (text) {
        const bounds = text.lineBoxes.reduce(
          (acc, line) => ({
            x: Math.min(acc.x, line.x),
            y: Math.min(acc.y, line.y),
            right: Math.max(acc.right, line.x + line.w),
            bottom: Math.max(acc.bottom, line.y + line.h),
          }),
          { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity },
        );
        const textNode: Record<string, unknown> = {
          id: `n${path}_t`,
          tag: '#text',
          rect: { x: bounds.x, y: bounds.y, w: bounds.right - bounds.x, h: bounds.bottom - bounds.y },
          paintIndex: 0,
          fills: [],
          radius: [0, 0, 0, 0],
          effects: [],
          opacity: 1,
          blendMode: 'NORMAL',
          clip: false,
          visible: !invisible,
          text,
          children: [],
        };
        if (propText) textNode['property'] = { text: propText };
        children.push({ node: textNode, rank: 0, order: order++ });
      }
    } else {
      let index = 0;
      for (const child of Array.from(el.children)) {
        const built = buildNode(child, `${path}_${index}`);
        index += 1;
        if (!built) continue;
        children.push({ node: built, rank: paintRank(getComputedStyle(child)), order: order++ });
      }
    }

    children.sort((a, b) => a.rank - b.rank || a.order - b.order);
    node['children'] = children.map((entry) => entry.node);
    return node;
  };

  // ── 프루닝 ────────────────────────────────────────────────────────────
  /** 아무것도 칠하지 않고 자식도 없는 노드를 제거한다. Figma 노드 수가 곧 플러그인 실행 시간이다. */
  const prune = (node: Record<string, unknown>): boolean => {
    const children = (node['children'] as Array<Record<string, unknown>>) ?? [];
    const kept = children.filter((child) => prune(child));
    node['children'] = kept;

    if (kept.length > 0) return true;
    // 컴포넌트 정의나 속성이 걸린 노드는 그리는 게 없어도 남긴다 — Figma 구조의 일부다.
    if (node['component'] || node['property']) return true;
    if (node['text'] || node['svg'] || node['fallback']) return true;
    if ((node['fills'] as unknown[]).length > 0) return true;
    if (node['stroke']) return true;
    if ((node['effects'] as unknown[]).length > 0) return true;

    prunedElements += 1;
    return false;
  };

  // ── 실행 ──────────────────────────────────────────────────────────────
  const html = document.documentElement;
  const rootStyle = getComputedStyle(html);
  const bodyStyle = getComputedStyle(document.body);

  const pageWidth = html.clientWidth;
  const pageHeight = Math.max(html.scrollHeight, document.body.scrollHeight, html.clientHeight);

  // html 배경이 투명하면 body 배경이 캔버스로 전파된다 (CSS 배경 전파 규칙).
  const canvasBg = !isTransparent(parseColor(rootStyle.backgroundColor))
    ? readBackground(rootStyle).paints
    : readBackground(bodyStyle).paints;

  const bodyNode = buildNode(document.body, '0');
  if (bodyNode) prune(bodyNode);

  const root: Record<string, unknown> = {
    id: 'root',
    tag: 'page',
    rect: { x: 0, y: 0, w: pageWidth, h: pageHeight },
    paintIndex: 0,
    fills: canvasBg,
    radius: [0, 0, 0, 0],
    effects: [],
    opacity: 1,
    blendMode: 'NORMAL',
    clip: true,
    visible: true,
    children: bodyNode ? [bodyNode] : [],
  };

  // paintIndex 를 최종 순서대로 굽는다.
  let counter = 0;
  const stamp = (node: Record<string, unknown>) => {
    node['paintIndex'] = counter++;
    for (const child of (node['children'] as Array<Record<string, unknown>>) ?? []) stamp(child);
  };
  stamp(root);

  return {
    viewport: { width: pageWidth, height: pageHeight },
    rootFontSizePx: num(rootStyle.fontSize),
    fonts: Array.from(fonts.values()),
    root,
    diagnostics: { visitedElements, prunedElements, fallbackNodes, notes },
  };
};
