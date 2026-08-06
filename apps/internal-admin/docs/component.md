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
| `InternalModal` | 폼 | **등록 창의 모양** — 폼 하나와 `취소`/`저장` 두 단추. 창을 여닫는 일(Esc · 스크롤 잠금 · 포커스)은 `@winpilot/ui` 의 `Modal` 이 맡는다 (§2.0) | `/tenants` · `/tenants/pipeline` · `/tenants/activities` · `/tenants/contacts` · `/subscriptions/plans` · `/subscriptions/roles` · `/billing/due` · `/settings/staff` · `/settings/codes` |
| `InternalPanel` | 목록 | 제목 · 한 줄 설명 · 오른쪽 값이 붙는 카드 한 장 | **15장** — 목록과 읽기 화면 대부분 |
| `InternalEmpty` | 목록 | 결과가 없을 때 목록 자리에 적는 한 줄 | `InternalPanel` 을 쓰는 목록 전부 |
| `InternalSummary` | 목록 | 요약 숫자 줄. 볼 것이 없어도 카드를 숨기지 않고 0 을 적는다 | **13장** |
| `InternalTableHead` · `InternalTableFoot` | 목록 | 표 머리줄(`lg` 이상에서만)과 마무리 줄(총 건수·합계) | 표로 그리는 목록 전부 |
| `InternalField` | 폼 | 라벨 + 입력 + 안내 문구 한 묶음 | 등록 모달과 연동 폼 전부 |
| `InternalSaveRow` | 폼 | 카드 맨 아래 오른쪽 저장 줄 | `/integrations/plugin` · `/integrations/dns` · `/settings/notifications` · `/settings/codes` |
| `InternalPrimaryButton` · `InternalGhostButton` | 폼 | 주된 동작 하나와 곁들이는 동작 | `InternalSaveRow` 를 쓰는 화면 |

### 2.0 `InternalModal` 이 얇아진 자리 — 두 벌이 이미 갈라져 있었다

이 파일은 백스무 줄이었고, B2C Admin 의 `AdminModal` 과 **여든 줄이 같았다.** 같지 않은
스무 줄은 전부 **그쪽에만 있는 것**이었다.

| 그쪽에 있고 여기 없던 것 | 그래서 생긴 일 |
|---|---|
| 모달 스택 | 확인 창을 띄운 채 Esc 를 누르면 **뒤의 이 폼까지 함께 닫혔다** — 쓰던 값이 사라진다 |
| `animate-overlay-in` · `animate-panel-in` | 같은 동작인데 그쪽만 스르륵 열렸다 |
| `elevated` | 확인 창을 겹쳐 띄울 방법이 없었다 |
| `bg-surface-raised` (여기는 `bg-canvas`) | 다크 모드에서 뒤 배경과 같은 색으로 붙어 보였다 |

넷 다 **나중에 고친 것이 한쪽에만 반영된 자리**다. 복사한 날에는 같았고 고친 날부터
갈라졌다 — 두 벌로 두는 한 계속 이렇게 된다. 그래서 창을 여닫는 부분을 `@winpilot/ui` 의
`Modal` 로 올렸다.

여기 남은 것은 **이 콘솔이 정한 모양** 하나다: 폼이 있고, 아래줄은 언제나 취소·저장 둘.
전에는 `<form>` 과 두 단추가 컴포넌트에 박혀 있어 단추가 셋인 창이나 저장이 없는 창을 만들
수 없었는데, `Modal` 은 아래줄을 `footer` 슬롯으로 비워 두고 이 겹이 그 모양을 채운다.

### 2.1 목록 툴바는 이 앱이 갖지 않는다

툴바는 `@winpilot/ui` 의 `ListToolbar` 다 (§4). 두 어드민이 같은 것을 쓰기로 정했으므로
앱마다 두면 두 벌이 되고, 두 벌은 한 번에 고쳐지지 않는다.

화면이 넘기는 것은 **탭 정의와 등록 단추 유무**뿐이다. 탭·등록·필터 중 넘기지 않은 것은
그 줄이나 단추가 아예 그려지지 않는다 — 빈 줄을 남기지 않기 위해서다.

| 화면 | 상태 탭 | 등록 |
|---|---|---|
| `/tenants` | 유지보수 상태 | 고객사 등록 |
| `/tenants/pipeline` | **없음** — 단계가 이미 칸으로 서 있다 | 파이프라인 건 등록 |
| `/tenants/activities` | 활동 종류 | 활동 기록 |
| `/tenants/contacts` | 역할 | 담당자 등록 |
| `/tenants/churned` | 재계약 가능 여부 | **없음** |
| `/subscriptions/plans` | 판매 상태 | 플랜 등록 |
| `/subscriptions/roles` | 끌 수 있는지 | 권한 등록 |
| `/inquiries` | 미답변·답변완료·보류 (기본 **미답변**) | **없음** |
| `/billing/due` | 7일 안 · 견적 · 청구 | 청구 등록 |
| `/billing/overdue` | 연체 구간 | **없음** |
| `/settings/staff` | 쓰는 계정 · 중지 | 사내 계정 등록 |
| `/settings/codes` | 고칠 수 있음 · 잠김 | 기준 값 목록 등록 |

탭에는 **건수를 함께** 적는다. 눌러 보기 전에 몇 건인지 알아야 어디를 볼지 정한다.
맨 앞은 늘 `전체` 이고, 기본으로 켜지는 탭만 화면마다 다르다 — 문의가 `미답변` 로 시작하는
것은 그 목록을 여는 이유가 거의 언제나 답할 것을 찾는 일이기 때문이다.

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

여기 들어가는 것은 **도메인을 모르는 것**과, **두 어드민이 같은 것을 쓰기로 정한 것**이다.
뷰 하나가 곧 레포 하나이므로, 앱 안에 복사해 두면 레포를 나누는 순간 두 벌이 되어 어긋난다.

> **판단 기준이 바뀌었다.** 전에 이 자리에는 "목록 툴바나 셸처럼 화면 구조를 아는 것은 앱이
> 갖는다" 라고 적혀 있었다. 그 기준으로는 `ListToolbar` 도 `Modal` 도 앱에 남았어야 하는데,
> 둘 다 두 벌로 두는 동안 갈라졌다(§2.0). **기준은 "화면 구조를 아느냐" 가 아니라 "두 앱이
> 같은 것을 쓰기로 정했느냐" 다.** 셸이 여전히 앱에 있는 이유는 구조를 알아서가 아니라
> 사이드바 메뉴와 구분 표시가 **실제로 다르기** 때문이다.

| 이름 | 층 | 하는 일 | 이 앱에서 쓰는 파일 수 |
|---|---|---|---|
| `Badge` | 목록 | 상태 알약. 색이 아니라 **뜻**(`neutral`·`brand`·`ok`·`wait`·`danger`)을 받는다 | 16 |
| `Button` | 폼 | 폼·모달 아래줄의 단추 (h-9) | 1 (`InternalModal` 을 거쳐 등록 창 9장) |
| `Checkbox` | 폼 | 켜고 끄기. 네이티브 렌더는 OS 마다 달라 `appearance-none` 으로 직접 그린다 | 4 |
| `Dropdown` | 폼 | 네이티브 `<select>` 대신. 목록을 `body` 로 포털해 카드·모달의 `overflow` 에 잘리지 않는다 | 10 |
| `HintInput` | 폼 | 안내 문구가 있는 한 줄 입력란 | 13 |
| `ListToolbar` | 목록 | 윗줄에 상태 탭과 등록, 아랫줄에 검색과 필터. B2C Admin 과 같은 조각이다 | 13 |
| `Modal` | 폼 | 창을 여닫는 일 — Esc(맨 위 창만) · 스크롤 잠금 · 첫 요소 포커스 | 1 (`InternalModal` 이 감싼다) |
| `PageHeading` | 껍데기 | 화면 제목과 한 줄 설명 | 12 |
| `RowActions` · `RowIconButton` · `RowTextButton` | 목록 | 행 오른쪽 끝의 동작 (h-8) | 1 |
| `RowSelectCell` · `SelectAllCell` | 목록 | 표 맨 왼쪽 칸 — 체크박스와 순번 | 7 |
| `StatusScreen` | 알림 | 404 · 오류 · 완료 · 실패가 한 컴포넌트를 쓴다 | `app/not-found.tsx` · `app/error.tsx` · `/result` |
| `ToastProvider` · `useToast` | 알림 | 동작 결과 통지. 공급자는 `app/layout.tsx` 에 한 번만 둔다 | 14 |

**쓰지 않는 것**: `HintTextarea` · `ImageUploader` · `RichTextEditor` · 이미지 검사 도우미.
이 콘솔에는 긴 글을 쓰거나 그림을 올리는 화면이 없다 — 다루는 값이 설정과 숫자뿐이다.

### 4.0 상태 색은 `lib/data/*.ts` 에 **뜻으로** 적는다

`PLAN_TONE` · `SUPPORT_TONE` · `INVOICE_TONE` 같은 표 열두 개가 있는데, 값은 Tailwind
클래스가 아니라 `BadgeTone`(`'ok'` · `'neutral'` · …)이다. 전에는 클래스 문자열이 그대로
적혀 있었고 표마다 손으로 옮겨 적다 보니 실제 값은 넷뿐인데 표는 열두 개였다.

`SUPPORT_TONE` 에서 **`만료` 와 `만료 임박` 이 둘 다 `danger`** 인 것은 알고 둔 것이다.
토큰에 `signal-wait` 가 있지만 아직 쓰지 않는다 — 색을 바꾸는 것은 디자인 결정이라
`docs/design.md` 에 자리만 적어 두었다.

### 4.1 `placeholder` 를 쓰지 않는다

`HintInput` 과 `ListToolbar` 의 검색이 모두 안내 문구를 **실제 텍스트 노드**로 겹쳐 두고
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
- **두 어드민이 같은 것을 쓰기로 정한 조각을 앱 안에 두기** — `InternalModal` 이 그렇게
  갈라졌다 (§2.0). 반대로 한쪽만 쓰는 것을 올리지도 않는다 (§4)
- **Tailwind 클래스 문자열을 `lib/data/*` 에 담기** — 색은 뜻으로 적는다 (§4.0)
- **뱃지·단추의 클래스를 손으로 적기** — `Badge` · `Button` · `RowTextButton` 이 갖는다
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
