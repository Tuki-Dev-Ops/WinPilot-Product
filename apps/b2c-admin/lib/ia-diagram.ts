// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { ADMIN_MENU } from './navigation/admin-menu';
import { CROSS_EDGES, IA_GROUPS, groupOf, koOf, labelOf, type IaGroup } from './ia-groups';

/**
 * IA 도면을 **만들어 낸다** — mermaid 를 손으로 적지 않는다.
 *
 * 손으로 적으면 화면을 하나 늘렸을 때 매니페스트·메뉴·도면 세 곳을 고쳐야 하고, 셋 중 하나를
 * 빠뜨리면 도면만 조용히 옛것이 된다. 메뉴(`admin-menu.ts`)와 갈래(`ia-groups.ts`)에서 읽어
 * 그리면 고칠 곳이 하나다.
 *
 * ## 그리는 규칙 (고객 화면 문서와 같은 결)
 * - 선은 **직각(step)**. 곡선으로 두면 갈래가 많아질수록 어느 선이 어디로 가는지 못 따라간다.
 * - 값이 오는 곳은 **원통**(`[( )]`)으로 그린다 — 화면과 생김새가 달라야 한눈에 갈린다.
 * - 갈래를 넘는 이동은 사이드바 도면에 긋지 않는다. 전부 그으면 도면이 그물이 된다.
 *
 * ## 고객 화면 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객 화면에 나타나지 않는다.
 */
const INIT = `%%{init:{'flowchart':{'curve':'step','nodeSpacing':32,'rankSpacing':46},'theme':'neutral'}}%%`;

const routeOf = new Map(pages.map((page) => [page.id, page.route]));

/** mermaid 노드 이름 — 하이픈은 노드 구분자와 섞이므로 밑줄로 바꾼다. */
function node(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

function box(screen: string, ko: string): string {
  return `${node(screen)}["${ko}<br/>${routeOf.get(screen) ?? ''}"]`;
}

/** 값이 오는 곳. 이름에 괄호가 들어가므로 따옴표로 감싼다. */
function cylinder(id: string, label: string): string {
  return `${id}[("${label}")]`;
}

function dataNodes(group: IaGroup): string[] {
  return group.data.map((label, index) => `  ${cylinder(`${node(group.id)}_D${index}`, label)}`);
}

function subgraph(group: IaGroup, indent = '  '): string[] {
  const lines = [`${indent}subgraph ${group.id}["${labelOf(group)}"]`, `${indent}  direction TB`];
  for (const screen of group.screens) lines.push(`${indent}  ${box(screen.screen, screen.ko)}`);
  for (const [from, to] of group.edges) lines.push(`${indent}  ${node(from)} --> ${node(to)}`);
  lines.push(`${indent}end`);
  return lines;
}

/**
 * 사이드바 전체 — **최상위만** 잇는다.
 *
 * 세부까지 그리면 도면이 화면보다 커진다. 사이드바가 최상위만 노출하는 것과 같은 이유이고,
 * 세부는 화면 하나를 볼 때(`screenMap`) 그 갈래만 펼쳐 보여 준다.
 */
export function siteMap(): string {
  const lines = [INIT, 'graph TB', '  ADMIN["B2C Admin"]', ''];

  for (const group of IA_GROUPS) {
    const href = ADMIN_MENU.find((section) => section.id === group.id)?.href;
    // 사이드바에 없는 갈래는 대신 화면 수를 적는다 — 주소가 하나로 정해지지 않기 때문이다.
    const under = href ?? `${group.screens.length}개 화면`;
    lines.push(`  ${node(group.id)}["${labelOf(group)}<br/>${under}"]`);
    lines.push(`  ADMIN --> ${node(group.id)}`);
  }

  lines.push('');
  lines.push(`  ${cylinder('STORE', '@winpilot/store · 고객 화면과 함께 쓰는 시드')}`);
  lines.push('  STORE -.-> ADMIN');
  return lines.join('\n');
}

/** 지금 보고 있는 화면임을 칠한다. 색만으로 알리지 않도록 테두리도 함께 굵힌다. */
function highlight(screen: string): string {
  return `  style ${node(screen)} fill:#e0e7ff,stroke:#4338ca,stroke-width:3px`;
}

/**
 * 화면 하나 — **그 화면이 속한 갈래 + 그 화면에 닿는 선만** 그린다.
 *
 * 사이드바 도면을 그대로 두고 화면만 칠하지 않는 이유: 최상위만 있는 도면에서는 목록과 등록·상세의
 * 관계가 보이지 않는다. 등록 화면이 메뉴에 없다는 것을 모르면 목록에서 들어가는 길을 못 찾고
 * 같은 화면을 새로 만들려 든다.
 */
export function screenMap(screen: string): string {
  const group = groupOf(screen);
  if (!group) return [siteMap(), highlight(screen)].join('\n');

  const lines = [INIT, 'graph TB', '  ADMIN["B2C Admin"]', ''];

  lines.push(...subgraph(group));
  lines.push('');
  lines.push(`  ADMIN --> ${group.id}`);
  lines.push('');

  /*
    갈래 밖의 화면은 상자만 세운다. 그쪽 갈래를 통째로 그리면 도면이 두 배가 되고,
    이 화면을 보러 온 사람이 옆 갈래의 구조를 다시 읽게 된다.
  */
  for (const edge of CROSS_EDGES) {
    if (edge.from !== screen && edge.to !== screen) continue;

    const other = edge.from === screen ? edge.to : edge.from;
    if (groupOf(other)?.id === group.id) continue;
    lines.push(`  ${box(other, koOf(other))}`);
    lines.push(`  ${node(edge.from)} --> ${node(edge.to)}`);
  }

  lines.push('');
  lines.push(...dataNodes(group));
  // 값은 **보고 있는 화면**이 받는다. 이 화면이 무엇을 읽고 쓰는지가 물음이므로.
  group.data.forEach((_, index) => {
    lines.push(`  ${node(group.id)}_D${index} -.-> ${node(screen)}`);
  });

  lines.push(highlight(screen));
  return lines.join('\n');
}

export type CrossLike = { screen: string; how: string };

/** 이 화면으로 들어오는 길과 나가는 길 — 갈래 안의 선과 갈래를 넘는 선을 함께 본다. */
export function screenPaths(screen: string): { into: CrossLike[]; outOf: CrossLike[] } {
  const inner = groupOf(screen)?.edges ?? [];

  const into: CrossLike[] = [
    ...inner.filter(([, to]) => to === screen).map(([from]) => ({ screen: from, how: '같은 갈래 안에서' })),
    ...CROSS_EDGES.filter((edge) => edge.to === screen).map((edge) => ({ screen: edge.from, how: edge.how })),
  ];

  const outOf: CrossLike[] = [
    ...inner.filter(([from]) => from === screen).map(([, to]) => ({ screen: to, how: '같은 갈래 안에서' })),
    ...CROSS_EDGES.filter((edge) => edge.from === screen).map((edge) => ({ screen: edge.to, how: edge.how })),
  ];

  return { into, outOf };
}
