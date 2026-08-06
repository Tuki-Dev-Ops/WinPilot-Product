# 명명규칙 정의서 — Internal Admin

> 원본: `packages/spec/src/features.ts` · 용어: `packages/spec/src/glossary.ts`
> 검사: `pnpm spec:check` · `pnpm sync:check`

**한 자원에 이름은 하나다.** 같은 것을 두 이름으로 부르면 그때부터 두 구현이 생기고, 두
구현은 한 번에 고쳐지지 않는다. 이 문서는 그 하나를 어디서 정하고 어떻게 강제하는지를 적는다.

## 1. 이름의 원본은 하나다

| 무엇 | 어디서 정하는가 |
|---|---|
| 자원 이름(entity) | `packages/spec/src/glossary.ts` |
| 기능 id · 라우트 · 컴포넌트명 | `packages/spec/src/features.ts` |
| Figma 페이지 순번·이름 | `apps/internal-admin/pages.manifest.ts` |
| 사이드바 이름·차례 | `apps/internal-admin/lib/navigation/internal-menu.ts` |
| 화면 명세 | `apps/internal-admin/lib/screen-specs.ts` |
| 화면 흐름 | `apps/internal-admin/lib/flow-specs.ts` |

레지스트리를 **세 앱이 공유한다.** 앱마다 각자 이름을 정하기 시작하면 같은 기능이 뷰별로 다른
이름을 갖게 되고, 이 저장소가 막으려는 표류가 그대로 돌아온다.

## 2. 컴포넌트 이름

페이지 컴포넌트는 `Internal` + 자원 + 동작 + `Page` 다.

```
InternalTenantListPage      tenant.list      /tenants
InternalPipelineListPage    pipeline.list    /tenants/pipeline
InternalPaymentSettingsPage payment.settings /integrations/pg
```

접두어를 붙이는 이유는 파일 검색 한 번으로 같은 기능의 세 구현을 나란히 찾기 위해서다.
이름이 규칙과 다르면 `spec:check` 의 `COMPONENT_NAME` 이 잡고, 레지스트리에만 적어 두고
파일은 다른 이름으로 만들면 `sync:check` 의 `NAME DRIFT` 가 잡는다.

**화면 안의 조각에는 접두어를 붙이지 않는다.** 폴더 경로가 이미 어느 화면의 것인지 말하고
있어서, 접두어를 더 붙이면 같은 말을 두 번 하게 된다.

| 자리 | 접두어 | 예 |
|---|---|---|
| `app/**/page.tsx` | `Internal` | `InternalContactListPage` |
| `app/_components/` | `Internal` | `InternalShell` · `InternalModal` · `InternalPanel` |
| `app/<route>/_components/` | 없음 | `ContactListView` · `PipelineBoardView` |

## 3. 이 앱에서 쓰는 자원 이름

| 정규 용어 | 한글 | 쓰지 않는 말 |
|---|---|---|
| `tenant` | 고객사 | org · workspace |
| `pipeline` | 파이프라인 | funnel · stage · kanban |
| `activity` | 활동 | log · event · touchpoint |
| `contact` | 담당자 | person · poc · counterpart |
| `churn` | 이탈 | leave · quit · lost |
| `plan` | 플랜 | pricing · package · edition |
| `role` | 권한 | permission · authority · scope |
| `inquiry` | 문의 | question · ticket |
| `payment` | 결제 | pg · billing · checkout |
| `oauth` | OAuth | sso |
| `plugin` | 플러그인 | addon · extension · module |
| `dns` | DNS | nameserver · cname |
| `revenue` | 매출 | income · turnover · profit |
| `user` | 사용자 | member · client · customer · account |
| `invoice` | 요금 | bill · charge · fee |
| `overdue` | 연체 | arrears · delinquent · unpaid |
| `staff` | 관리자 | manager · operator |
| `alarm` | 알람 | alert · push |
| `code` | 기준 값 | constant · enum · lookup |

### 3.1 `contact` 를 문의의 금지어에서 뺀 이유

전에는 `contact` 가 문의(`inquiry`)의 대체어로 막혀 있었다. 이 콘솔에 **고객사 쪽 사람**이라는
자원이 생기면서 그 이름을 풀었다 — 금지어로 두면 자원 하나가 이름을 갖지 못한다.
문의를 `contact` 로 부르는 것은 여전히 안 되며, 그것은 `inquiry` 가 정규 용어라는 사실이 막는다.

### 3.2 같은 말을 쓰는 다른 자원

세 앱이 레지스트리를 공유하므로, 이름이 겹칠 때 **누구의 것인지를 id 로 가른다.**

| 기능 id | 무엇 | 왜 나눴나 |
|---|---|---|
| `inquiry.list` / `tenant.inquiry.list` | 고객→고객사 / 고객사→우리 | 받는 쪽도 답하는 쪽도 다르다 |
| `revenue.list` / `tenant.revenue.list` | 고객사가 파는 돈 / 우리가 받는 돈 | 방향이 반대다 |
| `user.list` / `tenant.user.list` | 고객사의 회원 관리 / 회원 규모 통계 | 개인을 보느냐 수를 보느냐가 다르다 |
| `staff.list` / `internal.staff.list` | 고객사의 운영자 / 우리 직원 | 보는 사람도 여는 문도 다르다 |
| `role.list` / `internal.staff.list` | 고객사가 쓰는 권한 / 이 콘솔의 직급 | 갈래를 나눈 이유가 이것이다 |

도메인 한 마디를 앞에 붙이는 방식(`<domain>.<entity>.<action>`)을 쓴다. 엔티티를 새로 만들면
같은 것에 이름이 둘이 되고, 한 id 에 묶으면 두 자원이 한 이름을 갖는다.

## 4. 라우트

`docs/path.md` §2 에 문법이, §3 에 주소와 코드의 말이 갈리는 자리가 적혀 있다.
여기서는 그 규칙을 강제하는 곳만 적는다.

| 검사 | 무엇을 보는가 |
|---|---|
| `ROUTE_SEGMENT` | 정적은 kebab-case, 동적은 `[xxxId]` |
| `ROUTE_TAIL` | 동작별 경로 꼬리 (`detail` 은 `/[xId]` 등) |
| `ROUTE_DUPLICATE` | 같은 뷰 안에서 라우트가 겹치는지 |
| `MANIFEST_MISSING` | 구현 완료인데 매니페스트에 없는지 |
| `MANIFEST_ORPHAN` | 매니페스트에는 있는데 레지스트리에 없는지 |

## 5. 파일과 폴더

| 무엇 | 규칙 | 예 |
|---|---|---|
| 라우트 폴더 | kebab-case | `app/tenants/pipeline/` |
| 화면 조각 | PascalCase `.tsx` | `_components/PipelineBoardView.tsx` |
| 시드 | kebab-case `.ts`, 자원 이름 복수 | `lib/data/contacts.ts` |
| 문서 폴더 | 화면 하나가 폴더 하나 | `docs/FSD/tenants-pipeline/` |

시드 파일 이름을 자원 이름으로 맞추는 이유: 화면에서 자원을 찾을 때 `lib/data/` 를 열어
훑으면 되게 하려는 것이다. 화면 이름으로 두면 한 자원을 두 화면이 나눠 쓸 때 어느 파일에
있는지 알 수 없다.

### 5.1 시드는 색을 모른다

`lib/data/*.ts` 에는 상태 색 표(`*_TONE`)가 함께 있는데, 값은 Tailwind 클래스가 아니라
`BadgeTone`(`'ok'` · `'neutral'` · …)이다 — `@winpilot/ui` 의 `Badge` 가 받는 이름이다.

클래스 문자열을 담으면 둘이 깨진다. **시드가 화면을 알게 되고**(값을 서버에서 받는 날 그
문자열은 갈 곳이 없다), **타입이 `string` 이라 어긋나도 컴파일이 통과한다** — 다크 모드
접두어를 빠뜨린 표가 있어도 그 화면을 다크 모드로 열기 전에는 드러나지 않는다. 실제로 표
열두 개가 같은 클래스 문자열을 손으로 옮겨 적고 있었고, 실제 값은 넷뿐이었다.

## 6. 주석

- **한국어로 적고, "무엇" 이 아니라 "왜" 를 적는다.** 무엇은 코드가 이미 말한다.
- 파일 머리 주석에는 그 파일이 **있는 이유**와 **없으면 무엇이 무너지는지**를 적는다.
- 다른 문서를 가리킬 때는 링크가 아니라 경로 글자를 쓴다 — `` `docs/path.md` §3 ``.
  링크로 두면 문서를 옮겼을 때 깨진 자리만 남고, 경로 글자는 검색으로 따라갈 수 있다.

## 7. 금지 사항

- 레지스트리를 거치지 않고 화면을 만들기 — `spec:check` 가 막는다
- 같은 역할의 조각을 화면마다 복제하기 — 두 벌이 되면 한 벌만 고쳐진다
- 도메인을 모르는 원시 요소를 앱 안에 두기 (`@winpilot/ui` 로 간다)
- **두 어드민이 같은 것을 쓰기로 정한 조각을 앱 안에 두기** — 올릴지 말지의 기준은 "화면
  구조를 아느냐" 가 아니라 **"두 앱이 같은 것을 쓰기로 정했느냐"** 다
  (`docs/component.md` §4). 반대로 한쪽만 쓰는 것을 올리지도 않는다
- Tailwind 클래스 문자열을 `lib/data/*.ts` 에 담기 (§5.1)
- 생성물(`docs/FSD/**` · `docs/NFS/**`)을 손으로 고치기 — 다음 생성 때 지워진다
- 서버·API·DB 를 만들기 — 이 저장소는 **프론트엔드 전용**이다
