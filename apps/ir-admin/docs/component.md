# 컴포넌트 정의서 — IR Admin

> 대상: `app/_components/**` · `app/<route>/_components/**` · `@winpilot/ui`
> 이름 규칙: `docs/coding-conventions.md` §2 (`Ir` 접두어를 붙이는 자리와 붙이지 않는 자리)

**여기 적힌 것은 지금 저장소에 실제로 있는 것뿐이다.** "쓰이는 화면" 은 `import` 를 되짚어
적었고, 쓰이는 곳이 없으면 없다고 적었다. 있을 법한 컴포넌트를 미리 적지 않는다 — 적어 두면
다음 사람이 찾다가 없는 것을 만들었다고 생각한다.

## 1. 층

| 층 | 뜻 | 두는 곳 | 접두어 |
|---|---|---|---|
| **껍데기** | 화면 바깥 틀 — 사이드바 · 헤더 · 보조 메뉴 | `app/_components/` | `Ir` |
| **목록** | 표 화면이 공통으로 쓰는 조각 — 툴바 · 표 · 카드 | `app/_components/` · `@winpilot/ui` | 위치에 따라 |
| **폼** | 입력 화면이 공통으로 쓰는 조각 — 뼈대 · 입력 칸 · 모달 | `app/_components/` · `app/<route>/_components/` | 위치에 따라 |
| **알림** | 되돌리기 어려운 동작 앞의 확인 창 · 결과 통지 | `app/_components/` · `@winpilot/ui` | 위치에 따라 |

경계는 **"이 조각이 갈래를 가로지르는가"** 다. 어느 화면에서나 불려 나오는 것은
`app/_components/` 에 두고 이름에 `Ir` 을 박는다. 한 갈래 안에서만 도는 것은 그 갈래의
`_components/` 에 두고 접두어를 붙이지 않는다 — 폴더 경로가 이미 어느 화면의 것인지 말하고
있어서, 접두어를 더 붙이면 같은 말을 두 번 하게 된다.

## 2. `app/_components/` — 어드민 전체가 쓰는 뼈대

열한 장이다. 그중 넷은 `@winpilot/ui` 를 그대로 내보내는 **겹**이고, 왜 남겨 두는지는 §2.0 에 있다.

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `IrShell` | 껍데기 | 사이드바(최상위 메뉴) · 상단 헤더(현재 위치 · 로그아웃) · 본문 왼쪽 보조 메뉴를 그린다. `lg` 미만에서는 사이드바가 칩 내비게이션으로 접힌다 | **44장** — `/docs/**` 를 뺀 모든 화면 |
| `IrPanel` · `IrEmpty` · `IrSummary` · `IrTableHead` · `IrTableFoot` | 목록 | 카드 · 빈 상태 · 요약 숫자 · 표 머리와 발. `@winpilot/ui` 의 `Panel` 묶음을 그대로 내보낸다 | `IrPanel` **19장** · `IrSummary` 1장(`/statistics`) · **나머지 셋은 쓰는 곳이 없다**(§2.2) |
| `IrRecordTable` · `IrColumn` | 목록 | 목록 표 한 벌 — 맨 왼쪽 선택 칸, 오른쪽 끝 관리, 아래 총 건수. 열두 칸 중 **아홉만** 넘긴다 | **14장** — 목록 화면 전부 |
| `IrRecordForm` (`IrReadonly` · `IrTextInput` · `IrTextArea` · `IrSelect` · `IrToggle` 을 함께 내보낸다) | 폼 | 등록·수정 화면의 공통 뼈대. `mode` 하나로 등록과 수정을 겸하고, **저장 앞에 확인 창을 세운다** | 7장 — `*Form` 여섯과 `OfferingForm` |
| `IrForm` (`IrField` · `IrPrimaryButton` · `IrGhostButton` · `IrSaveRow`) | 폼 | 입력 한 칸(라벨 · 별표 · 안내 · 오류)과 저장 줄 | `IrField` **14장** · `IrSaveRow` 8 · `IrPrimaryButton` 8 · `IrGhostButton` 2 |
| `IrConfirmModal` | 알림 | 되돌리기 어렵거나 사이트에 나가는 동작 앞의 확인 창. `tone` 으로 삭제(danger)와 저장(brand)을 가른다 | 8장 + `IrRecordForm` 을 통해 7장 = **열다섯 화면** |
| `IrModal` | 폼 | 목록 위에서 뜨는 등록·수정 창. 아래줄은 언제나 취소·저장 둘 | **1장** — `/settings/locales` |
| `IrSegmented` | 목록 | 몇 안 되는 것 중 지금 보는 하나를 고르는 줄. 고른 것을 색이 아니라 **떠오름**(바탕 + 얕은 그림자 + 굵기)으로 알린다 | `DashboardView` — 한 화면에 두 줄(기간 · 잣대) |
| `DashboardView` | 껍데기 | 대시보드 본문 — 기간 세그먼트 · 지역 지도 · 요약 숫자 | `/` 한 장 |
| `KoreaMap` | 목록 | 시·도별 문의 건수를 실제 경계선 위에 얹은 지도 | `DashboardView` 하나 |
| `OfferingForm` | 폼 | 파는 것 하나의 상세 폼 — **말은 고치고 구조는 못 고친다** | `/products/[productId]` · `/services/[serviceId]` · `/solutions/[solutionId]` |

뒤의 셋(`DashboardView` · `KoreaMap` · `OfferingForm`)은 이 폴더에 있으면서 접두어가 없다.
어긋난 자리로 `docs/coding-conventions.md` §2.1 에 적어 두었다.

### 2.0 이 폴더의 절반은 겹이다

`IrPanel` · `IrRecordTable` · `IrConfirmModal` 과 `IrForm` 의 `IrSaveRow` 는 **한 줄짜리
재수출**이다. 실제 구현은 `@winpilot/ui` 에 있다.

```ts
// app/_components/IrRecordTable.tsx
export { RecordTable as IrRecordTable, type RecordColumn as IrColumn } from '@winpilot/ui';
```

이 조각들은 원래 이 콘솔 안에 있었고, F&B 어드민이 같은 것을 쓰기로 정해지면서 올라갔다.
올릴지 말지의 기준은 "화면 구조를 아느냐" 가 아니라 **"두 앱이 같은 것을 쓰기로 정했느냐"** 다.

**겹을 지우지 않는 이유는 import 를 한꺼번에 고치기 싫어서가 아니다.** 이 콘솔이 앞으로 갈라질
수 있는 자리를 한 곳으로 유지하려는 것이다 — IR 어드민에만 필요한 칸이 생기는 날 고치는 곳이
여기 한 곳이면 된다. `IrField` 가 `Field` 를 감싸는 것도 같은 판단이고, 실제로 그 겹에서
`required` 가 새로 붙었다(전에는 이 콘솔의 폼에 필수 표시가 아예 없었다).

셸은 올리지 않는다. 사이드바 메뉴도 워드마크도 콘솔마다 실제로 다르다.

### 2.1 확인 창을 삭제에만 세우지 않는 이유

`IrConfirmModal` 은 삭제뿐 아니라 등록·저장 앞에도 선다. **여기서 저장하는 것은 전부 사이트에
그대로 나가는 값**이라, 목록 한 줄 고치는 일과 같은 무게로 저장되면 안 되기 때문이다.

확인 창의 값어치는 막는 데 있지 않고 **읽게 하는 데** 있다. 그래서 `detail` 에 무엇이 어디로
나가는지를 한 줄로 다시 적는다. 대신 **결과는 확인 창이 아니라 토스트로** 알린다
(`@winpilot/ui` 의 `useToast`) — 확인 창이 두 번 뜨면 두 번째는 읽지 않고 닫는다.

### 2.2 쓰는 곳이 없는 셋

`IrEmpty` · `IrTableHead` · `IrTableFoot` 은 내보내기만 하고 부르는 화면이 없다. 목록 표를
`IrRecordTable` 한 벌이 통째로 그리면서, 빈 상태도 머리도 발도 그 안으로 들어갔기 때문이다.

지우지 않고 두는 이유는 표를 쓰지 않는 화면(대시보드 · 통계)이 카드 하나를 직접 짤 때 필요하기
때문이고, **쓰는 곳이 없다는 사실 자체가 읽을 값이 있는 정보**다 — 지금 이 콘솔에 직접 짠 표가
하나도 없다는 뜻이다.

## 3. `components/domain/` — 자원을 아는 조각

**이 폴더는 이 앱에 없다.** 자원을 아는 조각은 전부 그 자원의 라우트 아래(`app/<route>/_components/`)에
있고, 여러 갈래를 가로지르는 것은 `app/_components/` 로 올라간다 — 그 사이에 층을 하나 더
만들 만큼 겹치는 조각이 아직 없었다.

`components/ui/` 도 없다. 도메인을 모르는 원시 요소는 앱이 갖지 않고 `@winpilot/ui` 한 곳에
둔다 (§5).

## 4. `app/<route>/_components/` — 갈래 안에서 나눠 쓰는 뼈대

화면 하나만 쓰는 조각은 여기 적지 않는다. **두 화면 이상이 나눠 쓰는 것만** 적는다.
라우트 아래 조각은 서른한 장인데, 그중 여섯이 여기 해당한다.

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `banners/_components/BannerForm` | 폼 | 배너·팝업 등록·수정 폼 한 벌 | `/banners/new` · `/banners/[bannerId]` · `/banners/popups/new` · `/banners/popups/[popupId]` |
| `company/credentials/_components/CredentialForm` | 폼 | 특허·인증 등록·수정 폼 한 벌 | `/company/credentials/new` · `/company/credentials/[credentialId]` |
| `company/history/_components/MilestoneForm` | 폼 | 연혁 등록·수정 폼 한 벌 | `/company/history/new` · `/company/history/[milestoneId]` |
| `contents/faqs/_components/FaqForm` | 폼 | FAQ 등록·수정 폼 한 벌 | `/contents/faqs/new` · `/contents/faqs/[faqId]` |
| `contents/news/_components/NewsForm` | 폼 | 뉴스 등록·수정 폼 한 벌 | `/contents/news/new` · `/contents/news/[newsId]` |
| `contents/notices/_components/NoticeForm` | 폼 | 공지 등록·수정 폼 한 벌 | `/contents/notices/new` · `/contents/notices/[noticeId]` |

등록 화면과 상세 화면이 같은 `*Form` 을 쓰는 것은 **상세가 곧 수정 화면**이기 때문이다.
그 이유는 `docs/path.md` §3 에 적혀 있다.

`BannerForm` 만 네 화면이 쓴다. 배너와 팝업이 **자리만 다르고 받는 값이 같아서**다 — 제목 ·
본문 · 링크 · 기간 · 노출. 두 폼으로 나누면 칸을 하나 더할 때 두 곳을 고쳐야 하고, 그러다
한쪽에만 있는 칸이 생긴다.

나머지 스물다섯은 화면 하나가 통째로 쓰는 본체다. 이름 관례(`*ListView` · `*SettingsView` ·
`*Form` · 그 밖의 `*View`)와 개수는 `docs/coding-conventions.md` §8.3 에 있다.

### 4.1 `Modal` 을 감싸 쓰는 모달

| 이름 | 여는 화면 |
|---|---|
| `IrConfirmModal` | (§2 참고 — 열다섯 화면) |
| `IrModal` | `/settings/locales` |

**이 콘솔에는 목록 위에서 뜨는 등록 창이 한 자리뿐이다.** 국문·영문 짝은 한 줄에 들어가는 값이
둘(국문 원고 · 영문 원고)뿐이라 화면을 따로 세우면 목록 → 등록 → 저장 → 목록으로 네 번 오간다.
나머지 자원은 값이 많아 전부 화면을 따로 가진다 — 그 경계는 `docs/path.md` §3 에 있다.

## 5. `@winpilot/ui` — 여러 앱이 나눠 쓰는 원시 요소

여기 들어가는 것은 **도메인을 모르는 것**과, **두 앱 이상이 같은 것을 쓰기로 정한 것**이다.
뷰 하나가 곧 레포 하나이므로 앱 안에 복사해 두면 레포를 나누는 순간 두 벌이 되어 어긋난다.

숫자는 그 이름을 **직접 import 하는 파일 수**다 (ir-admin / ir-client-a). `Panel` · `RecordTable` ·
`ConfirmModal` · `SaveRow` 처럼 이 콘솔이 `Ir*` 겹을 거쳐 쓰는 것은 그 겹의 이름으로 세어 §2 에
적었다 — 여기서는 0 으로 보인다.

| 이름 | 층 | 하는 일 | 쓰는 파일 |
|---|---|---|---|
| `PageHeading` | 껍데기 | 화면 제목과 한 줄 설명 | 25 / 0 |
| `Badge` | 목록 | 상태 알약. 색이 아니라 **뜻**(`neutral`·`brand`·`ok`·`wait`·`danger`)을 받는다 | 23 / 3 |
| `ListToolbar` · `ALL_VALUE` | 목록 | 윗줄에 상태 탭과 주요 액션, 아랫줄에 검색과 필터. 넘겨받지 않은 것은 그 줄이나 단추를 그리지 않는다 | 11 / 0 |
| `ToastProvider` · `useToast` | 알림 | 동작 결과 통지. 공급자는 `app/layout.tsx` 에 한 번만 둔다 | 9 / 2 |
| `StatusScreen` | 알림 | 404 · 오류 · 완료 · 실패가 한 컴포넌트를 쓴다 | 3 / 2 |
| `BrandMark` | 껍데기 | 회사 이름 옆의 워드마크. 어느 콘솔인지는 색이 아니라 이 글자(`IR`)가 말한다 | 1 / 2 |
| `BackLink` | 껍데기 | 상세에서 목록으로 돌아가는 줄 | 1 / 1 |
| `Button` | 폼 | 모달 아래줄의 단추 (h-9). `primary`·`secondary`·`danger` | 1 / 2 |
| `Field` | 폼 | 라벨 · 별표 · 안내 · 오류를 함께 그리는 입력 한 칸 | 1 / 2 |
| `HintInput` | 폼 | 안내 문구가 있는 한 줄 입력란 | 1 / 2 |
| `HintTextarea` · `RequiredLegend` | 폼 | 여러 줄 입력란과 `* 는 필수` 안내 | 0 / 1 |
| `Modal` | 폼 | 모달의 바탕 — Esc 로 닫고, 본문 스크롤을 잠그고, 첫 입력 요소로 포커스를 옮긴다. 겹쳐 뜬 경우 **맨 위 모달만** Esc 에 반응한다 | 1 / 0 |
| `Checkbox` | 목록 | 네이티브 렌더는 OS 마다 달라 `appearance-none` 으로 직접 그린다 | 0 / 1 |

**이 콘솔이 쓰지 않는 것도 적어 둔다.** `Dropdown` · `ImageUploader` · `RichTextEditor` ·
`RowActions` 묶음 · `RowSelectCell` 은 `@winpilot/ui` 에 있지만 여기서 한 번도 부르지 않는다 —
행 동작과 선택 칸은 `RecordTable` 안에서 쓰이고, 이미지 올리기와 본문 편집기는 이 콘솔의 폼에
아직 자리가 없다.

### 5.0 단추가 둘로 갈린 이유 — `Button`(36px) 과 `RowTextButton`(32px)

크기가 아니라 **서는 자리**로 갈랐다. 행은 한 줄에 대여섯 칸이 들어가는 자리라 36px 단추를
넣으면 줄 높이가 그 단추에 끌려간다. 하나의 `size` 로 묶지 않는 것은, 자리가 다르면 나중에
갈라질 것(테두리 색 · 아이콘 짝 · 접근성 라벨 규칙)도 다르기 때문이다.

이 콘솔에서 두 단추를 직접 부르는 자리는 거의 없다. 36px 은 모달 아래줄 한 곳이고, 32px 은
`RecordTable` 안에서만 선다. 대신 폼 화면의 44px 단추는 이 앱이 들고 있다
(`IrPrimaryButton` · `IrGhostButton`) — 두 앱이 같은 폼 뼈대를 쓰기로 정한 적이 없어 올릴
근거가 아직 없다.

### 5.1 `placeholder` 를 쓰지 않는다

`HintInput` · `HintTextarea` · `ListToolbar` 의 검색이 모두 안내 문구를 **실제 텍스트
노드**로 겹쳐 두고 CSS 로만 숨긴다. `placeholder` 속성은 DOM 텍스트 노드가 아니라 추출되지
않고 Figma 에서 빈 상자로 나온다 (`docs/spec/05-component.md`).

같은 이유로 아이콘은 전부 인라인 SVG 다. 아이콘 폰트나 이미지로 두면 글리프·비트맵이 되어
벡터로 복원되지 않는다.

## 6. 금지 사항

- 같은 역할의 컴포넌트를 화면마다 복제하기 — 세 벌이 되면 한 벌만 고쳐진다
- 도메인을 모르는 원시 요소를 앱 안에 두기 (`@winpilot/ui` 로 간다)
- **두 앱이 같은 것을 쓰기로 정한 조각을 앱 안에 두기** — 복사한 날에는 같고 고친 날부터 갈라진다
- 두 앱 중 하나만 쓰는 조각을 `@winpilot/ui` 에 올리기 — 올릴지 말지의 기준은 "화면 구조를
  아느냐" 가 아니라 **"두 앱이 같은 것을 쓰기로 정했느냐"** 다. 셸이 여전히 앱에 있는 이유가
  이것이고, `IrShell` · `IrSegmented` 가 안 올라간 이유도 같다
- Tailwind 클래스 문자열을 **값 쪽 파일**(`packages/store`)에 담기 — 색은 `BadgeTone` 처럼 뜻으로
  적고 클래스는 컴포넌트만 안다
- 같은 톤 표를 두 화면에 적기 — 지금 문의 상태 표가 목록과 상세에 두 벌이다
  (`docs/coding-conventions.md` §8.1.1)
- `app/<route>/_components/` 의 조각에 `Ir` 접두어 붙이기
- 인라인 `style` 속성 · raw hex · raw px (`docs/design.md` §9)

## 7. 아직 없는 것

- **로그인 화면** — 헤더 오른쪽 위의 `로그아웃` 이 `/login` 을 가리키는데 그 주소에 화면이 없다.
  자리만 B2C 어드민과 맞춰 두었다.
- **컴포넌트 갤러리** — 상태 변형을 한자리에 그려 둔 화면이 없다. 지금 컴포넌트의 상태는 각
  화면을 열어야 볼 수 있다.
- **날짜 입력** — 기간을 받는 화면(배너·팝업)이 글자로 받는다. `type="date"` 도 날짜 선택
  컴포넌트도 쓰는 곳이 없고, 대신 `lib/validation/form.ts` 의 `DATE` 가 모양을 본다.
- **이미지 올리기 · 본문 편집기** — `@winpilot/ui` 에 `ImageUploader` 와 `RichTextEditor` 가 있는데
  이 콘솔의 폼은 둘 다 쓰지 않는다. 사이트에 나가는 그림과 본문을 지금은 값으로만 받는다.
- **직접 짠 표** — 목록은 전부 `IrRecordTable` 한 벌이다. 그래서 `IrTableHead` · `IrTableFoot` 을
  부르는 화면이 없다 (§2.2).
