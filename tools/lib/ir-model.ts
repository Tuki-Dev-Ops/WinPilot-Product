import { pages as clientPages } from '../../apps/ir-client-a/pages.manifest';
import { pages as adminPages } from '../../apps/ir-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL,
} from '../../apps/ir-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../../apps/ir-admin/lib/screen-specs';
import { IA_GROUPS as clientIa, ROOT as clientRoot } from '../../apps/ir-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../../apps/ir-admin/lib/ia-groups';
import { IR_MENU } from '../../apps/ir-admin/lib/navigation/ir-menu';
import { collectScreens, makeImpact, type PrefixRule, type Screen } from './screens';

/**
 * IR 두 앱의 화면을 한 벌로 정리한다 — 회사 사이트와 운영 콘솔.
 *
 * ## 기능 ID 앞자리
 * F&B 와 같은 규칙을 쓰되 주제가 다르다. 이 사이트가 파는 것은 **제품과 서비스**이고, 콘솔이
 * 다루는 것은 **사이트에 나가는 글과 값**이다.
 *
 * 앞자리를 정하는 순서가 규칙이다 — 먼저 걸리는 것이 이긴다. `company-credentials` 가
 * `COMPANY` 가 아니라 `CERT` 로 가는 것은, 특허 · 인증이 회사 소개와 다른 물음에 답하기
 * 때문이다(등록번호가 진짜인가).
 */

/** 콘솔 갈래는 이름을 사이드바에서 읽는다 — 문서와 메뉴가 다른 말을 하지 않게. */
const menuLabel = (id: string): string => IR_MENU.find((one) => one.id === id)?.label ?? id;

const PREFIX: PrefixRule[] = [
  [/^dashboard$/, 'ADMIN'],
  [/^result$/, 'ADMIN'],
  [/^statistics/, 'STAT'],
  [/^settings-(supplier|seo)/, 'SETTING'],
  [/^settings-(terms|privacy)/, 'LEGAL'],
  [/^settings-locales/, 'SETTING'],
  [/^(terms|privacy)$/, 'LEGAL'],
  [/^banners/, 'BANNER'],
  [/^inquiries/, 'INQUIRY'],
  [/^support-contact$/, 'INQUIRY'],
  [/^(contents-notices|support-notices)/, 'NOTICE'],
  [/^(contents-news|support-news)/, 'NEWS'],
  [/^(contents-faqs|support-faq)/, 'FAQ'],
  [/^support-directions$/, 'SUPPORT'],
  [/^solutions/, 'SOLUTION'],
  [/^services/, 'SERVICE'],
  [/^products/, 'PRODUCT'],
  [/^(about-certifications|company-credentials)/, 'CERT'],
  [/^(about-history|company-history)/, 'HISTORY'],
  [/^(about|company)/, 'COMPANY'],
  [/^home$/, 'HOME'],
];

export const SCREENS: Screen[] = collectScreens(
  [
    {
      app: 'client',
      appLabel: '회사 사이트',
      actor: '비회원',
      readOnly: true,
      pages: clientPages,
      specs: clientSpecs,
      ia: clientIa,
      root: clientRoot,
      groupLabel: (group) => group.label ?? group.id,
      /* 사이트에서 값을 쌓는 곳은 문의하기 하나다. */
      writes: (route) => route === '/support/contact',
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
  IR_MENU.flatMap((section) => [
    [section.label, section.href] as [string, string],
    ...(section.children ?? []).map(
      (child) => [`${section.label} > ${child.label}`, child.href] as [string, string],
    ),
  ]),
);

export const impactOf = makeImpact(SCREENS, MENU_HREF);

export { COMMON_NON_FUNCTIONAL };
