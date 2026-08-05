# 컴포넌트 정의서 — Internal Admin

> 대상: `app/_components/**` · `app/<route>/_components/**` · `@winpilot/ui` · `@winpilot/docs`
> 이름 규칙: `docs/coding-conventions.md` §2 (`Internal` 접두어를 붙이는 자리와 붙이지 않는 자리)

**여기 적힌 것은 지금 저장소에 실제로 있는 것뿐이다.** "쓰이는 화면" 은 `import` 를 되짚어
적었고, 쓰이는 곳이 없으면 없다고 적었다. 있을 법한 컴포넌트를 미리 적지 않는다 — 적어 두면
다음 사람이 찾다가 없는 것을 만들었다고 생각한다.

## 1. 층

| 층 | 뜻 | 두는 곳 | 접두어 |
|---|---|---|---|
| **껍데기** | 화면 바깥 틀 — 사이드바 · 헤더 · 보조 메뉴 | `app/_components/` | `Internal` |
| **목록** | 표 화면이 공통으로 쓰는 조각 — 툴바 · 카드 · 표 머리 | `app/_components/` | `Internal` |
| **폼** | 입력 화면이 공통으로 쓰는 조각 — 모달 · 항목 뼈대 · 단추 | `app/_components/` | `Internal` |
| **화면 전용** | 한 갈래 안에서만 도는 것 | `app/<route>/_components/` | 없음 |

경계는 **"이 조각이 갈래를 가로지르는가"** 다. 어느 화면에서나 불려 나오는 것은
`app/_components/` 에 두고 이름에 `Internal` 을 박는다. 한 갈래 안에서만 도는 것은 그 갈래의
`_components/` 에 두고 접두어를 붙이지 않는다 — 폴더 경로가 이미 어느 화면의 것인지 말한다.

## 2. `app/_components/` — 이 콘솔 전체가 쓰는 뼈대

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `InternalShell` | 껍데기 | 사이드바(최상위 메뉴) · 상단 헤더(현재 위치) · 본문 왼쪽 보조 메뉴를 그린다. `lg` 미만에서는 사이드바가 칩 내비게이션으로 접힌다 | **22장** — 매니페스트의 모든 화면 |
| `InternalToolbar` | 목록 | 목록 위 한 줄 — 왼쪽 검색·필터, 오른쪽 끝 등록. 등록이 없는 목록은 `action` 을 주지 않는다 | `/tenants` · `/tenants/pipeline` · `/tenants/activities` · `/tenants/contacts` · `/tenants/churned` · `/subscriptions/plans` · `/subscriptions/roles` · `/inquiries` · `/billing/due` · `/billing/overdue` · `/settings/staff` · `/settings/codes` |
| `InternalChips` | 목록 | 값 하나를 고르는 칩 묶음. 선택지가 대여섯 개 이하일 때만 쓰고 그보다 많으면 `Dropdown` | `InternalToolbar` 를 쓰는 화면 중 `/settings/codes` 를 뺀 전부 |
| `InternalModal` | 폼 | 등록 폼의 바탕 — Esc 로 닫고, 열릴 때 본문 스크롤을 잠그고, 첫 입력으로 포커스를 옮긴다 | `/tenants` · `/tenants/pipeline` · `/tenants/activities` · `/tenants/contacts` · `/subscriptions/plans` · `/subscriptions/roles` · `/billing/due` · `/settings/staff` · `/settings/codes` |
| `InternalPanel` | 목록 | 제목 · 한 줄 설명 · 오른쪽 값이 붙는 카드 한 장 | **15장** — 목록과 읽기 화면 대부분 |
| `InternalEmpty` | 목록 | 결과가 없을 때 목록 자리에 적는 한 줄 | `InternalPanel` 을 쓰는 목록 전부 |
| `InternalSummary` | 목록 | 요약 숫자 줄. 볼 것이 없어도 카드를 숨기지 않고 0 을 적는다 | **13장** |
| `InternalTableHead` · `InternalTableFoot` | 목록 | 표 머리줄(`lg` 이상에서만)과 마무리 줄(총 건수·합계) | 표로 그리는 목록 전부 |
| `InternalField` | 폼 | 라벨 + 입력 + 안내 문구 한 묶음 | 등록 모달과 연동 폼 전부 |
| `InternalSaveRow` | 폼 | 카드 맨 아래 오른쪽 저장 줄 | `/integrations/plugin` · `/integrations/dns` · `/settings/notifications` · `/settings/codes` |
| `InternalPrimaryButton` · `InternalGhostButton` | 폼 | 주된 동작 하나와 곁들이는 동작 | `InternalSaveRow` 를 쓰는 화면 |

### 2.1 목록 툴바를 좌우로 가른 이유

찾는 일(검색·필터)과 만드는 일(등록)은 **방향이 반대**다. 같은 쪽에 모아 두면 누를 것을
고르는 데 한 번 더 생각하게 된다. 등록을 표 아래나 화면 맨 아래에 두지 않는 이유도 같다 —
목록이 길면 등록하러 갈 때마다 끝까지 스크롤해야 하고, 자료가 없어 표가 비었을 때는 단추가
화면 위쪽에 붕 떠 보인다.

좁은 화면(`lg` 미만)에서는 검색이 한 줄을 다 쓰고 필터와 등록이 그 아래로 내려간다.
그때도 등록은 오른쪽 끝이다.

### 2.2 등록 단추를 그리지 않는 목록

`/tenants/churned` · `/inquiries` · `/billing/overdue` · `/statistics/*` 넷은 운영자가
만드는 자료가 아니라 **다른 일의 결과**로 생기는 자료다. 자리를 비워 두되 없는 단추를 그리지
않는다 — 누를 수 없는 단추가 있으면 왜 안 되는지를 찾느라 시간을 쓴다.

### 2.3 확인 모달이 없는 이유

B2C Admin 에는 `AdminConfirmModal` 이 있다. 이 콘솔에는 아직 **되돌릴 수 없는 삭제가 없다** —
계정은 지우지 않고 중지하고, 이탈 고객사도 남기며, 파이프라인 단계는 앞뒤로 오간다. 확인
창이 필요해지는 자리가 생기면 그때 만든다.

되돌리기 어려운 것 하나(실결제 전환)는 확인 창 대신 **그 자리의 붉은 안내**로 다룬다.
모달을 띄우면 눌러서 닫고 지나가지만, 화면에 남는 경고는 저장할 때까지 계속 보인다.

## 3. `app/<route>/_components/` — 그 갈래 안에서만 도는 조각

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `tenants/_components/TenantListView` | 목록 | 고객사 목록 + 등록 모달 | `/tenants` |
| `tenants/pipeline/_components/PipelineBoardView` | 목록 | 단계별 세로 칸과 단계 이동 단추 | `/tenants/pipeline` |
| `tenants/activities/_components/ActivityListView` | 목록 | 최신순 타임라인 + 기록 모달 | `/tenants/activities` |
| `tenants/contacts/_components/ContactListView` | 목록 | 담당자 표 + 등록 모달 | `/tenants/contacts` |
| `tenants/churned/_components/ChurnListView` | 목록 | 이탈 목록 (등록 없음) | `/tenants/churned` |
| `subscriptions/plans/_components/PlanListView` | 목록 | 플랜 카드 + 등록 모달 | `/subscriptions/plans` |
| `subscriptions/roles/_components/RoleListView` | 목록 | 권한 표 + 등록 모달 | `/subscriptions/roles` |
| `inquiries/_components/InquiryListView` | 목록 | 문의 목록과 펼쳐 읽기 | `/inquiries` |
| `integrations/_components/TenantPicker` | 폼 | 고객사 선택기 — 연동 네 화면이 함께 쓴다 | `/integrations/pg` · `/integrations/oauth` · `/integrations/plugin` · `/integrations/dns` |
| `integrations/pg/_components/PaymentSettingsView` | 폼 | PG 연동 폼 | `/integrations/pg` |
| `integrations/oauth/_components/OauthSettingsView` | 폼 | OAuth 연동 폼 | `/integrations/oauth` |
| `integrations/plugin/_components/PluginSettingsView` | 폼 | 플러그인 켜고 끄기 | `/integrations/plugin` |
| `integrations/dns/_components/DnsSettingsView` | 폼 | DNS 레코드 안내와 다시 확인 | `/integrations/dns` |
| `statistics/_components/MonthBars` · `ShareBars` | 목록 | 달별 막대와 비중 막대 — 인라인 SVG | `/statistics/revenue` · `/statistics/members` |
| `billing/due/_components/InvoiceListView` | 목록 | 청구 예정 목록 + 등록 모달 | `/billing/due` |
| `billing/overdue/_components/OverdueListView` | 목록 | 연체 목록 (등록 없음) | `/billing/overdue` |
| `settings/staff/_components/StaffListView` | 목록 | 사내 계정 표 + 등록 모달 | `/settings/staff` |
| `settings/notifications/_components/AlarmSettingsView` | 폼 | 알림 규칙 | `/settings/notifications` |
| `settings/codes/_components/CodeListView` | 목록 | 기준 값 목록과 값 더하기 | `/settings/codes` |

`TenantPicker` 만 화면 하나가 아니라 **넷이 나눠 쓴다.** 연동 네 화면이 모두 "어느 고객사의
값인지" 를 먼저 묻기 때문이다. 선택기가 네 벌이면 고객사를 바꾸는 방법이 화면마다 갈린다.

## 4. `@winpilot/ui` — 세 앱이 나눠 쓰는 원시 요소

여기 들어가는 것은 **도메인을 모르는 것만**이다. 목록 툴바나 셸처럼 화면 구조를 아는 것은
앱이 갖는다 — 앱마다 구조가 다르기 때문이다. 뷰 하나가 곧 레포 하나이므로, 앱 안에 복사해
두면 레포를 나누는 순간 두 벌이 되어 어긋난다.

| 이름 | 층 | 하는 일 | 이 앱에서 쓰는 파일 수 |
|---|---|---|---|
| `Checkbox` | 폼 | 켜고 끄기. 네이티브 렌더는 OS 마다 달라 `appearance-none` 으로 직접 그린다 | 3 |
| `Dropdown` | 폼 | 네이티브 `<select>` 대신. 목록을 `body` 로 포털해 카드·모달의 `overflow` 에 잘리지 않는다 | 8 |
| `HintInput` | 폼 | 안내 문구가 있는 한 줄 입력란 | 9 |
| `StatusScreen` | 알림 | 404 · 오류 · 완료 · 실패가 한 컴포넌트를 쓴다 | `app/not-found.tsx` · `app/error.tsx` · `/result` |
| `ToastProvider` · `useToast` | 알림 | 동작 결과 통지. 공급자는 `app/layout.tsx` 에 한 번만 둔다 | 11 |

**쓰지 않는 것**: `HintTextarea` · `ImageUploader` · `RichTextEditor` · 이미지 검사 도우미.
이 콘솔에는 긴 글을 쓰거나 그림을 올리는 화면이 없다 — 다루는 값이 설정과 숫자뿐이다.

### 4.1 `placeholder` 를 쓰지 않는다

`HintInput` 과 `InternalToolbar` 의 검색이 모두 안내 문구를 **실제 텍스트 노드**로 겹쳐 두고
CSS 로만 숨긴다. `placeholder` 속성은 DOM 텍스트 노드가 아니라 추출되지 않고 Figma 에서
빈 상자로 나온다 (`docs/spec/05-component.md`).

같은 이유로 아이콘과 차트는 전부 인라인 SVG 다. 아이콘 폰트나 비트맵으로 두면 벡터로
복원되지 않는다.

## 5. `@winpilot/docs` — 문서 화면이 쓰는 조각

| 이름 | 하는 일 | 쓰이는 화면 |
|---|---|---|
| `Markdown` | 마크다운을 그린다 | `/docs/fsd/*` · `/docs/nfs/*` · `/docs/page-view/*` · 단일 문서 |
| `CodeBlock` | 복사 단추가 붙은 코드 상자 | `/docs/prompt` |
| `Mermaid` | 도면. 브라우저 전용이라 클라이언트에서 동적 import 한다 | `/docs/ia/*` · `/docs/flow-chart/*` |
| `listSection` · `readSectionDoc` · `readDoc` | 저장소의 문서 파일을 **빌드 시점에** 읽는다 | `app/docs/**` |

읽는 것(`.`)과 그리는 것(`./ui`)의 진입점이 나뉘어 있다. 본 진입점은 `node:fs` 를 쓰므로
브라우저 번들에 섞이면 안 된다.

## 6. 금지 사항

- 같은 역할의 컴포넌트를 화면마다 복제하기 — 두 벌이 되면 한 벌만 고쳐진다
- 도메인을 모르는 원시 요소를 앱 안에 두기 (`@winpilot/ui` 로 간다)
- 화면 구조를 아는 조각을 `@winpilot/ui` 에 넣기 (앱마다 구조가 다르다)
- `app/<route>/_components/` 의 조각에 `Internal` 접두어 붙이기
- 인라인 `style` 속성 · raw hex · raw px (`docs/design.md` §7)
  — 막대 길이처럼 값이 계산되는 자리만 예외다

## 7. 아직 없는 것

- **확인 모달** — 되돌릴 수 없는 삭제가 아직 없다 (§2.3).
- **컴포넌트 갤러리** — B2C Admin 의 `/ssot/components` 같은 면이 이 앱에는 없다. 조각 수가
  적고 대부분 한 모양뿐이라 아직 한자리에 그려 둘 값이 없다.
- **날짜 입력** — 유지보수 종료일·청구 기한을 `HintInput` 에 글자로 받는다. `type="date"` 도
  날짜 선택 컴포넌트도 쓰는 곳이 없다.
- **페이저** — 목록이 짧아 쪽을 나누지 않는다. 자료가 늘면 그때 붙인다.
