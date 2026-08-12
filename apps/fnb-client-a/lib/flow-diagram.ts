import type { FlowBody } from './flow-specs';

/**
 * 흐름도를 **만들어 낸다** — mermaid 를 손으로 적지 않는다.
 *
 * 손으로 적으면 화면이 바뀌었을 때 화면·명세·도면 세 곳을 고쳐야 하고, 셋 중 하나를 빠뜨리면
 * 도면만 조용히 옛것이 된다. 원본(`lib/flow-specs.ts`)에서 읽어 그리면 고칠 곳이 하나다.
 *
 * ## 그리는 규칙 (IA 도면과 같은 결)
 * - 선은 **직각(step)**. 곡선으로 두면 갈래가 많아질수록 어느 선이 어디로 가는지 못 따라간다.
 * - **실선은 정상, 점선은 예외.** 눈으로 한 번에 갈려야 정상 경로만 훑는 읽기가 된다.
 * - **마름모는 갈림길**, **원통은 값이 오는 곳.** 생김새가 달라야 한눈에 갈린다.
 * - 간선 라벨에는 따옴표를 두지 않는다 — `-->|예|` 는 그려지고 `-->|"예"|` 는 깨진다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
const INIT = `%%{init:{'flowchart':{'curve':'step','nodeSpacing':32,'rankSpacing':46},'theme':'neutral'}}%%`;

/**
 * 노드 글에서 도면을 깨뜨리는 글자를 걷어 낸다.
 *
 * 큰따옴표는 노드 이름을 감싸는 글자이고 파이프는 간선 라벨을 가르는 글자다. 원본에 섞여
 * 들어오면 그 도면 하나가 통째로 그려지지 않는데, 화면에서는 "도면을 그리지 못했습니다" 한 줄만
 * 남아 어느 글자 때문인지 알 수 없다. 원본을 고치기 전에 여기서 먼저 막는다.
 */
function text(value: string): string {
  return value.replace(/["|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function edge(from: string, to: string, label = ''): string {
  return label ? `  ${from} -->|${text(label)}| ${to}` : `  ${from} --> ${to}`;
}

/** 예외는 점선이다 — 정상 경로만 훑어 읽을 수 있어야 한다. */
function dashed(from: string, to: string, label = ''): string {
  return label ? `  ${from} -.->|${text(label)}| ${to}` : `  ${from} -.-> ${to}`;
}

/**
 * 흐름 하나를 도면으로.
 *
 * `head` 는 도면의 머리 상자다 — 화면별 흐름이면 화면 이름, 여정이면 여정 이름이 온다.
 * 두 가지를 한 함수로 그리는 이유: 모양 규칙이 갈리면 같은 점선이 화면에서는 예외, 여정에서는
 * 다른 뜻으로 읽힌다.
 */
export function flowChart(head: string, body: FlowBody): string {
  const lines = [INIT, 'graph TB', `  HEAD["${text(head)}"]`, ''];

  body.entries.forEach((entry, index) => {
    lines.push(`  IN${index}["${text(entry)}"]`);
    lines.push(edge(`IN${index}`, 'HEAD'));
  });
  if (body.entries.length > 0) lines.push('');

  /*
    단계는 한 줄로 잇고, 갈림길은 그 단계 **뒤**에 끼워 넣는다. 갈림길을 따로 떼어 그리면
    어느 단계에서 갈리는지가 도면에 남지 않아 원본을 다시 읽어야 한다.
  */
  let prev = 'HEAD';
  let pass = '';

  body.steps.forEach((step, index) => {
    lines.push(`  S${index}["${text(step)}"]`);
    lines.push(edge(prev, `S${index}`, pass));
    prev = `S${index}`;
    pass = '';

    const branch = body.branches.find((item) => item.after === index);
    if (!branch) return;

    lines.push(`  B${index}{"${text(branch.question)}"}`);
    lines.push(edge(prev, `B${index}`));
    lines.push(`  B${index}X["${text(branch.block)}"]`);
    lines.push(dashed(`B${index}`, `B${index}X`, branch.blockLabel ?? '아니오'));

    prev = `B${index}`;
    pass = branch.pass ?? '예';
  });

  if (body.steps.length > 0) lines.push('');

  body.exits.forEach((exit, index) => {
    lines.push(`  OUT${index}["${text(exit)}"]`);
    lines.push(edge(prev, `OUT${index}`, pass));
  });

  // 예외는 그 예외가 생기는 단계에 붙인다. 붙일 단계가 없으면 화면 자체에 붙인다.
  body.exceptions.forEach((exception, index) => {
    const from = exception.at < body.steps.length ? `S${exception.at}` : 'HEAD';
    lines.push(`  X${index}["${text(exception.label)}"]`);
    lines.push(dashed(from, `X${index}`));
  });

  body.data.forEach((source, index) => {
    lines.push(`  D${index}[("${text(source)}")]`);
    lines.push(dashed(`D${index}`, 'HEAD'));
  });

  return lines.join('\n');
}
