import { pages as clientPages, breakpoints as clientBreakpoints } from '../apps/b2c-client-a/pages.manifest';
import { SCREEN_SPECS as CLIENT_SPECS, COMMON_NON_FUNCTIONAL as CLIENT_COMMON } from '../apps/b2c-client-a/lib/screen-specs';
import { IA_GROUPS } from '../apps/b2c-client-a/lib/ia-groups';
import { pages as adminPages, breakpoints as adminBreakpoints } from '../apps/b2c-admin/pages.manifest';
import { SCREEN_SPECS as ADMIN_SPECS, COMMON_NON_FUNCTIONAL as ADMIN_COMMON } from '../apps/b2c-admin/lib/screen-specs';
import { ADMIN_MENU } from '../apps/b2c-admin/lib/navigation/admin-menu';
import { pages as internalPages, breakpoints as internalBreakpoints } from '../apps/internal-admin/pages.manifest';
import {
  SCREEN_SPECS as INTERNAL_SPECS,
  COMMON_NON_FUNCTIONAL as INTERNAL_COMMON,
} from '../apps/internal-admin/lib/screen-specs';
import { INTERNAL_MENU } from '../apps/internal-admin/lib/navigation/internal-menu';
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
type App = FsdApp & NfsApp;

const client: App = {
  dir: 'apps/b2c-client-a',
  label: 'B2C Client 템플릿 A',
  pages: clientPages,
  specs: CLIENT_SPECS,
  common: CLIENT_COMMON,
  breakpoints: clientBreakpoints,
  sourceLabel: '어드민 연동',
  sourceNote: '이 화면이 읽는 값의 출처다. 값을 템플릿에 박아 두면 고칠 때마다 배포해야 한다.',
  sourceEmpty: '어드민이 정하는 값이 없다.',
  menuOf: (screen) => {
    const group = IA_GROUPS.find((item) => item.screens.some((s) => s.screen === screen));
    if (!group) return '홈';
    return `${group.label} > ${group.screens.find((s) => s.screen === screen)?.ko ?? screen}`;
  },
};

/**
 * 어드민의 메뉴 위치는 사이드바에서 읽는다.
 *
 * 메뉴는 `href` 로 화면을 가리키므로 라우트에서 되짚는다 — 화면 id 를 메뉴에 또 적으면
 * 메뉴를 고칠 때 문서가 남는다.
 */
const adminRouteOf = new Map(adminPages.map((page) => [page.id, page.route]));

function adminMenuOf(screen: string): string {
  const route = adminRouteOf.get(screen);
  if (!route) return '메뉴 밖';

  for (const section of ADMIN_MENU) {
    const child = section.children?.find((item) => item.href === route);
    if (child) return `${section.label} > ${child.label}`;
    if (section.href === route) return section.label;
  }

  // 목록에서 들어가는 화면(등록·상세)은 메뉴에 항목이 없다 — 어느 섹션 아래인지만 적는다.
  const owner = ADMIN_MENU.find(
    (section) =>
      section.children?.some((item) => route.startsWith(`${item.href}/`)) ||
      (section.href !== '/' && route.startsWith(`${section.href}/`)),
  );
  return owner ? `${owner.label} > (목록에서 진입)` : '메뉴 밖';
}

const admin: App = {
  dir: 'apps/b2c-admin',
  label: 'B2C Admin',
  pages: adminPages,
  specs: ADMIN_SPECS,
  common: ADMIN_COMMON,
  breakpoints: adminBreakpoints,
  sourceLabel: '고객 화면 연동',
  sourceNote: '여기서 정한 값이 나타나는 고객 화면이다. 이 화면이 원본이고, 고객 화면은 받아 그린다.',
  sourceEmpty: '고객 화면에 나타나지 않는다 — 운영자만 보는 값이다.',
  menuOf: adminMenuOf,
};

/**
 * 사내 어드민의 메뉴 위치도 사이드바에서 읽는다 — 어드민과 같은 방법이다.
 *
 * 두 함수를 하나로 합치지 않는 이유: 메뉴 타입이 앱마다 다르고(`AdminMenuItem` ·
 * `InternalMenuItem`), 합치려면 그 타입을 공유 패키지로 올려야 한다. 지금 아낄 것보다
 * 앱 사이에 타입을 하나 더 묶는 값이 크다.
 */
const internalRouteOf = new Map(internalPages.map((page) => [page.id, page.route]));

function internalMenuOf(screen: string): string {
  const route = internalRouteOf.get(screen);
  if (!route) return '메뉴 밖';

  for (const section of INTERNAL_MENU) {
    const child = section.children?.find((item) => item.href === route);
    if (child) return `${section.label} > ${child.label}`;
    if (section.href === route) return section.label;
  }

  // 목록에서만 들어가는 화면(상세)은 메뉴에 항목이 없다 — 어느 섹션 아래인지만 적는다.
  const owner = INTERNAL_MENU.find(
    (section) =>
      section.children?.some((item) => route.startsWith(`${item.href}/`)) ||
      (section.href !== '/' && route.startsWith(`${section.href}/`)),
  );
  return owner ? `${owner.label} > (목록에서 진입)` : '메뉴 밖';
}

/**
 * 사내 어드민.
 *
 * 방향이 앞의 둘과 또 다르다 — 고객 화면은 값을 **받아 오고**, B2C Admin 은 고객 화면으로
 * **내보내며**, 이 콘솔이 정한 값은 **고객사의 배포**를 만든다. 같은 말로 적으면 어느 층의
 * 이야기인지 문서만 보고는 알 수 없다.
 */
const internal: App = {
  dir: 'apps/internal-admin',
  label: 'Internal Admin',
  pages: internalPages,
  specs: INTERNAL_SPECS,
  common: INTERNAL_COMMON,
  breakpoints: internalBreakpoints,
  sourceLabel: '고객사 배포 연동',
  sourceNote:
    '여기서 정한 값이 반영되는 고객사의 배포다. 틀리면 고객사 사이트가 통째로 멈추고, 원인을 찾는 것도 우리 몫이 된다.',
  sourceEmpty: '고객사의 배포에 나타나지 않는다 — 사내에서만 쓰는 값이다.',
  menuOf: internalMenuOf,
};

for (const app of [client, admin, internal]) {
  const fsd = buildFsd(app);
  const nfs = buildNfs(app);

  console.log(`[${app.label}] 기능 명세 ${fsd.written}장 · 비기능 정책 ${nfs}장`);
  if (fsd.missing.length > 0) console.log(`  명세 없음: ${fsd.missing.join(', ')}`);
}
