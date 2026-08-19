import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES, VIEW_META, type ViewId } from '@winpilot/spec';

/**
 * 프로젝트 전체 범위 — **RFP 에 넣는 그 표**를 코드에서 뽑는다.
 *
 * ## 왜 손으로 안 쓰나
 * 이 글의 알맹이는 **숫자**다 — 앱이 몇 벌이고 화면이 몇 개이며 기능이 몇 가지인가. 손으로
 * 적으면 화면 하나가 늘거나 줄 때마다 두 곳을 고쳐야 하고, 실제로는 한쪽만 고친다.
 *
 * 방금도 그 일이 있었다. IR 사이트에서 화면 열하나를 지웠는데, 그 수가 적힌 자리가 문서
 * 여러 곳이었다면 어디는 서른이고 어디는 열아홉으로 남았을 것이다.
 *
 * 그래서 매니페스트(화면)와 레지스트리(기능)에서 세어 만든다. `pnpm docs:build` 를 돌리면
 * 숫자가 저절로 맞는다.
 *
 * ## 일곱 앱이 같은 글을 받는다
 * 범위는 저장소 전체에 대한 것이라 앱마다 달라질 이유가 없다. 앱마다 다른 것은 **자기가 그
 * 표의 어느 줄인가**뿐이라, 그 줄만 굵게 표시한다.
 */

type Target = { dir: string; label: string; view: ViewId; pages: readonly unknown[] };

/** 무엇을 만들지 않는가 — 범위 문서에서 **가장 많이 묻는 것**이라 표 다음에 바로 둔다. */
const OUT_OF_SCOPE = [
  ['서버 · API', '두지 않았습니다. 값은 `packages/store` 한 곳에 있고, 콘솔과 사이트가 그것을 함께 읽습니다.'],
  ['데이터베이스', '같은 이유로 두지 않았습니다. 서버가 붙더라도 바뀌는 것은 store 가 값을 어디서 받아 오는가뿐입니다.'],
  ['로그인 · 권한', '화면까지만 있습니다. 입력한 값은 어디로도 전송되지 않습니다.'],
  ['결제', '화면까지만 있습니다. PG 연동은 사내 콘솔의 설정 화면으로만 존재합니다.'],
  ['메일 · 알림 발송', '없습니다. 문의와 구독은 값을 받는 양식까지 만들었습니다.'],
  ['배포 · 운영', '아직입니다. 지금은 개발 서버로 띄워 확인하는 단계입니다.'],
];

/** 무엇을 함께 내는가. 코드 밖의 산출물이라 여기 적어 둔다. */
const DELIVERABLES = [
  ['화면', '실제로 동작하는 Next 애플리케이션 일곱 벌'],
  ['기능 명세서 (FSD)', '화면 하나가 문서 한 장입니다. `lib/screen-specs.ts` 에서 생성합니다'],
  ['비기능 명세서 (NFS)', '특정 화면에 매이지 않고 전체에 걸리는 정책'],
  ['IA · 흐름도', '사이트맵 한 장과 영역별 도면, 그리고 화면마다의 흐름'],
  ['화면 사진', '앱마다 모든 화면을 한 장씩 (`/docs/pages`)'],
  ['디자인 토큰', '색과 글자, 간격을 담은 한 벌 (`packages/tokens`)'],
  ['검사', '어긋남의 종류마다 하나씩, 모두 여섯 가지'],
];

const CHECKS = [
  ['`spec:check`', '이름과 주소, 매니페스트가 레지스트리와 맞는지'],
  ['`sync:check`', '레지스트리에 적힌 컴포넌트 이름이 실제 파일에도 그대로인지'],
  ['`docs:check`', '화면은 있는데 문서가 비어 있는 자리가 있는지'],
  ['`bind:check`', '화면이 적어 둔 값의 출처가 아직 남아 있는지'],
  ['`overflow:check`', '네 가지 너비에서 가로로 넘치는 곳이 있는지'],
  ['`weight:check`', '화면 하나가 실제로 몇 바이트를 내려받는지'],
];

const table = (head: string[], rows: string[][]): string =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join(
    '\n',
  );

/** 그 뷰에 실제로 걸린 기능 수. 한 기능이 두 뷰에 걸리면 양쪽에서 센다 — 만드는 일이 둘이라서다. */
function featureCount(view: ViewId): number {
  return FEATURES.filter((one) => view in one.views).length;
}

export function buildScope(targets: Target[]): number {
  const rows = targets.map((one) => [
    VIEW_META[one.view].pairGroup ?? '—',
    one.label,
    `\`${one.dir.replace('apps/', '')}\``,
    String(VIEW_META[one.view].port),
    String(one.pages.length),
    String(featureCount(one.view)),
  ]);

  const screens = targets.reduce((sum, one) => sum + one.pages.length, 0);

  for (const target of targets) {
    const mine = rows.map((row) => (row[1] === target.label ? row.map((cell) => `**${cell}**`) : row));

    const doc = `# 프로젝트 전체 범위

> 이 문서는 \`pnpm docs:build\` 가 매니페스트와 기능 레지스트리에서 세어 만든 것입니다.
> 고칠 곳은 화면과 등록이며, 이 파일을 직접 손대면 다음 실행 때 지워집니다.
> 표에서 굵게 표시된 줄이 지금 보고 계신 앱입니다.

## 1. 만드는 것

앱 **${targets.length}벌**, 화면 **${screens}개**, 기능 **${FEATURES.length}가지**입니다.

${table(['갈래', '앱', '폴더', '포트', '화면', '기능'], mine)}

세 업종은 각각 별개의 템플릿이고, 업종마다 고객 화면과 그것을 고치는 운영 콘솔이 한 쌍을
이룹니다. 사내 콘솔만 짝이 없는데, 고객사와 구독 현황을 들여다보는 곳이라 대응하는 고객
화면이 없기 때문입니다.

폴더 이름 끝의 \`-a\` 는 템플릿 A 를 뜻합니다. 같은 업종을 다른 배치로 한 벌 더 만들 수
있도록 이름에 자리를 열어 둔 것이고, 지금은 업종마다 한 벌씩 있습니다.

기능 수를 앱마다 따로 세는 데에는 이유가 있습니다. 하나의 기능이 고객 화면과 운영 콘솔
양쪽에 걸리면 실제로 만들어야 할 화면은 둘이기 때문입니다. 그래서 앱별 합계
(${targets.reduce((sum, one) => sum + featureCount(one.view), 0)})는 기능 가짓수(${FEATURES.length})보다 큽니다.

## 2. 만들지 않는 것

${table(['항목', '지금 상태'], OUT_OF_SCOPE)}

범위를 이야기할 때 가장 자주 나오는 질문이라 표 바로 다음에 두었습니다. 적어 두지 않으면
있는 것으로 읽히기 때문입니다.

## 3. 함께 드리는 것

${table(['산출물', '내용'], DELIVERABLES)}

문서는 따로 배포하지 않습니다. 애플리케이션 안의 실제 주소(\`/docs/**\`)로 두는 것은, 화면과
문서가 같은 저장소에서 함께 바뀌어야 서로 어긋나지 않기 때문입니다.

## 4. 어긋남을 무엇으로 막는가

${table(['검사', '무엇을 보는가'], CHECKS)}

하나가 나머지를 대신하지는 못합니다. 실제로 운영 콘솔에서 화면 열 개를 지웠을 때 고객 화면
열일곱 곳이 이미 없어진 메뉴를 계속 가리키고 있었는데, 그 시점에 나머지 검사는 모두 통과
상태였습니다.

## 5. 화면 하나하나

이 문서는 전체 범위를 다룹니다. 화면 하나가 왜 있고 그전에는 무엇이 불편했는지는 기능
명세서(FSD)가 화면마다 한 장씩 담고 있으며, 목적과 배경 두 줄이 그 1절에 있습니다.
`;

    const out = join(target.dir, 'docs');
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'scope.md'), doc, 'utf8');
  }

  return targets.length;
}
