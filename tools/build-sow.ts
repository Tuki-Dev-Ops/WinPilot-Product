import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES, type ViewId } from '@winpilot/spec';
import { FNB_BRAND } from '@winpilot/store';
import { pages as clientPages } from '../apps/fnb-client-a/pages.manifest';
import { pages as adminPages } from '../apps/fnb-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL as clientCommon,
} from '../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../apps/fnb-admin/lib/screen-specs';
import { IA_GROUPS as clientIa } from '../apps/fnb-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../apps/fnb-admin/lib/ia-groups';

/**
 * F&B 한 쌍의 **업무 범위 정의서**를 만든다 — 기획 · 디자인 · 개발 세 갈래.
 *
 * ## 수량을 손으로 적지 않는다
 * 이런 문서에서 다투게 되는 것은 늘 수량이다. 손으로 적으면 화면이 하나 늘 때 고칠 곳이
 * 둘이 되고, 실제로는 한쪽만 고친다. 그러면 계약 자리에서 코드와 문서가 다른 말을 한다.
 *
 * 여기 숫자는 전부 저장소에서 센 것이다 — 화면 등록부 · 화면 명세 · 기능 레지스트리 ·
 * 컴포넌트 파일 · 토큰 파일. `pnpm sow:build` 를 다시 돌리면 지금 코드와 맞는 문서가 나온다.
 *
 * ## 셀 수 없는 칸은 0 을 적지 않는다
 * 받은 양식에는 촬영 · 로고 · 서버 구축처럼 이 과업에 없는 줄이 있다. 거기에 `0` 을 적으면
 * **하기로 했는데 아직 안 한 것**으로 읽힌다. 수량 자리에 `—` 를 두고 비고에 왜 없는지를
 * 적는다. 있는 것과 없는 것을 같은 표에서 갈라 보이게 하려는 것이다.
 *
 * ## HTML 로 내는 이유
 * 받는 쪽이 바로 인쇄해 PDF 로 만들 수 있어야 한다. 워드나 한글 파일은 만드는 쪽의 글꼴과
 * 여백에 기대므로 열 때마다 다르게 보인다. HTML 은 `@page` 와 `break-inside` 로 **끊기는
 * 자리를 지정할 수 있다.** 파일 하나로 끝나고 밖에서 받아 오는 것이 없어 메일로 보내도 그대로 열린다.
 *
 * ```
 * pnpm sow:build
 * ```
 */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/* ── 저장소에서 센 값 ───────────────────────────────────────── */

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const componentCount = (dir: string): number =>
  walk(dir).filter((p) => p.endsWith('.tsx') && p.includes('_components')).length;

const uiExports = (readFileSync('packages/ui/src/index.ts', 'utf8').match(/^export \{/gm) ?? []).length;
const colorTokens = (readFileSync('packages/tokens/theme.css', 'utf8').match(/--color-[a-z0-9-]+:/g) ?? []).length;

const featuresOf = (view: ViewId) => FEATURES.filter((one) => view in one.views);

const N = {
  screenClient: clientPages.length,
  screenAdmin: adminPages.length,
  get screens() {
    return this.screenClient + this.screenAdmin;
  },
  featureClient: featuresOf('fnb-client').length,
  featureAdmin: featuresOf('fnb-admin').length,
  get features() {
    return FEATURES.filter((one) => 'fnb-client' in one.views || 'fnb-admin' in one.views).length;
  },
  iaClient: clientIa.length,
  iaAdmin: adminIa.length,
  compClient: componentCount('apps/fnb-client-a/app'),
  compAdmin: componentCount('apps/fnb-admin/app'),
  formClient: clientSpecs.filter((s) => (s as { fields?: unknown[] }).fields?.length).length,
  formAdmin: adminSpecs.filter((s) => (s as { fields?: unknown[] }).fields?.length).length,
  common: clientCommon.length,
  uiExports,
  colorTokens,
};

/* ── 표 ────────────────────────────────────────────────────── */

type Line = {
  /** 범위 — 여러 줄을 묶는 첫 칸. 이어지는 줄은 비운다 */
  scope?: string;
  scopeSpan?: number;
  kind?: string;
  kindSpan?: number;
  field: string;
  /** 수량. 이 과업에 없는 줄은 `null` — `0` 을 적으면 하기로 했는데 안 한 것으로 읽힌다 */
  qty: number | null;
  unit: string;
  note: string;
};

const row = (line: Line): string => {
  const cells: string[] = [];
  if (line.scope !== undefined) cells.push(`<td class="scope" rowspan="${line.scopeSpan ?? 1}">${esc(line.scope)}</td>`);
  if (line.kind !== undefined) cells.push(`<td class="kind" rowspan="${line.kindSpan ?? 1}">${esc(line.kind)}</td>`);
  cells.push(`<td class="field">${esc(line.field)}</td>`);
  cells.push(
    line.qty === null
      ? '<td class="qty out">—</td>'
      : `<td class="qty">${line.qty.toLocaleString('ko-KR')}</td>`,
  );
  cells.push(`<td class="unit">${esc(line.unit)}</td>`);
  cells.push(`<td class="note${line.qty === null ? ' out' : ''}">${rich(line.note)}</td>`);
  return `<tr>${cells.join('')}</tr>`;
};

const table = (title: string, lines: Line[]): string => `
<table class="scope-table">
  <thead>
    <tr><th colspan="6" class="band">${esc(title)}</th></tr>
    <tr>
      <th style="width:76px">범위</th>
      <th style="width:104px">분류</th>
      <th style="width:190px">분야</th>
      <th style="width:64px">수량</th>
      <th style="width:52px">단위</th>
      <th>비고</th>
    </tr>
  </thead>
  <tbody>${lines.map(row).join('')}</tbody>
</table>`;

/* ── 기획 ──────────────────────────────────────────────────── */

const PLAN: Line[] = [
  { scope: 'PM', scopeSpan: 2, kind: '프로젝트 관리', kindSpan: 2, field: '범위 정의 · 산출물 정의', qty: 1, unit: '건', note: '본 문서. 코드에서 생성하므로 범위가 바뀌면 다시 만든다' },
  { field: '변경 관리 절차', qty: 1, unit: '건', note: '화면 등록부와 명세를 고치는 것으로 시작한다 — 7장' },

  { scope: '분석', scopeSpan: 3, kind: '요구 분석', kindSpan: 2, field: '기능 정의', qty: N.features, unit: '건', note: '기능 레지스트리에 등록된 수. 등록되지 않은 화면은 품질 검사에 잡히지 않는다' },
  { field: '화면 정의', qty: N.screens, unit: '건', note: `고객 사이트 ${N.screenClient} · 운영 콘솔 ${N.screenAdmin}` },
  { kind: '시장 조사', field: '경쟁사 분석', qty: null, unit: '건', note: '범위 밖 — 발주처가 제공하는 브랜드 기준을 따른다' },

  { scope: '기획', scopeSpan: 6, kind: 'IA 기획', kindSpan: 2, field: '정보 구조 도면', qty: N.iaClient + N.iaAdmin, unit: '갈래', note: `고객 사이트 ${N.iaClient} · 운영 콘솔 ${N.iaAdmin}. 화면이 늘면 도면도 함께 자란다` },
  { field: '메뉴 구조 설계', qty: 2, unit: '건', note: '사이트 헤더 갈래 · 콘솔 사이드바 갈래' },
  { kind: 'UX 기획', kindSpan: 2, field: '화면 흐름도', qty: N.screens, unit: '건', note: '화면마다 한 장. 실선은 정상, 점선은 예외' },
  { field: '입력 양식 설계', qty: N.formClient + N.formAdmin, unit: '화면', note: `양식이 있는 화면. 고객 ${N.formClient} · 콘솔 ${N.formAdmin}` },
  { kind: '명세', kindSpan: 2, field: '기능 명세서 (FSD)', qty: N.screens, unit: '장', note: '화면 하나가 한 장. 목적 · 구성 · 데이터 항목 · 버튼 · 예외 · 인수 조건까지 열네 절' },
  { field: '비기능 명세서 (NFS)', qty: N.common, unit: '항목', note: '화면을 가리지 않고 걸리는 공통 요건' },
];

/* ── 디자인 ────────────────────────────────────────────────── */

const DESIGN: Line[] = [
  { scope: 'BX', scopeSpan: 4, kind: '브랜드', kindSpan: 3, field: '로고 디자인', qty: null, unit: '건', note: '범위 밖 — 원본 파일을 받아 그대로 쓴다. 눈으로 보고 다시 그린 로고는 그 브랜드의 표장이 아니다' },
  { field: 'BI 가이드 제작', qty: null, unit: '건', note: '범위 밖 — 색 · 글자 · 간격은 아래 디자인 토큰이 대신한다' },
  { field: '패키지 · 인쇄물 디자인', qty: null, unit: '건', note: '범위 밖 — 웹 화면에 한정한다' },
  { kind: '멀티미디어', field: '제품 · 모델 촬영 · 영상 제작', qty: null, unit: '컷', note: '범위 밖 — 메뉴 사진은 발주처가 제공한다' },

  { scope: 'UI 디자인', scopeSpan: 5, kind: '디자인 시스템', kindSpan: 2, field: '디자인 토큰', qty: N.colorTokens, unit: '개', note: '색 토큰 수. 값의 원본이 한 파일이라 앱에서 색을 직접 선언하지 않는다' },
  { field: '공통 컴포넌트', qty: N.uiExports, unit: '개', note: '버튼 · 입력 · 표 등 화면을 가리지 않고 쓰는 조각' },
  { kind: '화면 디자인', kindSpan: 3, field: '고객 사이트 화면', qty: N.screenClient, unit: '화면', note: '반응형 — 1280 · 1024 · 768 · 390 네 너비' },
  { field: '운영 콘솔 화면', qty: N.screenAdmin, unit: '화면', note: '반응형 — 같은 네 너비' },
  { field: '화면별 전용 컴포넌트', qty: N.compClient + N.compAdmin, unit: '개', note: `고객 ${N.compClient} · 콘솔 ${N.compAdmin}` },

  { scope: '검수', scopeSpan: 2, kind: '반응형', field: '가로 넘침 검사', qty: N.screens * 4, unit: '건', note: '화면 × 네 너비. `overflow:check` 로 자동 확인' },
  { kind: '산출', field: '화면 캡처', qty: N.screens, unit: '장', note: '전 화면 한 장씩. `pages:shoot` 으로 다시 찍는다' },
];

/* ── 개발 ──────────────────────────────────────────────────── */

const DEV: Line[] = [
  { scope: '아키텍처', scopeSpan: 4, kind: '기술 선정', kindSpan: 2, field: '프레임워크 · 언어', qty: 1, unit: '건', note: 'Next.js App Router · TypeScript · Tailwind CSS' },
  { field: '저장소 구조', qty: 1, unit: '건', note: 'pnpm 워크스페이스. 앱과 공유 패키지를 한 저장소에서 관리' },
  { kind: '데이터', kindSpan: 2, field: '데이터 모델 정의', qty: 1, unit: '건', note: '공유 패키지가 값의 원본. 콘솔과 사이트가 같은 한 곳을 읽는다' },
  { field: '서버 · DB 구축', qty: null, unit: '건', note: '범위 밖 — 본 단계에는 서버와 데이터베이스가 없다' },

  { scope: '퍼블리싱', scopeSpan: 2, kind: 'UI 마크업', field: '화면 마크업', qty: N.screens, unit: '화면', note: '반응형. 별도 퍼블리싱 산출물 없이 컴포넌트로 바로 구현' },
  { kind: '접근성', field: '색 · 모양 이중 표기', qty: N.common, unit: '항목', note: '색만으로 상태를 알리지 않는다 등 공통 요건' },

  { scope: '프론트엔드', scopeSpan: 5, kind: '컴포넌트', kindSpan: 2, field: '공통 컴포넌트 개발', qty: N.uiExports, unit: '개', note: '앱 두 벌이 나눠 쓴다' },
  { field: '화면별 컴포넌트 개발', qty: N.compClient + N.compAdmin, unit: '개', note: `고객 ${N.compClient} · 콘솔 ${N.compAdmin}` },
  { kind: '기능', kindSpan: 2, field: '고객 사이트 기능', qty: N.featureClient, unit: '기능', note: '메뉴 · 매장 · 창업 · 고객센터' },
  { field: '운영 콘솔 기능', qty: N.featureAdmin, unit: '기능', note: '등록 · 창업 · 고객센터 · 배너 · 설정' },
  { kind: '검증', field: '입력 검증 · 오류 문구', qty: N.formClient + N.formAdmin, unit: '화면', note: '양식이 있는 화면마다' },

  { scope: '백엔드', scopeSpan: 3, kind: 'API', field: 'REST API 개발', qty: null, unit: '개', note: '범위 밖 — 서버가 없다' },
  { kind: '인증', field: '회원 · 로그인 · 권한', qty: null, unit: '건', note: '범위 밖 — 화면까지만 있고 입력한 값은 전송되지 않는다' },
  { kind: '결제', field: '주문 · 결제 연동', qty: null, unit: '건', note: '범위 밖 — 주문은 전화와 매장 방문으로 받는다' },

  { scope: '인프라', scopeSpan: 2, kind: '배포', field: '서버 구성 · 배포', qty: null, unit: '건', note: '범위 밖 — 인수 산출물은 소스와 문서다' },
  { kind: '보안', field: '취약점 진단', qty: null, unit: '건', note: '범위 밖' },

  { scope: '품질', scopeSpan: 3, kind: '자동 검사', kindSpan: 3, field: '명명 · 등록 일치', qty: 3, unit: '종', note: '`spec:check` · `sync:check` · `bind:check`' },
  { field: '문서 누락 검사', qty: 1, unit: '종', note: '`docs:check` — 화면은 있는데 문서가 빈 자리' },
  { field: '반응형 · 무게 검사', qty: 2, unit: '종', note: '`overflow:check` · `weight:check`' },
];

/* ── 문서 ──────────────────────────────────────────────────── */

/**
 * 만든 날. 문서가 생성물이라 **언제 기준인가**가 곧 유효기간이다 — 날짜가 없으면 받는 쪽이
 * 지난 판을 최신으로 읽는다.
 */
const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' });

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>F&amp;B 업무 범위 정의서</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
    --qty: #b8792a;
    --link: #1b5fc4;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 26px 22px 56px;
    background: #fff;
    color: var(--ink);
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
    font-size: 9.5pt;
    line-height: 1.6;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 200mm; margin: 0 auto; }

  .title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }
  h1 { font-size: 17pt; margin: 0; letter-spacing: -0.02em; }
  h1 .dim { color: var(--faint); font-weight: 600; }
  .date { color: var(--muted); font-size: 9pt; font-style: italic; white-space: nowrap; }

  table { width: 100%; border-collapse: collapse; margin: 0 0 18px; }
  th, td { border: 1px solid var(--line); padding: 4px 7px; vertical-align: middle; }

  .ident th { width: 100px; background: var(--head); text-align: center; font-weight: 600; }
  .ident td { text-align: left; }

  .common { margin-bottom: 18px; }
  .common th { background: var(--band); text-align: center; font-weight: 700; font-size: 10pt; padding: 5px; }
  .common td { padding: 10px 14px; }
  .common ol { margin: 0; padding-left: 18px; color: var(--muted); }
  .common li { margin: 2px 0; }
  .common li strong { color: var(--ink); }

  .scope-table { break-inside: auto; }
  .scope-table .band {
    background: var(--band);
    text-align: center;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.3em;
    padding: 6px;
  }
  .scope-table thead th { background: var(--head); text-align: center; font-weight: 600; }
  .scope-table thead tr { break-inside: avoid; break-after: avoid; }
  .scope-table tbody tr { break-inside: avoid; }

  td.scope, td.kind { text-align: center; font-weight: 600; background: #fbfcfd; }
  td.kind { font-weight: 500; }
  td.field { font-weight: 600; }
  td.qty {
    text-align: center;
    font-weight: 700;
    color: var(--qty);
    background: #fffdf7;
    font-variant-numeric: tabular-nums;
  }
  td.qty.out { color: var(--faint); background: #fafafb; font-weight: 500; }
  td.unit { text-align: center; color: var(--muted); }
  td.note { color: var(--muted); font-size: 9pt; }
  td.note.out { color: var(--faint); }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }

  .foot { margin-top: 18px; color: var(--muted); font-size: 9pt; }
  .foot h2 { font-size: 10.5pt; margin: 14px 0 6px; color: var(--ink); }
  .foot ul { margin: 4px 0; padding-left: 18px; }

  .no-print {
    margin: 0 0 16px;
    padding: 7px 11px;
    background: #f4f6f9;
    border: 1px dashed var(--line);
    border-radius: 5px;
    font-size: 9pt;
    color: var(--muted);
  }

  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="sheet">

<p class="no-print">브라우저에서 <strong>인쇄(Ctrl/Cmd + P) → 대상을 “PDF로 저장”</strong> 하면 A4 문서가 됩니다. 배경 그래픽 옵션을 켜면 표 머리 음영이 함께 인쇄됩니다. 이 안내문은 인쇄물에 나오지 않습니다.</p>

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">업무 범위 정의서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<table class="ident">
  <tr><th>대 상</th><td>F&amp;B 고객 사이트(<code>apps/fnb-client-a</code>) · 운영 콘솔(<code>apps/fnb-admin</code>)</td></tr>
  <tr><th>범위 기준</th><td>화면 <strong>${N.screens}개</strong> (고객 ${N.screenClient} · 콘솔 ${N.screenAdmin}) · 기능 <strong>${N.features}가지</strong></td></tr>
  <tr><th>작성 근거</th><td>저장소의 화면 등록부 · 화면 명세 · 기능 레지스트리에서 생성 (<code>pnpm sow:build</code>)</td></tr>
</table>

<table class="common">
  <tr><th>공통사항</th></tr>
  <tr><td>
    <ol>
      <li>본 문서의 <strong>수량은 현재 구현된 것을 센 값</strong>입니다. 예상치가 아니라 저장소에서 기계로 세어 만들었습니다.</li>
      <li>수량이 <strong>—</strong> 인 줄은 <strong>이번 과업의 범위가 아닙니다.</strong> 0 이 아니라 —인 것은, 0 이 “하기로 했는데 아직 안 한 것” 으로 읽히기 때문입니다.</li>
      <li>메뉴 사진과 문구 등 <strong>콘텐츠는 발주처가 제공</strong>합니다. 본 과업은 받은 값을 화면에 세우는 일까지입니다.</li>
      <li>본 단계에는 <strong>서버와 데이터베이스가 없습니다.</strong> 콘솔에서 고친 값은 브라우저 안에서만 유지되며, 양식에 입력한 값은 전송되지 않습니다.</li>
      <li>디자인 산출물은 <strong>실제로 동작하는 화면</strong>으로 인도합니다. 별도의 시안 파일(PSD · AI)은 포함하지 않습니다.</li>
      <li>범위를 더하거나 빼는 일은 <strong>화면 등록부와 화면 명세를 고치는 것</strong>으로 시작하며, 본 문서와 기능 명세서가 함께 갱신됩니다.</li>
    </ol>
  </td></tr>
</table>

${table('기 획', PLAN)}
${table('디 자 인', DESIGN)}
${table('개 발', DEV)}

<div class="foot">
  <h2>인도물</h2>
  <ul>
    <li>소스 코드 — 앱 2벌과 공유 패키지</li>
    <li>기능 명세서 ${N.screens}장 · 비기능 명세서 · IA · 화면 흐름도</li>
    <li>화면 캡처 ${N.screens}장</li>
    <li>디자인 토큰 한 벌 (색 토큰 ${N.colorTokens}개)</li>
    <li>품질 검사 도구 6종</li>
    <li>본 문서 (HTML · 인쇄 시 PDF)</li>
  </ul>

  <h2>품질 기준</h2>
  <p>
    아래 검사는 저장소에 포함되어 있으며, 인수 시점에 <strong>모두 통과한 상태</strong>로 인도합니다.
    검사를 여럿 두는 것은 하나가 나머지를 대신하지 못하기 때문입니다 —
    <code>spec:check</code>(이름 · 주소 · 등록) ·
    <code>sync:check</code>(레지스트리와 실제 파일 이름) ·
    <code>docs:check</code>(문서 누락) ·
    <code>bind:check</code>(값의 출처가 아직 있는가) ·
    <code>overflow:check</code>(네 너비 가로 넘침) ·
    <code>weight:check</code>(화면이 내려받는 바이트).
  </p>

  <h2>변경 관리</h2>
  <p>
    문서만 고치거나 코드만 고치는 변경은 받지 않습니다. 한쪽만 고쳐 두면 다른 쪽이 조용히 낡은
    상태로 남고, 그 사실은 한참 뒤 인수 자리에서 드러나기 때문입니다.
  </p>
</div>

</div>
</body>
</html>
`;

const out = 'FnB-업무범위정의서.html';
writeFileSync(out, html, 'utf8');
console.log(
  `${out} — 화면 ${N.screens} · 기능 ${N.features} · 컴포넌트 ${N.compClient + N.compAdmin} · 색 토큰 ${N.colorTokens}`,
);
