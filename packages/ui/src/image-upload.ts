/**
 * 이미지 업로드 유효성 검사.
 *
 * 브라우저에서만 돈다 — 서버 검증의 대체가 아니라, 잘못된 파일을 올리기 전에
 * 그 자리에서 알려 주기 위한 것이다.
 *
 * 화면마다 조건이 조금씩 다르다(배너는 가로가 긴 비율만 받는다). 기본값을 두고
 * 필요한 것만 덮어쓰게 해, 조건이 어긋난 화면이 생기지 않도록 한다.
 */
export const IMAGE_RULES = {
  types: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'] as const,
  typeLabel: 'PNG · JPG · WEBP · AVIF',
  maxBytes: 5 * 1024 * 1024,
  minEdge: 300,
  maxCount: 10,
} as const;

/** 허용 비율. `value` 는 가로/세로 (16:9 = 1.777…) */
export type AspectRatioRule = { label: string; value: number };

export const ASPECT_16_9: AspectRatioRule = { label: '16:9', value: 16 / 9 };
export const ASPECT_21_9: AspectRatioRule = { label: '21:9', value: 21 / 9 };

/**
 * 비율 허용 오차 2%.
 *
 * 1920×1080 은 정확히 16:9 지만, 1920×1081 처럼 1px 어긋난 파일이 흔하다.
 * 0 으로 두면 눈으로 같은 이미지가 거부되고, 너무 크게 두면 4:3 이 통과한다
 * (16:9 와 21:9 사이 간격이 약 31% 이므로 2% 는 둘을 확실히 갈라 놓는다).
 */
export const ASPECT_TOLERANCE = 0.02;

/**
 * 벡터는 크기·비율을 보지 않는다.
 *
 * SVG 는 `viewBox` 만 있고 픽셀 크기가 없는 파일이 흔해 `naturalWidth` 가 0 으로 읽힌다.
 * 그 값으로 '크기 미달' 을 내면 멀쩡한 파비콘이 거부되고, 애초에 벡터는 어떤 크기로든
 * 깨지지 않으므로 검사할 이유도 없다.
 */
const VECTOR_TYPES = ['image/svg+xml'];

export type ImageRules = {
  maxCount?: number;
  minEdge?: number;
  maxBytes?: number;
  /** 비어 있으면 비율을 보지 않는다 */
  aspectRatios?: AspectRatioRule[];
  /** 허용 MIME 타입 — 파비콘처럼 형식이 다른 화면에서 덮어쓴다 */
  types?: readonly string[];
  /** 안내에 쓸 형식 표기 (예: 'ICO · PNG · SVG') */
  typeLabel?: string;
};

type ResolvedRules = {
  maxCount: number;
  minEdge: number;
  maxBytes: number;
  aspectRatios: AspectRatioRule[];
  types: readonly string[];
  typeLabel: string;
};

function resolve(rules?: ImageRules): ResolvedRules {
  return {
    maxCount: rules?.maxCount ?? IMAGE_RULES.maxCount,
    minEdge: rules?.minEdge ?? IMAGE_RULES.minEdge,
    maxBytes: rules?.maxBytes ?? IMAGE_RULES.maxBytes,
    aspectRatios: rules?.aspectRatios ?? [],
    types: rules?.types ?? IMAGE_RULES.types,
    typeLabel: rules?.typeLabel ?? IMAGE_RULES.typeLabel,
  };
}

/** `<input accept>` 에 넣을 값 — 실제 검사와 같은 목록에서 만든다. */
export function acceptAttribute(rules?: ImageRules): string {
  return resolve(rules).types.join(',');
}

/** 안내 문구 — 화면에 적용된 조건을 그대로 읽어서 만든다. 규칙과 안내가 어긋나지 않는다. */
export function imageRuleText(rules?: ImageRules): string {
  const resolved = resolve(rules);
  const parts = [
    resolved.typeLabel,
    `장당 ${resolved.maxBytes / 1024 / 1024}MB 이하`,
    `가로·세로 ${resolved.minEdge}px 이상`,
  ];

  if (resolved.aspectRatios.length > 0) {
    parts.push(`가로세로 비율 ${resolved.aspectRatios.map((ratio) => ratio.label).join(' 또는 ')} 만 가능`);
  }

  parts.push(`최대 ${resolved.maxCount}장`);
  return parts.join(' · ');
}

/** 기본 조건 안내 (조건을 덮어쓰지 않는 화면용) */
export const IMAGE_RULE_TEXT = imageRuleText();

export type ImageRejection = { name: string; reason: string };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/** 이미지의 실제 픽셀 크기. 열 수 없으면 `null` — 확장자만 이미지인 파일을 걸러낸다. */
export async function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    const size = await new Promise<{ width: number; height: number } | null>((resolve2) => {
      const image = new Image();
      image.onload = () => resolve2({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve2(null);
      image.src = url;
    });
    return size;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 가로/세로 비를 `16:9` 같은 꼴로. 실제 값이 얼마인지 알려 주기 위한 것이다. */
export function describeRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height) || 1;
  const w = width / divisor;
  const h = height / divisor;
  // 3840:2161 처럼 약분이 안 되는 값은 숫자 비로 보여주는 편이 읽기 쉽다.
  if (w > 40 || h > 40) return `${(width / height).toFixed(2)} : 1`;
  return `${w}:${h}`;
}

export type ImageCheckResult = { ok: true } | { ok: false; reason: string };

/**
 * 파일 하나를 검사한다.
 * `takenNames` 는 이미 올린 파일명, `slotsLeft` 는 남은 장수다.
 */
export async function checkImageFile(
  file: File,
  options: { takenNames: ReadonlySet<string>; slotsLeft: number; rules?: ImageRules },
): Promise<ImageCheckResult> {
  const rules = resolve(options.rules);

  if (options.slotsLeft <= 0) {
    return { ok: false, reason: `최대 ${rules.maxCount}장까지 올릴 수 있습니다.` };
  }
  if (!rules.types.includes(file.type)) {
    return { ok: false, reason: `지원하지 않는 형식입니다 (${rules.typeLabel})` };
  }
  if (file.size > rules.maxBytes) {
    return {
      ok: false,
      reason: `용량 초과 — ${formatBytes(file.size)} / 최대 ${formatBytes(rules.maxBytes)}`,
    };
  }
  if (options.takenNames.has(file.name)) {
    return { ok: false, reason: '같은 이름의 이미지가 이미 있습니다.' };
  }

  // 벡터는 크기·비율 검사를 건너뛴다 — 어떤 크기로도 깨지지 않는다.
  if (VECTOR_TYPES.includes(file.type)) return { ok: true };

  const size = await readImageSize(file);
  if (!size) return { ok: false, reason: '이미지를 읽을 수 없습니다.' };
  if (size.width < rules.minEdge || size.height < rules.minEdge) {
    return {
      ok: false,
      reason: `크기 미달 — ${size.width}×${size.height} / 최소 ${rules.minEdge}×${rules.minEdge}`,
    };
  }

  if (rules.aspectRatios.length > 0) {
    const actual = size.width / size.height;
    const matched = rules.aspectRatios.some(
      (ratio) => Math.abs(actual - ratio.value) / ratio.value <= ASPECT_TOLERANCE,
    );
    if (!matched) {
      const allowed = rules.aspectRatios.map((ratio) => ratio.label).join(' 또는 ');
      return {
        ok: false,
        reason: `비율이 맞지 않습니다 — ${size.width}×${size.height} (${describeRatio(size.width, size.height)}) / 허용 ${allowed}`,
      };
    }
  }

  return { ok: true };
}
