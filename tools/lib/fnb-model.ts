import { pages as clientPages } from '../../apps/fnb-client-a/pages.manifest';
import { pages as adminPages } from '../../apps/fnb-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL,
} from '../../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../../apps/fnb-admin/lib/screen-specs';
import { IA_GROUPS as clientIa, ROOT as clientRoot } from '../../apps/fnb-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../../apps/fnb-admin/lib/ia-groups';
import { FNB_MENU } from '../../apps/fnb-admin/lib/navigation/fnb-menu';
import { collectScreens, makeImpact, type PrefixRule, type Screen } from './screens';

/**
 * F&B 두 앱의 화면을 한 벌로 정리한다 — 고객 사이트와 운영 콘솔.
 *
 * ## 수집기를 공용으로 바꿨다
 * 처음에는 이 파일이 화면을 모으는 일까지 직접 했다. IR 이 오면서 같은 일을 하는 코드가 두 벌이
 * 되었고, 화면에 이동선을 싣는 일을 한쪽에만 해 두어 **F&B 화면에만 그 값이 없는** 상태가
 * 만들어졌다. 두 벌이면 반드시 한쪽만 고치게 된다.
 *
 * 지금은 둘 다 `screens.ts` 의 수집기를 쓴다. 여기 남는 것은 **이 프로젝트만의 것**뿐이다 —
 * 어느 앱을 읽는가 · 갈래 이름을 어디서 읽는가 · 기능 ID 앞자리를 무엇으로 가르는가.
 */

/** 콘솔 갈래는 이름을 사이드바에서 읽는다 — 문서와 메뉴가 다른 말을 하지 않게. */
const menuLabel = (id: string): string => FNB_MENU.find((one) => one.id === id)?.label ?? id;

const PREFIX: PrefixRule[] = [
  [/^dashboard$/, 'ADMIN'],
  [/^settings-admins/, 'ADMIN'],
  [/^settings/, 'SETTING'],
  [/^franchise-cost$/, 'FRANCHISE'],
  [/^banners/, 'BANNER'],
  [/^menus?/, 'MENU'],
  [/^marketing/, 'MARKETING'],
  [/^stores?/, 'STORE'],
  [/^(inquiries|franchise)/, 'FRANCHISE'],
  [/^support/, 'SUPPORT'],
  [/^(faqs?|notices?)/, 'SUPPORT'],
  [/^interior/, 'INTERIOR'],
  [/^(terms|privacy|legal)/, 'LEGAL'],
  [/^brand/, 'BRAND'],
  [/^home$/, 'HOME'],
];

export const SCREENS: Screen[] = collectScreens(
  [
    {
      app: 'client',
      appLabel: '고객 사이트',
      actor: '비회원',
      readOnly: true,
      pages: clientPages,
      specs: clientSpecs,
      ia: clientIa,
      root: clientRoot,
      groupLabel: (group) => group.label ?? group.id,
      /* 고객 사이트에서 값을 쌓는 곳은 창업 상담 신청 하나다. */
      writes: (route) => route.endsWith('/apply'),
    },
    {
      app: 'admin',
      appLabel: '관리자',
      actor: '관리자',
      readOnly: false,
      pages: adminPages,
      specs: adminSpecs,
      ia: adminIa,
      groupLabel: (group) => group.label ?? menuLabel(group.id),
    },
  ],
  PREFIX,
);

export const CLIENT_SCREENS = SCREENS.filter((one) => one.app === 'client');
export const ADMIN_SCREENS = SCREENS.filter((one) => one.app === 'admin');

const MENU_HREF = new Map<string, string>(
  FNB_MENU.flatMap((section) => [
    [section.label, section.href] as [string, string],
    ...(section.children ?? []).map(
      (child) => [`${section.label} > ${child.label}`, child.href] as [string, string],
    ),
  ]),
);

export const impactOf = makeImpact(SCREENS, MENU_HREF);

export { COMMON_NON_FUNCTIONAL };
