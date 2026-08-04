import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 기획 명세(FSD)를 **만들어 낸다** — 여덟 절짜리 문서를 화면 수만큼 손으로 적지 않는다.
 *
 * 손으로 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고, 훑지 않으면 문서만 옛것이 된다.
 * 원본은 앱의 `lib/screen-specs.ts` 하나이고 이 생성기가 절을 펼친다.
 *
 * **적지 않은 절은 비워 두지 않고 `N/A` 로 적는다.** 빈 절과 "해당 없음" 은 다른 말인데
 * 읽는 사람은 그 둘을 구분할 수 없다 — 빈 절은 "아직 안 정했다" 로도 읽힌다.
 *
 * 서버·DB·권한·로그는 적지 않는다. 이 문서는 기획자가 읽는 것이고, 이 프로젝트에는
 * 애초에 서버가 없다(프론트엔드 전용).
 */
export type SpecArea = { area: string; purpose: string; when?: string };
export type SpecField = {
  name: string;
  desc: string;
  type: string;
  required?: boolean;
  rule?: string;
  example?: string;
};
export type SpecButton = { label: string; onClick: string; onSuccess?: string; onFail?: string };

export type ScreenSpecLike = {
  screen: string;
  purpose: string;
  effect?: string;
  actions: string[];
  guards: string[];
  admin: string[];
  nonFunctional: string[];
  areas?: SpecArea[];
  fields?: SpecField[];
  buttons?: SpecButton[];
  validations?: string[];
  policy?: string[];
  future?: string[];
};

export type PageLike = { id: string; name: string; route: string; sampleUrl?: string; order: number };

export type FsdApp = {
  /** 레포 기준 앱 폴더 */
  dir: string;
  /** 문서 머리에 적히는 앱 이름 */
  label: string;
  pages: PageLike[];
  specs: ScreenSpecLike[];
  common: string[];
  /** 화면 id → 메뉴 위치 (`고객지원 > 공지사항`) */
  menuOf: (screen: string) => string;
  /**
   * §2 의 연동 절 이름과 한 줄 설명.
   *
   * 앱마다 방향이 반대다 — 고객 화면은 **값을 받아 오고**, 어드민은 **값을 내보낸다.**
   * 같은 말로 적으면 어느 쪽이 원본인지 문서만 보고는 알 수 없다.
   */
  sourceLabel: string;
  sourceNote: string;
  /** 연동이 없을 때 적는 말 */
  sourceEmpty: string;
};

const NA = '_N/A — 이 화면에는 해당되지 않습니다._';

function table(head: string[], rows: string[][], empty: string): string {
  if (rows.length === 0) return `_${empty}_\n`;
  return [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n') + '\n';
}

function bullets(items: string[], empty = NA): string {
  if (items.length === 0) return `${empty}\n`;
  return items.map((item) => `- ${item}`).join('\n') + '\n';
}

const yes = (value?: boolean) => (value ? '필수' : '선택');
const dash = (value?: string) => (value && value.length > 0 ? value : '—');

/**
 * 화면 하나의 명세 — **여덟 절**.
 *
 * 절 순서는 읽는 순서다: 무엇인가(명칭) → 어떻게 생겼나(뷰) → 무엇을 하나(명세·버튼) →
 * 어떻게 쓰이나(시나리오) → 어긋나면(예외·검증) → 어떤 모습들이 있나(상태).
 *
 * **두 번째가 그림인 이유**: 글로 적힌 영역 목록보다 캡처 한 장이 빠르다. 아래 절을 읽는
 * 내내 "그 화면이 어떻게 생겼더라" 를 떠올리지 않아도 되게 맨 앞에 둔다.
 */
export function fsdDoc(app: FsdApp, page: PageLike, spec: ScreenSpecLike): string {
  // 캡처를 아직 뜨지 않았을 수 있다. 없는 그림을 걸면 깨진 자리만 남는다.
  const hasShot = existsSync(join(app.dir, 'public', 'page-view', spec.screen, `${spec.screen}-desktop.jpg`));

  const view = hasShot
    ? `![${page.name} 데스크톱](/page-view/${spec.screen}/${spec.screen}-desktop.jpg)

세 너비(데스크톱·태블릿·모바일)와 예외 화면은 \`${app.dir}/docs/page-view/${spec.screen}/\` 에서 본다.`
    : `_캡처가 아직 없습니다 — \`pnpm docs:capture\` 로 뜹니다._`;

  return `# ${page.name}

> ${app.label} · \`${page.route}\` · id \`${spec.screen}\`
> 원본: \`${app.dir}/lib/screen-specs.ts\` · 생성: \`pnpm docs:build\`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 1. 기능 명칭

| 항목 | 내용 |
|---|---|
| 화면명 | ${page.name} |
| 메뉴 위치 | ${app.menuOf(spec.screen)} |
| URL | \`${page.route}\`${page.sampleUrl ? ` · 예 \`${page.sampleUrl}\`` : ''} |
| 화면 목적 | ${spec.purpose} |
| 기대 효과 | ${spec.effect ?? '이 화면이 없으면 위 목적을 다른 화면이 대신 떠안게 되고, 그 화면은 하는 일이 둘이 된다.'} |
| ${app.sourceLabel} | ${spec.admin.length > 0 ? spec.admin.join(' · ') : app.sourceEmpty} |
| Figma 페이지 순번 | ${page.order} |

${app.sourceNote}

## 2. 기능 뷰

${view}

### 화면 구성

${table(
    ['영역', '용도', '표시 조건'],
    (spec.areas ?? []).map((area) => [area.area, area.purpose, dash(area.when)]),
    '영역 구분이 따로 없는 한 덩어리 화면입니다.',
  )}
## 3. 기능 명세

${table(
    ['기능', '사용자 동작', '시스템 동작'],
    spec.actions.map((action) => [
      action,
      '해당 요소를 누르거나 값을 넣는다',
      '조건을 확인하고 결과를 화면에 반영한다',
    ]),
    '읽기만 하는 화면입니다.',
  )}
### 데이터 항목

${table(
    ['항목', '설명', '입력 형태', '필수', '형식·제한', '예시'],
    (spec.fields ?? []).map((field) => [
      field.name,
      field.desc,
      field.type,
      yes(field.required),
      dash(field.rule),
      dash(field.example),
    ]),
    '입력 항목이 없는 읽기 전용 화면입니다.',
  )}
## 4. 버튼 및 이벤트

${table(
    ['버튼', '눌렀을 때', '성공', '실패'],
    (spec.buttons ?? []).map((button) => [
      button.label,
      button.onClick,
      dash(button.onSuccess),
      dash(button.onFail),
    ]),
    '누르는 요소가 링크뿐입니다 — 누르면 해당 주소로 이동합니다.',
  )}
## 5. 사용자 시나리오

### 정상

${bullets(
    spec.actions.map((action) => `${action} → 결과가 화면에 바로 반영된다.`),
    '_화면을 열어 읽는다._',
  )}
### 인수 조건

${bullets(
    spec.actions.map(
      (action) => `**Given** 이 화면을 열었을 때 **When** ${action} **Then** 그 결과가 화면에 반영된다.`,
    ),
    `_읽기 전용 화면이라 동작 기준 대신 표시 기준을 본다 — \`${app.dir}/docs/NFS/\` 를 따른다._`,
  )}
## 6. 예외처리

${table(
    ['발생 조건', '사용자 안내', '화면 처리'],
    spec.guards.map((guard) => [
      guard,
      '무엇이 왜 막혔는지 그 자리에서 알린다',
      '입력값과 스크롤 자리를 지킨 채 안내만 더한다',
    ]),
    '예외로 갈리는 조건이 없습니다.',
  )}
## 7. 검증 규칙

${bullets(spec.validations ?? [], NA)}
### 화면 정책

${bullets(spec.policy ?? [], NA)}
## 8. 화면 상태

| 상태 | 화면 |
|---|---|
| 최초 | 값이 오기 전의 자리(뼈대)를 그려 둔다 — 자리를 비우면 화면이 튄다 |
| 불러온 뒤 | 정상 화면 |
| 비어 있음 | 목록 자리를 비우지 않고 왜 비었는지 한 줄로 알린다 |
| 오류 | 같은 자리에 안내와 다시 시도할 길을 둔다 |

### UX 정책

- 조건을 채우지 못한 단추는 **잠근다.** 눌러 놓고 다음 화면에서 막으면 무엇이 잘못됐는지 늦게 안다.
- 알림은 화면 하단 정중앙 토스트 한 곳에서만 띄운다.
- 되돌릴 수 없는 일(삭제·취소)은 확인을 한 번 묻는다.
- 키보드만으로 모든 요소에 닿을 수 있고, 포커스가 어디 있는지 눈에 보인다.
- ESC 로 열린 것(모달·서랍)을 닫는다.

### 향후 확장

${bullets(spec.future ?? [], NA)}
## 관련 문서

- [화면 캡처](/docs/page-view/${spec.screen}) · [비기능 명세](/docs/nfs) · [IA](/docs/ia)
`;
}

/** 목차 — 어느 화면의 명세가 있고 어디가 비었는지 한 장에서 본다. */
export function overviewDoc(app: FsdApp, missing: string[]): string {
  return `# 기능 명세서 — ${app.label}

> 원본: \`${app.dir}/lib/screen-specs.ts\` · 생성: \`pnpm docs:build\`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

${table(
  ['순번', '화면', '경로', '명세'],
  app.pages.map((page) => [
    String(page.order),
    page.name,
    `\`${page.route}\``,
    app.specs.some((spec) => spec.screen === page.id) ? `[열기](/docs/fsd/${page.id})` : '**없음**',
  ]),
  '등록된 화면이 없습니다.',
)}
## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
${missing.length > 0 ? `- 매니페스트에는 있으나 명세가 아직 없는 화면: ${missing.map((id) => `\`${id}\``).join(', ')}` : '- 매니페스트의 모든 화면에 명세가 있다.'}
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
`;
}

/** `docs/FSD` 를 통째로 다시 만든다. */
export function buildFsd(app: FsdApp): { written: number; missing: string[] } {
  const dir = join(app.dir, 'docs', 'FSD');
  // 지운 화면의 명세가 남아 있으면 없는 화면의 문서를 읽게 된다.
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const missing: string[] = [];
  let written = 0;

  for (const page of app.pages) {
    const spec = app.specs.find((item) => item.screen === page.id);
    if (!spec) {
      missing.push(page.id);
      continue;
    }
    /*
      화면 하나가 폴더 하나다. 명세 한 장으로 끝나지 않는 화면이 생기면(흐름도·조사 기록)
      그때 옆에 넣으면 되고, 파일로 늘어놓으면 그 순간 이름 규칙을 새로 만들어야 한다.
    */
    mkdirSync(join(dir, page.id), { recursive: true });
    writeFileSync(join(dir, page.id, `${page.id}.fsd.md`), fsdDoc(app, page, spec), 'utf8');
    written += 1;
  }

  mkdirSync(join(dir, '00-overview'), { recursive: true });
  writeFileSync(join(dir, '00-overview', '00-overview.fsd.md'), overviewDoc(app, missing), 'utf8');
  return { written, missing };
}
