import type { BreakpointSpec, PageSpec, UIRDocument } from '@winpilot/uir';

/** `pnpm ssot:extract` 가 만드는 `artifacts/figma/bundle.json` 의 형태. */
export type FigmaBundle = {
  bundleVersion: '1.0';
  commit: string;
  generatedAt: string;
  pages: PageSpec[];
  breakpoints: BreakpointSpec[];
  documents: UIRDocument[];
  assets: Record<string, { mimeType: string; base64: string }>;
};

export type Mismatch = {
  nodeId: string;
  cid?: string;
  attribute: string;
  expected: string;
  actual: string;
};

export type RunReport = {
  pagesCreated: number;
  framesCreated: number;
  nodesCreated: number;
  textNodes: number;
  fallbackNodes: number;
  mismatches: Mismatch[];
  warnings: string[];
  lineCountMismatches: number;
  components: number;
  componentSets: number;
  componentProperties: number;
};
