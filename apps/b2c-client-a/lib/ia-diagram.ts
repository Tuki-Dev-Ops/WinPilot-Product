// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { CROSS_EDGES, IA_GROUPS, ROOT, groupOf, koOf, type IaGroup } from './ia-groups';

/**
 * IA 도면을 **만들어 낸다** — mermaid 를 손으로 적지 않는다.
 *
 * 손으로 적으면 화면을 하나 늘렸을 때 매니페스트·갈래·도면 세 곳을 고쳐야 하고, 셋 중 하나를
 * 빠뜨리면 도면만 조용히 옛것이 된다. 갈래(`ia-groups.ts`)에서 읽어 그리면 고칠 곳이 하나다.
 *
 * ## 그리는 규칙
 * - 선은 **직각(step)**. 곡선으로 두면 갈래가 많아질수록 어느 선이 어디로 가는지 못 따라간다.
 * - 값이 오는 곳은 **원통**(`[( )]`)으로 그린다 — 화면과 생김새가 달라야 한눈에 갈린다.
 * - 갈래를 넘는 이동은 긋지 않는다. 전부 그으면 도면이 그물이 되어 아무것도 읽히지 않는다.
 */
const INIT = `%%{init:{'flowchart':{'curve':'step','nodeSpacing':32,'rankSpacing':46},'theme':'neutral'}}%%`;

const routeOf = new Map(pages.map((page) => [page.id, page.route]));

/** mermaid 노드 이름 — 하이픈은 노드 구분자와 섞이므로 밑줄로 바꾼다. */
function node(screen: string): string {
  return screen.toUpperCase().replace(/-/g, '_');
}

function box(screen: string, ko: string): string {
  return `${node(screen)}["${ko}<br/>${routeOf.get(screen) ?? ''}"]`;
}

/** 값이 오는 곳. 이름에 괄호가 들어가므로 따옴표로 감싼다. */
function cylinder(id: string, label: string): string {
  return `${id}[("${label}")]`;
}

function dataNodes(group: IaGroup): string[] {
  return group.data.map((label, index) => `  ${cylinder(`${group.id.toUpperCase()}_D${index}`, label)}`);
}

function subgraph(group: IaGroup, indent = '  '): string[] {
  const lines = [`${indent}subgraph ${group.id}["${group.label}"]`, `${indent}  direction TB`];
  for (const screen of group.screens) lines.push(`${indent}  ${box(screen.screen, screen.ko)}`);
  for (const [from, to] of group.edges) lines.push(`${indent}  ${node(from)} --> ${node(to)}`);
  lines.push(`${indent}end`);
  return lines;
}

/** 전체 사이트맵 — 홈에서 갈래로만 잇는다. */
export function siteMap(): string {
  const lines = [INIT, 'graph TB', `  ${box(ROOT.screen, ROOT.ko)}`, ''];

  for (const group of IA_GROUPS) {
    lines.push(...subgraph(group));
    lines.push('');
  }

  for (const group of IA_GROUPS) lines.push(`  ${node(ROOT.screen)} --> ${group.id}`);

  return lines.join('\n');
}

/** 지금 보고 있는 화면임을 칠한다. 색만으로 알리지 않도록 테두리도 함께 굵힌다. */
function highlight(screen: string): string {
  return `  style ${node(screen)} fill:#e0e7ff,stroke:#4338ca,stroke-width:3px`;
}

/**
 * 화면 하나 — **그 화면이 속한 갈래 + 그 화면에 닿는 선만** 그린다.
 *
 * 갈래 도면을 그대로 두고 화면만 칠하지 않는 이유: 갈래 안의 이웃은 보이지만 갈래를 넘어
 * 들어오고 나가는 길이 빠진다. 상품 상세에서 결제로 바로 가는 길은 어느 갈래 도면에도 없어서,
 * 그 길을 모르는 사람은 장바구니를 반드시 거쳐야 하는 줄 안다.
 *
 * 반대로 그 선들을 전체 사이트맵에 다 그으면 도면이 그물이 된다. 한 화면씩 볼 때만 꺼내 그린다.
 */
export function screenMap(screen: string): string {
  const group = groupOf(screen);

  // 홈은 어느 갈래에도 들지 않는다 — 홈의 IA 는 곧 전체 도면이다.
  if (!group) return [siteMap(), highlight(screen)].join('\n');

  const lines = [INIT, 'graph TB', `  ${box(ROOT.screen, ROOT.ko)}`, ''];

  lines.push(...subgraph(group));
  lines.push('');
  lines.push(`  ${node(ROOT.screen)} --> ${group.id}`);
  lines.push('');

  /*
    갈래 밖의 화면은 상자만 세운다. 그쪽 갈래를 통째로 그리면 도면이 두 배가 되고,
    이 화면을 보러 온 사람이 옆 갈래의 구조를 다시 읽게 된다.
  */
  for (const edge of CROSS_EDGES) {
    if (edge.from !== screen && edge.to !== screen) continue;

    const other = edge.from === screen ? edge.to : edge.from;
    if (groupOf(other)?.id === group.id) continue;
    // 홈은 맨 위에 이미 서 있다. 다시 세우면 같은 상자가 두 번 그려진다.
    if (other !== ROOT.screen) lines.push(`  ${box(other, koOf(other))}`);
    lines.push(`  ${node(edge.from)} --> ${node(edge.to)}`);
  }

  lines.push('');
  lines.push(...dataNodes(group));
  // 갈래 도면과 달리 값은 **보고 있는 화면**이 받는다. 이 화면이 무엇을 읽는지가 물음이므로.
  group.data.forEach((_, index) => {
    lines.push(`  ${group.id.toUpperCase()}_D${index} -.-> ${node(screen)}`);
  });

  lines.push(highlight(screen));
  return lines.join('\n');
}

/** 이 화면으로 들어오는 길과 나가는 길 — 갈래 안의 선과 갈래를 넘는 선을 함께 본다. */
export function screenPaths(screen: string): { into: CrossLike[]; outOf: CrossLike[] } {
  const group = groupOf(screen);
  const inner = group?.edges ?? [];

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

export type CrossLike = { screen: string; how: string };
