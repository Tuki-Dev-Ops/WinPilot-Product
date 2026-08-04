/**
 * @winpilot/spec — 명명 싱크의 SSOT
 *
 * Client View 와 Admin View 는 서로 다른 도메인이지만 같은 기능을 구현한다.
 * 그 둘을 잇는 유일한 식별자가 Feature ID 이고, 라우트·컴포넌트명·i18n 키·테스트 ID·
 * Figma 프레임명이 전부 여기서 파생된다.
 *
 * 명세 문서: docs/spec/
 */

export * from './types';
export * from './naming';
export * from './glossary';
export * from './features';
export * from './validate';
