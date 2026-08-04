/**
 * 문서 화면이 쓰는 그리기 조각.
 *
 * `@winpilot/docs` 의 본 진입점(`.`)은 `node:fs` 로 파일을 읽는다 — 브라우저 번들에 섞이면
 * 안 되므로 그리는 것과 읽는 것을 진입점부터 나눈다.
 */
export { Markdown } from './Markdown';
export { CodeBlock } from './CodeBlock';
export { Mermaid, type MermaidProps } from './Mermaid';
