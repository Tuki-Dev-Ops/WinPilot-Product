import { FNB_BRAND } from '@winpilot/store';
import { esc } from './html';

/**
 * 네 문서가 함께 쓰는 **인쇄용 판**.
 *
 * ## 왜 한 곳에 두나
 * 과업범위 정의서 · 요구사항 정의서 · 기능 명세서 · 비기능 명세서가 한 벌로 나간다. 판이
 * 문서마다 다르면 같은 자리에 온 표가 다른 색과 다른 폭으로 서고, 받는 쪽은 그것을 서로 다른
 * 회사가 만든 문서로 읽는다.
 *
 * 실제로 판을 네 벌로 두었다가 A4 를 눕히는 한 번의 결정을 네 곳에 옮겨야 했다. 한 곳만
 * 고치면 나머지 셋이 세로로 남는데, 그 사실은 넷을 나란히 인쇄해 봐야 드러난다.
 *
 * ## 가로로 눕히는 까닭
 * 이 문서들의 표는 여섯 칸까지 간다(책임 범위 · API 요구사항 · 사용자 액션). 세로 A4 에서는
 * 칸마다 두세 글자에서 줄이 꺾여 읽는 속도가 떨어진다. 눕히면 가로가 200mm 에서 269mm 로
 * 늘어 한 칸이 한 줄로 앉는다.
 */

const CSS = `
  @page { size: A4 landscape; margin: 12mm 14mm 14mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
    --d1: #f2f4f7;
    --accent: #1b5fc4;
    --warn: #b8792a;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 26px 22px 56px;
    background: #fff;
    color: var(--ink);
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
    font-size: 9pt;
    line-height: 1.6;
    /* 한글은 낱말 한가운데서 끊긴다. 띄어쓰기 단위로만 끊게 한다. */
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 269mm; margin: 0 auto; }

  .title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
  h1 { font-size: 17pt; margin: 0; letter-spacing: -0.02em; }
  h1 .dim { color: var(--faint); font-weight: 600; }
  .stamp { color: var(--muted); font-size: 9pt; white-space: nowrap; text-align: right; }
  .stamp em { display: block; font-style: italic; }

  h2 {
    background: var(--band);
    border: 1px solid var(--line);
    text-align: center;
    font-size: 11pt;
    letter-spacing: 0.22em;
    padding: 6px;
    margin: 26px 0 10px;
    break-after: avoid;
  }
  h3 { font-size: 10pt; margin: 18px 0 6px; color: var(--accent); break-after: avoid; }
  h4 { font-size: 9.5pt; margin: 14px 0 4px; break-after: avoid; }
  h5 { font-size: 9pt; margin: 9px 0 3px; color: var(--muted); break-after: avoid; }
  p { margin: 6px 0; }
  .lead { color: var(--muted); margin: 0 0 8px; }
  .from { color: var(--faint); font-size: 8.5pt; margin: 0 0 3px; }
  .tbd { color: var(--warn); }

  table { width: 100%; border-collapse: collapse; margin: 4px 0 12px; }
  th, td { border: 1px solid var(--line); padding: 5px 7px; vertical-align: top; text-align: left; }
  thead th { background: var(--head); font-weight: 600; text-align: center; white-space: nowrap; }
  tbody tr { break-inside: avoid; }

  td.d1 { text-align: center; vertical-align: middle; background: var(--d1); font-weight: 700; }
  td.memo { color: var(--muted); }
  tbody tr.head > td { border-top: 1.4px solid #9aa1ad; }

  table.right td { text-align: center; }
  table.right td:first-child { text-align: left; font-weight: 600; color: var(--ink); }

  /* 화면 경로는 메뉴 경로 아래에 작게 붙인다. 한 칸에 둘이지만 읽는 차례가 갈린다. */
  .route { display: block; margin-top: 2px; color: var(--faint); font-size: 8pt; word-break: break-all; }

  ul { margin: 3px 0; padding-left: 16px; }
  li { margin: 1.5px 0; }
  /* 세부 기능 목록 — 번호가 기능 명세서 3절의 「기능 01 · 02」 와 같은 자리를 가리킨다. */
  ol.fn { margin: 0; padding-left: 19px; }
  ol.fn li { margin: 1px 0; }
  ol.fn li::marker { color: var(--faint); font-variant-numeric: tabular-nums; font-size: 8.5pt; }

  ul.check { list-style: none; padding-left: 2px; }
  ul.check li { position: relative; padding-left: 17px; margin: 2px 0; break-inside: avoid; }
  ul.check li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3.5px;
    width: 9px;
    height: 9px;
    border: 1px solid var(--muted);
    border-radius: 2px;
  }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }
  th code, td code, h3 code { background: transparent; padding: 0; }
  a { color: var(--accent); text-decoration: none; }
  .none { color: var(--faint); }
  .yes { color: var(--accent); font-weight: 700; }

  @media print { body { padding: 0; } }
`;

/**
 * 문서 한 벌의 겉면. `extra` 는 그 문서에만 필요한 규칙을 덧댈 자리다.
 *
 * 만든 날을 함께 찍는다. 문서가 생성물이라 **언제 기준인가**가 곧 유효기간이다 — 날짜가
 * 없으면 받는 쪽이 지난 판을 최신으로 읽는다.
 */
export const shell = ({
  title,
  kind,
  body,
  extra = '',
}: {
  /** 브라우저 탭과 문서 머리에 서는 이름 */
  title: string;
  /** 문서 갈래 — 한 벌로 나가므로 어느 문서인지 머리에서 갈려야 한다 */
  kind: string;
  body: string;
  extra?: string;
}): string => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(FNB_BRAND.name)} ${esc(title)}</title>
<style>${CSS}${extra}</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">${esc(title)}</span></h1>
  <div class="stamp">
    ${esc(kind)}
    <em>${esc(new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' }))}</em>
  </div>
</div>

${body}

</div>
</body>
</html>
`;
