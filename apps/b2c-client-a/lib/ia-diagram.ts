// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { IA_GROUPS, ROOT, type IaGroup } from './ia-groups';

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

/** 갈래 하나 — 그 갈래의 화면과 값이 오는 곳까지 그린다. */
export function groupMap(group: IaGroup): string {
  const lines = [INIT, 'graph TB', `  ${box(ROOT.screen, ROOT.ko)}`, ''];

  lines.push(...subgraph(group));
  lines.push('');
  lines.push(`  ${node(ROOT.screen)} --> ${group.id}`);
  lines.push('');
  lines.push(...dataNodes(group));

  // 값은 그 갈래의 첫 화면이 대표로 받는다 — 화면마다 선을 그으면 원통에서 선이 부챗살로 퍼진다.
  const head = group.screens[0];
  if (head) {
    group.data.forEach((_, index) => {
      lines.push(`  ${group.id.toUpperCase()}_D${index} -.-> ${node(head.screen)}`);
    });
  }

  return lines.join('\n');
}
