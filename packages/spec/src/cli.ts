import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FEATURES } from './features';
import { cid, expectedComponentName, figmaFrameName, i18nKey, testId } from './naming';
import { VIEWS, VIEW_META, type Issue, type ViewId } from './types';
import { validateSpec, type ManifestEntry } from './validate';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

type ManifestModule = {
  pages?: ManifestEntry[];
  devOnlyRoutes?: string[];
};

async function loadManifest(view: ViewId): Promise<{ manifest: ManifestEntry[]; devOnlyRoutes: string[] }> {
  const path = resolve(REPO_ROOT, `apps/${VIEW_META[view].app}/pages.manifest.ts`);
  try {
    const module = (await import(pathToFileURL(path).href)) as ManifestModule;
    return { manifest: module.pages ?? [], devOnlyRoutes: module.devOnlyRoutes ?? [] };
  } catch {
    console.warn(`[spec] ${view}: 매니페스트를 읽지 못했습니다 (${path})`);
    return { manifest: [], devOnlyRoutes: [] };
  }
}

function printMatrix(): void {
  console.log('기능 ↔ 뷰 매핑');
  console.log('');
  for (const feature of FEATURES) {
    console.log(`  ${feature.id}  —  ${feature.label.ko} / ${feature.label.en}`);
    for (const view of VIEWS) {
      const binding = feature.views[view];
      if (!binding) {
        console.log(`    ${view.padEnd(12)} (없음)`);
        continue;
      }
      const mark = binding.status === 'implemented' ? '●' : '○';
      console.log(`    ${view.padEnd(12)} ${mark} ${binding.route}   [${VIEW_META[view].app}]`);
      console.log(`                 component  ${binding.component}  (기대: ${expectedComponentName(view, feature)})`);
      console.log(`                 cid        ${cid(view, feature.id)}`);
      console.log(`                 i18n       ${i18nKey(feature.id)}`);
      console.log(`                 testid     ${testId(view, feature.id)}`);
      console.log(`                 figma      ${figmaFrameName(view, feature)}`);
    }
    console.log('');
  }
}

function printIssues(issues: Issue[]): void {
  for (const issue of [...issues].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1))) {
    const tag = issue.severity === 'error' ? 'ERROR' : 'WARN ';
    console.log(`  ${tag} [${issue.code}] ${issue.where}\n         ${issue.message}`);
  }
}

async function main(): Promise<void> {
  if (process.argv.includes('--matrix')) printMatrix();

  console.log(`기능 ${FEATURES.length}개 · 뷰 ${VIEWS.length}개`);
  console.log('');

  let errors = 0;
  let warnings = 0;
  /*
    기능 자체에 대한 검사(이름·용어 등)는 뷰와 무관해 앱마다 똑같이 나온다. 한 번만 보고한다.

    ## 열쇠에 뷰를 넣는 이유
    한때 열쇠가 `code|where|message` 였다. 그런데 `MANIFEST_ORPHAN` 의 `where` 는
    `manifest 'home'` 처럼 **매니페스트 안에서만 고유한 값**이라, 앱이 넷 늘자 `ir-client` 의
    `home` 이 `fnb-client` 의 같은 이름을 가렸다 — 열네 건이 아홉 건으로 보였다.

    그 상태가 나쁜 것은 숫자가 틀려서가 아니라, **가려진 쪽을 고쳐도 숫자가 안 줄어서**다.
    고치는 사람이 자기가 헛짚었다고 여긴다.
  */
  const reported = new Set<string>();

  // 뷰(=레포)마다 자기 매니페스트로 따로 검사한다.
  for (const view of VIEWS) {
    const { manifest, devOnlyRoutes } = await loadManifest(view);
    const issues = validateSpec({ features: FEATURES, manifest, view, devOnlyRoutes }).filter((issue) => {
      // 뷰가 자기 매니페스트를 두고 내는 소리는 뷰마다 따로 센다. 나머지는 한 번만 알린다.
      const perView = issue.code === 'MANIFEST_ORPHAN' || issue.code === 'MANIFEST_MISSING';
      const key = `${perView ? view : ''}|${issue.code}|${issue.where}|${issue.message}`;
      if (reported.has(key)) return false;
      reported.add(key);
      return true;
    });
    const viewErrors = issues.filter((issue) => issue.severity === 'error').length;
    const viewWarnings = issues.length - viewErrors;
    errors += viewErrors;
    warnings += viewWarnings;

    console.log(
      `[${VIEW_META[view].app}] 등록 페이지 ${manifest.length}개 — 오류 ${viewErrors}건, 경고 ${viewWarnings}건`,
    );
    printIssues(issues);
  }

  console.log('');
  console.log(`검사 결과 — 오류 ${errors}건, 경고 ${warnings}건`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`\n[spec] 실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
