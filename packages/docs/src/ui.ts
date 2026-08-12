/**
 * 문서 화면이 쓰는 그리기 조각.
 *
 * `@winpilot/docs` 의 본 진입점(`.`)은 `node:fs` 로 파일을 읽는다 — 브라우저 번들에 섞이면
 * 안 되므로 그리는 것과 읽는 것을 진입점부터 나눈다.
 *
 * ## 문서 화면의 뼈대도 여기 있다
 * `DocHeader` · `DocsSidebar` · `ScreenNav` 는 파일을 읽지 않고 받은 값만 그린다. 한때 이
 * 셋이 앱마다 한 벌씩, **일곱 벌** 있었다 — 글자 단위로 같은 것이 일곱이면 하나를 고쳐도
 * 여섯이 옛것으로 남고, 그 사실은 그 여섯을 열어 본 사람만 안다.
 *
 * 파일을 읽는 `SectionList` · `SectionNav` 는 여기 없다. 그 둘은 본 진입점에 있다.
 */
export { Markdown } from './Markdown';
export { CodeBlock } from './CodeBlock';
export { Mermaid, type MermaidProps } from './Mermaid';
export { DocHeader } from './DocHeader';
export { DocsSidebarView } from './DocsSidebar';
export { ScreenNav } from './ScreenNav';
export type { NavGroup, NavLink } from './nav';
