import { pages as clientPages, breakpoints as clientBreakpoints } from '../apps/b2c-client-a/pages.manifest';
import { SCREEN_SPECS, COMMON_NON_FUNCTIONAL } from '../apps/b2c-client-a/lib/screen-specs';
import { IA_GROUPS } from '../apps/b2c-client-a/lib/ia-groups';
import { buildFsd, type FsdApp } from './docs/fsd';
import { buildNfs, type NfsApp } from './docs/nfs';

/**
 * 문서 생성 — `pnpm docs:build`.
 *
 * 앱마다 원본(`lib/screen-specs.ts`)만 다르고 펼치는 방법은 같다. 앱별로 생성기를 두면
 * 한쪽만 고쳐져 두 문서의 절 구성이 갈라진다.
 *
 * 캡처(`docs:capture`)는 여기서 하지 않는다 — 서버를 띄우고 브라우저로 찍는 일이라 조건이 다르다.
 */
const client: FsdApp & NfsApp = {
  dir: 'apps/b2c-client-a',
  label: 'B2C Client 템플릿 A',
  pages: clientPages,
  specs: SCREEN_SPECS,
  common: COMMON_NON_FUNCTIONAL,
  breakpoints: clientBreakpoints,
  menuOf: (screen) => {
    const group = IA_GROUPS.find((item) => item.screens.some((s) => s.screen === screen));
    if (!group) return '홈';
    const found = group.screens.find((s) => s.screen === screen);
    return `${group.label} > ${found?.ko ?? screen}`;
  },
};

const apps: Array<FsdApp & NfsApp> = [client];

for (const app of apps) {
  const fsd = buildFsd(app);
  const nfs = buildNfs(app);

  console.log(`[${app.label}] 기능 명세 ${fsd.written}장 · 비기능 정책 ${nfs}장`);
  if (fsd.missing.length > 0) console.log(`  명세 없음: ${fsd.missing.join(', ')}`);
}
