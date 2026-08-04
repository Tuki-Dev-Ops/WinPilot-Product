/**
 * SEO 설정 검증.
 *
 * 길이 제한은 취향이 아니라 **검색·SNS 가 잘라 버리는 지점**이다.
 * 넘으면 못 쓰는 것이 아니라 뒤가 `…` 로 잘리므로, 막지 않고 경고로 알려 준다.
 */
import { CONTENT_MESSAGES, isHttpUrl } from './content-record';

export const SEO_LIMITS = {
  /** 검색 결과 제목은 대략 이 길이에서 잘린다 */
  title: 60,
  description: 155,
  /** 공유 카드 제목·설명 */
  ogTitle: 60,
  ogDescription: 110,
} as const;

export const SEO_MESSAGES = {
  titleRequired: '검색 제목을 입력해 주세요.',
  descriptionRequired: '검색 설명을 입력해 주세요.',
  urlRequired: '대표 주소를 입력해 주세요.',
  pathFormat: "사이트맵 경로는 '/' 로 시작해야 합니다.",
  pathRequired: '사이트맵에 넣을 경로를 1개 이상 입력해 주세요.',
} as const;

export type SeoFormInput = {
  /** 검색엔진 */
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  /** 검색엔진 수집 허용 여부 */
  indexable: boolean;
  /** 공유 카드 (OG) */
  ogTitle: string;
  ogDescription: string;
  /** 트위터 카드 형태 */
  twitterCard: string;
  /** 사이트맵에 넣을 경로 (한 줄에 하나) */
  sitemapPaths: string;
  /** 검색엔진 소유 확인 코드 */
  naverVerification: string;
  googleVerification: string;
};

export type SeoFormErrors = Partial<Record<'title' | 'description' | 'canonicalUrl' | 'sitemapPaths', string>>;

export function validateSeo(input: SeoFormInput): SeoFormErrors {
  const errors: SeoFormErrors = {};

  if (!input.title.trim()) errors.title = SEO_MESSAGES.titleRequired;
  if (!input.description.trim()) errors.description = SEO_MESSAGES.descriptionRequired;

  if (!input.canonicalUrl.trim()) errors.canonicalUrl = SEO_MESSAGES.urlRequired;
  else if (!isHttpUrl(input.canonicalUrl)) errors.canonicalUrl = CONTENT_MESSAGES.urlFormat;

  const sitemap = parseSitemapPaths(input.sitemapPaths);
  if (sitemap.invalid.length > 0) errors.sitemapPaths = SEO_MESSAGES.pathFormat;
  else if (sitemap.paths.length === 0) errors.sitemapPaths = SEO_MESSAGES.pathRequired;

  return errors;
}

/**
 * 사이트맵에 넣을 경로를 정리한다.
 *
 * 검색엔진은 `/` 로 시작하는 경로만 받는다. 손으로 적다 보면 앞 슬래시를 빠뜨리거나
 * 같은 경로를 두 번 적게 되므로, 저장 전에 걸러 실제로 나갈 목록을 보여준다.
 */
export function parseSitemapPaths(raw: string): { paths: string[]; invalid: string[] } {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const paths: string[] = [];
  const invalid: string[] = [];

  for (const line of lines) {
    if (!line.startsWith('/')) {
      invalid.push(line);
      continue;
    }
    if (!paths.includes(line)) paths.push(line);
  }

  return { paths, invalid };
}

/** 실제로 생성될 `sitemap.xml` 내용. 화면에서 그대로 보여준다 — 무엇이 나가는지 알아야 한다. */
export function buildSitemapXml(canonicalUrl: string, paths: readonly string[], today: string): string {
  const origin = canonicalUrl.trim().replace(/\/$/, '') || 'https://example.com';
  const entries = paths
    .map((path) => `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

/** `robots.txt` 내용. 수집 차단이면 전부 막고, 허용이면 사이트맵 위치를 알려 준다. */
export function buildRobotsTxt(canonicalUrl: string, indexable: boolean): string {
  const origin = canonicalUrl.trim().replace(/\/$/, '') || 'https://example.com';
  if (!indexable) return 'User-agent: *\nDisallow: /';
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml`;
}

/** 길이 상태 — 넘었는지, 얼마나 남았는지. 입력 옆에 그대로 보여준다. */
export function lengthState(value: string, limit: number): { count: number; over: boolean; text: string } {
  const count = value.trim().length;
  return {
    count,
    over: count > limit,
    text: `${count} / ${limit}자`,
  };
}
