/**
 * @winpilot/uir — UI Intermediate Representation
 *
 * 프론트엔드 코드(SSOT)에서 추출한 '브라우저가 계산한 최종 레이아웃'의 표준 표현.
 * 추출기(tools/extractor) 와 Figma 플러그인(figma-plugin) 이 이 패키지를 공유 의존하므로,
 * 한쪽만 스키마를 바꾸면 즉시 타입 에러가 난다 — 조용한 불일치가 불가능하다.
 *
 * 설계 문서: docs/architecture/design-sync-ssot.md
 */

export * from './primitives';
export * from './paint';
export * from './text';
export * from './node';
export * from './manifest';
export * from './document';
export * from './tolerance';
