/**
 * 화면 등록부와 화면 명세를 **한 벌로 정리하는 틀**. F&B 와 IR 두 프로젝트가 함께 쓴다.
 *
 * ## 왜 이제 뽑아냈나
 * F&B 하나만 있을 때는 `fnb-model.ts` 안에 두는 편이 읽기 쉬웠다. 두 번째가 오고 나서야
 * **무엇이 프로젝트마다 다르고 무엇이 같은지**가 보였다 — 다른 것은 앱 이름 · 갈래 이름을
 * 읽는 법 · 기능 ID 앞자리뿐이고, 나머지는 전부 같다.
 *
 * 첫 번째에서 미리 뽑았으면 아직 모르는 차이까지 짐작해서 갈래를 냈을 것이다.
 *
 * ## 기능 ID
 * 주제별 앞자리에 세 자리 일련번호를 붙인다 — `MENU-001`. 번호는 **고객 화면 먼저, 그다음
 * 관리자** 순서다. 같은 주제를 양쪽에서 다루는 화면이 많아 주제를 앞세우는 편이 찾기 쉽고,
 * 어느 쪽 화면인지는 명세의 「서비스 구분」이 말한다.
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

/** 두 프로젝트의 화면 명세가 공유하는 모양. 프로젝트마다 더 가진 칸이 있어도 여기서는 안 쓴다. */
export type ScreenSpecLike = {
  screen: string;
  purpose: string;
  background?: string;
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

export type AppKind = 'client' | 'admin';

export type Screen = {
  id: string;
  featureId: string;
  name: string;
  route: string;
  app: AppKind;
  appLabel: string;
  actor: string;
  group: string;
  menuPath: string;
  readOnly: boolean;
  spec: ScreenSpecLike;
  data: readonly string[];
  /** 이 화면에서 나가는 이동 — 화면 정의서가 LINK 의 이동 대상을 여기서 읽는다 */
  links: { id: string; name: string; route: string }[];
};

export type PageLike = { id: string; name: string; route: string };

export type IaLike = {
  id: string;
  label?: string;
  screens: readonly { screen: string; ko: string }[];
  data: readonly string[];
  /** 갈래 안의 이동 — `[출발 screen, 도착 screen]`. 화면 정의서의 LINK 이동 대상이 된다. */
  edges?: readonly (readonly [string, string])[];
};

export type AppSource = {
  app: AppKind;
  appLabel: string;
  actor: string;
  /** 값을 쌓지 않는 서비스인가 */
  readOnly: boolean;
  pages: readonly PageLike[];
  specs: readonly ScreenSpecLike[];
  ia: readonly IaLike[];
  /** 갈래 이름을 어디서 읽는가 — 사이트는 직접 적고, 콘솔은 메뉴가 이긴다 */
  groupLabel: (group: IaLike) => string;
  /** 읽기 전용 서비스 안에서 값을 쌓는 화면 — 주소로 가린다 */
  writes?: (route: string) => boolean;
};

/** 화면 id 앞부분으로 주제를 가른다. 먼저 걸리는 것이 이긴다 — 차례가 규칙이다. */
export type PrefixRule = [RegExp, string];

const subjectOf = (id: string, rules: readonly PrefixRule[]): string =>
  rules.find(([test]) => test.test(id))?.[1] ?? 'ETC';

/**
 * 화면을 한 줄로 편다.
 *
 * 갈래에 들지 않는 화면이 있다 — 사이트의 홈이 그렇다. 갈래가 모두 거기서 갈라지므로 어느
 * 하나에 넣을 수 없다. 그런 화면은 `공통` 으로 모은다. 빠뜨리면 문서의 화면 수가 등록부와
 * 달라지고, 그 차이는 아무도 눈치채지 못한다.
 */
export const collectScreens = (sources: readonly AppSource[], rules: readonly PrefixRule[]): Screen[] => {
  const rows: Omit<Screen, 'featureId'>[] = [];

  for (const source of sources) {
    const specById = new Map(source.specs.map((one) => [one.screen, one]));
    const pageById = new Map(source.pages.map((one) => [one.id, one]));
    const placed = new Set<string>();

    const push = (id: string, ko: string, group: string, data: readonly string[]): void => {
      const page = pageById.get(id);
      const spec = specById.get(id);
      if (!page || !spec) return;
      placed.add(id);
      rows.push({
        id,
        links: [],
        name: ko,
        route: page.route,
        app: source.app,
        appLabel: source.appLabel,
        actor: source.actor,
        group,
        menuPath: `${source.appLabel} > ${group} > ${ko}`,
        readOnly: source.readOnly && !(source.writes?.(page.route) ?? false),
        spec,
        data,
      });
    };

    for (const group of source.ia) {
      const label = source.groupLabel(group);
      for (const one of group.screens) push(one.screen, one.ko, label, group.data);
    }
    for (const page of source.pages) {
      if (!placed.has(page.id)) push(page.id, page.name, '공통', []);
    }
  }

  /*
    갈래의 이동선을 화면에 붙인다. 도면(`edges`)이 이미 갖고 있는 값이라 새로 적지 않는다 —
    손으로 적으면 도면과 문서가 서로 다른 이동을 말하게 된다.
  */
  const nameOf = new Map(rows.map((one) => [one.id, one]));
  for (const source of sources) {
    for (const group of source.ia) {
      for (const [from, to] of group.edges ?? []) {
        const start = nameOf.get(from);
        const end = nameOf.get(to);
        if (start && end && start.app === end.app) {
          start.links.push({ id: end.id, name: end.name, route: end.route });
        }
      }
    }
  }

  /* 주제별로 번호를 매긴다. rows 가 이미 사이트 → 콘솔 차례라 그대로 세면 된다. */
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const subject = subjectOf(row.id, rules);
    const next = (seen.get(subject) ?? 0) + 1;
    seen.set(subject, next);
    return { ...row, featureId: `${subject}-${String(next).padStart(3, '0')}` };
  });
};

/**
 * 콘솔에서 값을 고치면 **어느 사이트 화면이 달라지는가**.
 *
 * 사이트 화면마다 값이 오는 콘솔 메뉴가 적혀 있다. 그것을 뒤집으면 콘솔 화면별 영향 범위가
 * 나온다. 손으로 적으면 화면이 하나 늘 때 한쪽만 고쳐지므로 뒤집어서 만든다.
 *
 * 짝은 **메뉴를 거쳐 주소로** 잇는다. 화면 이름으로 짝지으면 놓치는 것이 생긴다 —
 * `창업 > 비용 · 절차`(메뉴)와 `창업 > 창업 비용 · 절차`(화면)는 어느 쪽도 다른 쪽의
 * 앞부분이 아니다.
 */
export const makeImpact = (
  screens: readonly Screen[],
  menuHref: ReadonlyMap<string, string>,
): ((admin: Screen) => { screen: Screen; via: string }[]) => {
  const clients = screens.filter((one) => one.app === 'client');

  /** `등록 > 메뉴 (목록 · 등록 · 상세)` · `등록 > 메뉴 > 메뉴 묶음` — 둘 다 `등록 > 메뉴` 로 줄인다. */
  const hrefOf = (binding: string): string | undefined => {
    const clean = binding.replace(/\s*[(（].*$/, '').trim();
    const parts = clean.split('>').map((one) => one.trim());
    return menuHref.get(parts.slice(0, 2).join(' > ')) ?? menuHref.get(parts[0] ?? '');
  };

  const under = (route: string, href: string): boolean =>
    route === href || route.startsWith(`${href}/`);

  return (admin) =>
    clients.flatMap((client) => {
      const via = client.spec.admin.find((one) => {
        const href = hrefOf(one);
        return href !== undefined && under(admin.route, href);
      });
      return via ? [{ screen: client, via }] : [];
    });
};
