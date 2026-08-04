import type {
  BlendMode,
  ComponentDef,
  ComponentProperty,
  CornerRadius,
  Effect,
  FallbackReason,
  Matrix2x3,
  Paint,
  Rect,
  StrokeSpec,
  TextSpec,
} from '@winpilot/uir';

/**
 * 브라우저 안에서 만들어지는 중간 표현.
 *
 * UIR 과 거의 같지만 자산(이미지·폴백 래스터)이 아직 해시가 아니라 **원본 참조**다.
 * 해시 계산과 파일 저장은 Node 쪽에서 한다 — 브라우저는 바이트를 다룰 이유가 없다.
 */
export type RawPaint =
  | Exclude<Paint, { type: 'IMAGE' }>
  | {
      type: 'IMAGE';
      /** 절대 URL. Node 쪽에서 내려받아 해시로 치환한다. */
      src: string;
      scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE';
      imageTransform?: Matrix2x3;
      scalingFactor?: number;
      opacity: number;
      blendMode: BlendMode;
      visible: boolean;
    };

export type RawFallback = {
  reason: FallbackReason;
  detail: string;
};

export type RawNode = {
  id: string;
  tag: string;
  cid?: string;
  variant?: Record<string, string>;
  rect: Rect;
  transform?: Matrix2x3;
  paintIndex: number;
  fills: RawPaint[];
  stroke?: StrokeSpec;
  radius: CornerRadius;
  effects: Effect[];
  opacity: number;
  blendMode: BlendMode;
  clip: boolean;
  visible: boolean;
  component?: ComponentDef;
  property?: ComponentProperty;
  text?: TextSpec;
  svg?: string;
  fallback?: RawFallback;
  children: RawNode[];
};

export type RawFontRef = {
  family: string;
  style: string;
  weight: number;
  italic: boolean;
};

export type RawDocument = {
  viewport: { width: number; height: number };
  rootFontSizePx: number;
  fonts: RawFontRef[];
  root: RawNode;
  /** 진단용 — 게이트가 아니라 리포트에 쓴다. */
  diagnostics: {
    visitedElements: number;
    prunedElements: number;
    fallbackNodes: number;
    notes: string[];
  };
};
