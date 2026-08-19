import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES, type ViewId } from '@winpilot/spec';
import { FNB_BRAND } from '@winpilot/store';
import { pages as clientPages } from '../apps/fnb-client-a/pages.manifest';
import { pages as adminPages } from '../apps/fnb-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL as clientCommon,
  type ScreenSpec,
} from '../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../apps/fnb-admin/lib/screen-specs';
import { IA_GROUPS as clientIa } from '../apps/fnb-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../apps/fnb-admin/lib/ia-groups';
import { FNB_MENU } from '../apps/fnb-admin/lib/navigation/fnb-menu';

/**
 * F&B 한 쌍의 **업무 범위 정의서**를 만든다 — 기획 · UI 디자인 · Front-End · Back-End.
 *
 * ## 왜 Depth 로 적는가
 * 범위를 줄글이나 수량표로만 적으면 "화면 47개" 까지는 합의되는데 **그 화면 안에 무엇이
 * 들어가는가**에서 갈린다. 인수 자리에서 다투는 것은 늘 그 안쪽이다.
 *
 * 그래서 앱 → 갈래 → 화면 → 세부 항목 네 단으로 편다. 같은 값이 이어지는 칸은 `rowspan`
 * 으로 묶어 나무처럼 읽히게 한다. 줄마다 앱 이름을 되풀이하면 어디서 갈래가 바뀌는지 눈에
 * 들어오지 않는다.
 *
 * 네 갈래가 보는 것이 다르다 — 기획은 **왜 있고 무엇을 하기로 했는가**, UI 디자인은
 * **무엇으로 이루어졌는가**, Front-End 는 **화면에서 어떻게 도는가**, Back-End 는 **어떤
 * 값을 읽고 쓰는가**. 넷을 한 표에 넣으면 어느 줄이 누구의 일인지 알 수 없어진다.
 *
 * BX(로고 · BI · 패키지 · 촬영)는 제공하지 않는다. 갈래를 두지 않고 범위 밖 표에만 적는다 —
 * 빈 갈래를 세워 두면 나중에 채우기로 한 것으로 읽힌다.
 *
 * ## 내용을 손으로 적지 않는다
 * 손으로 옮겨 적으면 화면이 하나 늘 때 고칠 곳이 둘이 되고, 실제로는 한쪽만 고친다. 그러면
 * 계약 자리에서 코드와 문서가 다른 말을 한다.
 *
 * 여기 줄은 전부 저장소에서 읽은 것이다 — 화면 등록부 · IA 묶음 · 화면 명세 · 기능
 * 레지스트리. `pnpm sow:build` 를 다시 돌리면 지금 코드와 맞는 문서가 나온다.
 *
 * ## 범위 밖은 0 이 아니라 —
 * 서버 · 결제 · 촬영처럼 이 과업에 없는 것에 `0` 을 적으면 **하기로 했는데 아직 안 한 것**
 * 으로 읽힌다. 따로 표를 두고 왜 없는지를 적는다.
 *
 * ## HTML 로 내는 이유
 * 받는 쪽이 바로 인쇄해 PDF 로 만들 수 있어야 한다. 워드나 한글 파일은 만드는 쪽의 글꼴과
 * 여백에 기대므로 열 때마다 다르게 보인다. HTML 은 `@page` 와 `break-inside` 로 **끊기는
 * 자리를 지정할 수 있다.** 파일 하나로 끝나고 밖에서 받아 오는 것이 없어 메일로 보내도
 * 그대로 열린다.
 *
 * ```
 * pnpm sow:build
 * ```
 */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 명세가 마크다운으로 적혀 있어 강조 표기를 태그로 바꾼다. */
const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/** 비고 칸 — 한 줄이면 문단, 여럿이면 목록. 여럿을 한 문장으로 이으면 어디서 끊기는지 보이지 않는다. */
const note = (value: string | readonly string[]): string =>
  typeof value === 'string'
    ? rich(value)
    : value.length === 1
      ? rich(value[0])
      : `<ul>${value.map((one) => `<li>${rich(one)}</li>`).join('')}</ul>`;

/* ── 저장소에서 읽은 값 ─────────────────────────────────────── */

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

const featuresOf = (view: ViewId) => FEATURES.filter((one) => view in one.views);

type IaLike = {
  id: string;
  label?: string;
  screens: readonly { screen: string; ko: string }[];
  /** 이 갈래의 화면이 읽고 쓰는 곳 — Back-End 단의 원본이 된다 */
  data: readonly string[];
};

/** 어드민 갈래는 이름을 사이드바에서 읽는다 — 도면과 메뉴가 다른 말을 하지 않게. */
const menuLabel = (id: string): string => FNB_MENU.find((one) => one.id === id)?.label ?? id;

type App = {
  label: string;
  dir: string;
  view: ViewId;
  pages: readonly { id: string; name: string; route: string }[];
  specs: readonly ScreenSpec[];
  ia: readonly IaLike[];
  /** 갈래 이름을 어디서 읽는가 — 고객 사이트는 직접 적고, 콘솔은 메뉴가 이긴다 */
  groupLabel: (group: IaLike) => string;
};

const APPS: App[] = [
  {
    label: '고객 사이트',
    dir: 'fnb-client-a',
    view: 'fnb-client',
    pages: clientPages,
    specs: clientSpecs,
    ia: clientIa,
    groupLabel: (group) => group.label ?? group.id,
  },
  {
    label: '운영 콘솔',
    dir: 'fnb-admin',
    view: 'fnb-admin',
    pages: adminPages,
    specs: adminSpecs,
    ia: adminIa,
    groupLabel: (group) => group.label ?? menuLabel(group.id),
  },
];

const N = {
  screenClient: clientPages.length,
  screenAdmin: adminPages.length,
  screens: clientPages.length + adminPages.length,
  features: FEATURES.filter((one) => 'fnb-client' in one.views || 'fnb-admin' in one.views).length,
  featureClient: featuresOf('fnb-client').length,
  featureAdmin: featuresOf('fnb-admin').length,
  compClient: componentCount('apps/fnb-client-a/app'),
  compAdmin: componentCount('apps/fnb-admin/app'),
  common: clientCommon.length,
};

/* ── 나무 ──────────────────────────────────────────────────── */

type Item = { name: string; note: string | readonly string[] };
type ScreenNode = { ko: string; route: string; items: Item[] };
type GroupNode = { label: string; screens: ScreenNode[] };
type AppNode = { label: string; groups: GroupNode[] };

/**
 * 앱 → 갈래 → 화면 → 세부 항목 나무를 만든다.
 *
 * 어느 갈래에도 들지 않는 화면이 있다(고객 사이트의 홈이 그렇다 — 일곱 갈래가 모두 거기서
 * 갈라지므로 어느 하나에 넣을 수 없다). 그런 화면은 마지막에 `공통` 으로 모은다. 빠뜨리면
 * 표의 화면 수가 등록부와 달라지고, 그 차이는 아무도 눈치채지 못한다.
 */
const tree = (pick: (spec: ScreenSpec, data: readonly string[]) => Item[]): AppNode[] =>
  APPS.map((app) => {
    const byId = new Map(app.specs.map((one) => [one.screen, one]));
    const pageById = new Map(app.pages.map((one) => [one.id, one]));
    const placed = new Set<string>();

    const node = (id: string, ko: string, data: readonly string[]): ScreenNode | null => {
      const page = pageById.get(id);
      const spec = byId.get(id);
      if (!page || !spec) return null;
      placed.add(id);
      const items = pick(spec, data);
      return items.length > 0 ? { ko, route: page.route, items } : null;
    };

    const groups: GroupNode[] = [];
    for (const group of app.ia) {
      const screens = group.screens
        .map((one) => node(one.screen, one.ko, group.data))
        .filter((one) => one !== null);
      if (screens.length > 0) groups.push({ label: app.groupLabel(group), screens });
    }

    const loose = app.pages
      .filter((page) => !placed.has(page.id))
      .map((page) => node(page.id, page.name, []))
      .filter((one) => one !== null);
    if (loose.length > 0) groups.push({ label: '공통', screens: loose });

    /*
      세울 항목이 하나도 없어 표에서 빠진 화면을 알린다. 범위 문서에서 화면이 사라지는 것은
      범위가 줄어든 것으로 읽히는데, 조용히 빠지면 만든 사람도 모른다.
    */
    const shown = new Set(groups.flatMap((group) => group.screens.map((screen) => screen.route)));
    const dropped = app.pages.filter((page) => !shown.has(page.route));
    if (dropped.length > 0) {
      console.warn(`  [빠짐] ${app.dir} — ${dropped.map((one) => one.id).join(', ')}`);
    }

    return { label: app.label, groups };
  });

/**
 * 나무를 표로 편다 — **화면 하나가 묶음 하나**다.
 *
 * 처음에는 1Depth 를 앱 전체로 묶었다. 그러자 133줄이 한 칸이 되어 글자가 표 한가운데
 * 놓였고, 인쇄하면 그 칸이 여러 쪽에 걸치면서 **앞쪽 몇 장은 1Depth 가 통째로 비었다.**
 * 칸을 나누는 선은 종이 위에서 끊기지만 글자는 한 번만 찍히기 때문이다.
 *
 * 그래서 세 단을 모두 화면 단위로 묶는다. 같은 앱 이름이 화면마다 되풀이되지만, 어느 쪽을
 * 펴도 그 줄이 어느 앱 · 어느 갈래의 것인지 읽힌다. 되풀이가 빈칸보다 낫다.
 */
const rows = (apps: AppNode[]): string => {
  const out: string[] = [];
  for (const app of apps) {
    for (const group of app.groups) {
      for (const screen of group.screens) {
        const span = screen.items.length;
        screen.items.forEach((item, index) => {
          const cells =
            index === 0
              ? [
                  `<td class="d1" rowspan="${span}">${esc(app.label)}</td>`,
                  `<td class="d2" rowspan="${span}">${esc(group.label)}</td>`,
                  `<td class="d3" rowspan="${span}">${esc(screen.ko)}<span class="route">${esc(screen.route)}</span></td>`,
                ]
              : [];
          cells.push(`<td class="d4">${esc(item.name)}</td>`);
          cells.push(`<td class="memo">${note(item.note)}</td>`);
          out.push(`<tr${index === 0 ? ' class="head"' : ''}>${cells.join('')}</tr>`);
        });
      }
    }
  }
  return out.join('');
};

const table = (title: string, lead: string, apps: AppNode[]): string => `
<h2 class="band">${esc(title)}</h2>
<p class="lead">${rich(lead)}</p>
<table class="depth">
  <thead>
    <tr>
      <th style="width:64px">1Depth</th>
      <th style="width:78px">2Depth</th>
      <th style="width:104px">3Depth</th>
      <th style="width:150px">4Depth</th>
      <th>비고</th>
    </tr>
  </thead>
  <tbody>${rows(apps)}</tbody>
</table>`;

/* ── 세 갈래 ───────────────────────────────────────────────── */

/**
 * 기획 — 화면이 **왜 있고 무엇을 하기로 했는가**.
 *
 * 세부 기능 목록을 Front-End 와 겹쳐 싣는다. 겹치는 것이 낭비로 보이지만, 기획 단에서는
 * **무엇을 하기로 했는가**를 정하고 Front-End 단에서는 **그것이 화면에서 어떻게 도는가**를
 * 적는다. 앞의 것이 빠지면 구현이 기획을 앞질러도 알아챌 방법이 없다.
 */
const PLAN = tree((spec) => {
  const items: Item[] = [{ name: '화면 목적', note: spec.purpose }];
  if (spec.effect) items.push({ name: '기대 효과', note: spec.effect });
  items.push({ name: `세부 기능 정의 ${spec.actions.length}개`, note: spec.actions });
  if (spec.policy?.length) items.push({ name: '운영 정책', note: spec.policy });
  return items;
});

/**
 * 디자인 — 화면이 **무엇으로 이루어졌는가**. 영역 하나가 한 줄이다.
 *
 * 영역이 아직 안 적힌 화면도 한 줄은 세운다. 빈 배열을 그대로 두면 그 화면이 표에서 사라지고,
 * 범위 문서에서 화면이 사라지는 것은 곧 **범위가 줄어든 것**으로 읽힌다.
 */
const DESIGN = tree((spec) =>
  spec.areas?.length
    ? spec.areas.map((area) => ({
        name: area.area,
        note: area.when ? `${area.purpose} · 표시 조건: ${area.when}` : area.purpose,
      }))
    : [{ name: '화면 디자인', note: '구성 영역이 아직 명세에 적히지 않았습니다.' }],
);

/**
 * Front-End — 화면이 **무엇을 하는가**. 세부 기능 하나가 한 줄이다.
 *
 * 단추가 적힌 화면은 눌렀을 때 무엇이 일어나는지를 비고에 적는다. 기능 이름만으로는 성공과
 * 실패가 각각 어떻게 보이는지 알 수 없고, 그 둘이 인수 때 다투는 자리다.
 */
const FRONT = tree((spec) => {
  const byLabel = new Map((spec.buttons ?? []).map((one) => [one.label, one]));
  const items: Item[] = spec.actions.map((action) => {
    const button = [...byLabel.values()].find((one) => action.includes(one.label));
    if (!button) return { name: action, note: '' };
    const lines = [`누르면 ${button.onClick}`];
    if (button.onSuccess) lines.push(`성공 — ${button.onSuccess}`);
    if (button.onFail) lines.push(`실패 — ${button.onFail}`);
    return { name: action, note: lines };
  });
  if (spec.guards.length > 0) items.push({ name: '제약 · 예외 처리', note: spec.guards });
  if (spec.nonFunctional.length > 0) items.push({ name: '비기능 조건', note: spec.nonFunctional });
  return items;
});

/**
 * Back-End — 화면이 **어떤 값을 읽고 쓰는가**.
 *
 * 이 단계에는 서버가 없다. 그래서 `REST API 3개` 같은 줄을 적을 수 없고, 적으면 지어낸 수가
 * 된다. 대신 화면이 실제로 무엇을 필요로 하는지를 적는다 — 읽는 값의 원본, 그 값을 채우는
 * 콘솔 화면, 그리고 저장 전에 걸러야 하는 규칙.
 *
 * 서버를 붙이는 것은 범위 밖이지만, **붙일 때 무엇이 필요한지**는 여기 적힌 것이 그대로
 * 명세가 된다. 그러라고 싣는다.
 */
const BACK = tree((spec, data) => {
  const items: Item[] = [];
  if (data.length > 0) items.push({ name: '읽고 쓰는 값', note: data });
  if (spec.admin.length > 0) items.push({ name: '값을 채우는 화면', note: spec.admin });
  if (spec.validations?.length) items.push({ name: '저장 전 검증 규칙', note: spec.validations });
  if (spec.fields?.length) {
    items.push({
      name: `다루는 항목 ${spec.fields.length}개`,
      note: spec.fields.map((one) => `${one.name} · ${one.type}${one.rule ? ` · ${one.rule}` : ''}`),
    });
  }
  return items;
});

const countRows = (apps: AppNode[]): number =>
  apps.reduce(
    (sum, app) =>
      sum +
      app.groups.reduce(
        (inner, group) => inner + group.screens.reduce((last, screen) => last + screen.items.length, 0),
        0,
      ),
    0,
  );

/* ── 범위 밖 ───────────────────────────────────────────────── */

const OUT: [string, string, string][] = [
  ['BX', '로고 · BI 가이드 제작', '**BX 는 제공하지 않는 서비스입니다.** 로고는 원본 파일을 받아 그대로 씁니다 — 눈으로 보고 다시 그린 로고는 그 브랜드의 표장이 아닙니다.'],
  ['BX', '패키지 · 인쇄물 · 편집 디자인', 'BX 범위이므로 제공하지 않습니다. 본 과업은 웹 화면에 한정합니다.'],
  ['BX', 'SNS · 프로모션 콘텐츠 디자인', '같은 이유로 제공하지 않습니다.'],
  ['BX', '제품 · 모델 촬영 · 영상 제작', '메뉴 사진과 영상은 발주처가 제공합니다.'],
  ['기획', '경쟁사 분석 · 시장 조사', '발주처가 제공하는 브랜드 기준을 따릅니다.'],
  ['UI 디자인', '시안 파일 (PSD · AI)', '디자인은 실제로 동작하는 화면으로 인도합니다. 별도 시안 파일은 만들지 않습니다.'],
  ['Back-End', '서버 · 데이터베이스 구축', '본 단계에는 서버가 없습니다. 화면이 읽는 값은 공유 패키지 한 곳에 있습니다.'],
  ['Back-End', 'REST API 개발', '같은 이유로 없습니다. 필요한 값과 검증 규칙은 Back-End 표에 적어 두었습니다.'],
  ['Back-End', '회원 · 로그인 · 권한', '화면까지만 있고, 입력한 값은 어디로도 전송되지 않습니다.'],
  ['Back-End', '온라인 주문 · 결제', '주문은 전화와 매장 방문으로 받습니다.'],
  ['Back-End', '메일 · 문자 발송', '창업 문의는 값을 받는 양식까지 제공합니다.'],
  ['Back-End', '지도 · 예약 · POS 등 외부 연동', '포함하지 않습니다.'],
  ['운영', '서버 구성 · 배포 · 호스팅', '인수 시점의 산출물은 소스와 문서입니다.'],
  ['운영', '취약점 진단', '포함하지 않습니다.'],
];

const outRows = OUT.map(
  ([area, what, why]) =>
    `<tr><td class="d1">${esc(area)}</td><td class="d4">${esc(what)}</td><td class="memo">${note(why)}</td></tr>`,
).join('');

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
  /*
    인쇄를 먼저 생각한 판이다. 화면에서 예쁘게 보이는 것보다, A4 로 뽑았을 때 줄이 페이지
    사이에서 잘리지 않는 것이 중요하다.
  */
  @page { size: A4; margin: 14mm 12mm 16mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
    --d1: #f2f4f7;
    --d2: #f7f8fa;
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
    /* 한글은 낱말 한가운데서 끊긴다. 띄어쓰기 단위로만 끊게 한다. */
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

  .common { margin-bottom: 18px; }
  .common th { background: var(--band); text-align: center; font-weight: 700; font-size: 10pt; padding: 5px; }
  .common td { padding: 10px 14px; }
  .common ol { margin: 0; padding-left: 18px; color: var(--muted); }
  .common li { margin: 2px 0; }
  .common li strong { color: var(--ink); }

  h2.band {
    background: var(--band);
    border: 1px solid var(--line);
    border-bottom: none;
    text-align: center;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.3em;
    padding: 6px;
    margin: 22px 0 0;
    break-after: avoid;
  }
  p.lead {
    border: 1px solid var(--line);
    border-top: none;
    margin: 0;
    padding: 7px 12px;
    color: var(--muted);
    font-size: 9pt;
    break-after: avoid;
  }

  .depth thead th { background: var(--head); text-align: center; font-weight: 600; }
  .depth thead tr { break-inside: avoid; break-after: avoid; }
  .depth tbody tr { break-inside: avoid; }
  /* 화면이 바뀌는 자리에만 굵은 선. 앱 이름이 되풀이되므로 묶음의 경계는 선이 알려 준다. */
  .depth tbody tr.head > td { border-top: 1.4px solid #9aa1ad; }

  /*
    1·2·3Depth 는 rowspan 으로 묶여 여러 줄에 걸친다. 가운데 정렬해야 묶인 범위가 눈에 보인다.
    위로 붙이면 어디까지가 그 갈래인지 알 수 없다.
  */
  td.d1, td.d2, td.d3 { text-align: center; vertical-align: middle; }
  td.d1 { background: var(--d1); font-weight: 700; }
  td.d2 { background: var(--d2); font-weight: 600; }
  td.d3 { font-weight: 600; line-height: 1.4; }
  td.d3 .route {
    display: block;
    color: var(--faint);
    font-weight: 400;
    font-size: 8pt;
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    word-break: break-all;
  }
  td.d4 { font-weight: 500; }
  td.memo { color: var(--muted); font-size: 9pt; }
  td.memo ul { margin: 0; padding-left: 15px; }
  td.memo li { margin: 1px 0; }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }

  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">업무 범위 정의서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<table class="ident">
  <tr><th>대 상</th><td>F&amp;B 고객 사이트(<code>apps/fnb-client-a</code>) · 운영 콘솔(<code>apps/fnb-admin</code>)</td></tr>
  <tr><th>범위 기준</th><td>화면 <strong>${N.screens}개</strong> (고객 ${N.screenClient} · 콘솔 ${N.screenAdmin}) · 기능 <strong>${N.features}가지</strong> · 컴포넌트 ${N.compClient + N.compAdmin}개</td></tr>
  <tr><th>작성 근거</th><td>저장소의 화면 등록부 · IA 묶음 · 화면 명세 · 기능 레지스트리에서 생성 (<code>pnpm sow:build</code>)</td></tr>
</table>

<table class="common">
  <tr><th>공통사항</th></tr>
  <tr><td>
    <ol>
      <li>본 문서의 내용은 <strong>현재 구현된 것을 읽어 만든 값</strong>입니다. 예정이 아니라 저장소에서 기계로 뽑았습니다.</li>
      <li>표는 <strong>앱 → 갈래 → 화면 → 세부 항목</strong> 네 단으로 읽습니다. 같은 값이 이어지는 칸은 묶어 두었습니다.</li>
      <li>네 갈래가 보는 것이 다릅니다 — <strong>기획</strong>은 왜 있고 무엇을 하기로 했는가, <strong>UI 디자인</strong>은 무엇으로 이루어졌는가, <strong>Front-End</strong>는 화면에서 어떻게 도는가, <strong>Back-End</strong>는 어떤 값을 읽고 쓰는가.</li>
      <li><strong>BX(로고 · BI · 패키지 · 촬영 · SNS 콘텐츠)는 제공하지 않습니다.</strong> 자세한 것은 마지막 「범위 밖」 표에 있습니다.</li>
      <li>메뉴 사진과 문구 등 <strong>콘텐츠는 발주처가 제공</strong>합니다. 본 과업은 받은 값을 화면에 세우는 일까지입니다.</li>
      <li>본 단계에는 <strong>서버와 데이터베이스가 없습니다.</strong> 콘솔에서 고친 값은 브라우저 안에서만 유지되며, 양식에 입력한 값은 전송되지 않습니다.</li>
      <li>범위를 더하거나 빼는 일은 <strong>화면 등록부와 화면 명세를 고치는 것</strong>으로 시작하며, 본 문서와 기능 명세서가 함께 갱신됩니다.</li>
    </ol>
  </td></tr>
</table>

${table('기 획', '페이지마다 **왜 있는가**와 **무엇을 하기로 했는가**를 적습니다. 목적 · 기대 효과 · 세부 기능 정의 · 그 화면에서만 지키는 운영 정책입니다.', PLAN)}
${table('U I 디 자 인', '페이지마다 **무엇으로 이루어졌는가**를 적습니다. 구성 영역 하나가 한 줄이며, 언제 보이는지가 정해진 영역은 표시 조건을 함께 적었습니다. 네 너비(1280 · 1024 · 768 · 390) 반응형으로 만듭니다.', DESIGN)}
${table('F r o n t - E n d', '페이지마다 **세부 기능이 화면에서 어떻게 도는가**를 적습니다. 기능 하나가 한 줄이고, 단추가 있는 기능은 눌렀을 때 · 성공했을 때 · 실패했을 때를 함께 적었습니다.', FRONT)}
${table('B a c k - E n d', '페이지마다 **어떤 값을 읽고 쓰는가**를 적습니다. 본 단계에는 서버가 없어 값의 원본은 공유 패키지입니다. **서버를 붙이는 일은 범위 밖**이지만, 붙일 때 필요한 것이 여기 적힌 값 · 검증 규칙 · 항목입니다.', BACK)}

<h2 class="band">범 위 밖</h2>
<p class="lead">아래는 <strong>이번 과업에 포함하지 않습니다.</strong> 적어 두지 않으면 포함된 것으로 읽히기 때문에 따로 둡니다.</p>
<table class="depth">
  <thead>
    <tr><th style="width:64px">갈래</th><th style="width:200px">항목</th><th>사유 · 지금 상태</th></tr>
  </thead>
  <tbody>${outRows}</tbody>
</table>

</div>
</body>
</html>
`;

const out = 'FnB-업무범위정의서.html';
writeFileSync(out, html, 'utf8');
console.log(
  `${out} — 화면 ${N.screens} · 기획 ${countRows(PLAN)}줄 · UI 디자인 ${countRows(DESIGN)}줄 · Front-End ${countRows(FRONT)}줄 · Back-End ${countRows(BACK)}줄`,
);
