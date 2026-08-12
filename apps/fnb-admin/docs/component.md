# 컴포넌트 정의서 — F&B Admin

> 대상: `app/_components/**` · `app/<route>/_components/**` · `@winpilot/ui`
> 이름 규칙: `docs/coding-conventions.md` §2 (`Fnb` 접두어를 붙이는 자리와 붙이지 않는 자리)

**여기 적힌 것은 지금 저장소에 실제로 있는 것뿐이다.** "쓰이는 화면" 은 `import` 를 되짚어
적었고, 쓰이는 곳이 없으면 없다고 적었다. 있을 법한 컴포넌트를 미리 적지 않는다 — 적어 두면
다음 사람이 찾다가 없는 것을 만들었다고 생각한다.

## 1. 층

| 층 | 뜻 | 두는 곳 | 접두어 |
|---|---|---|---|
| **껍데기** | 화면 바깥 틀 — 사이드바 · 헤더 · 보조 메뉴 | `app/_components/` | `Fnb` |
| **목록** | 표 화면이 공통으로 쓰는 조각 — 툴바 · 표 · 카드 | `@winpilot/ui` | 없음 |
| **폼** | 입력 화면이 공통으로 쓰는 조각 — 저장 줄 · 항목 뼈대 | `app/_components/` · `app/<route>/_components/` | 위치에 따라 |
| **알림** | 되돌리기 어려운 동작 앞의 확인 창 · 결과 통지 | `@winpilot/ui` | 없음 |

경계는 **"이 조각이 갈래를 가로지르는가"** 다. 어느 화면에서나 불려 나오는 것은
`app/_components/` 에 두고 이름에 `Fnb` 를 박는다. 한 갈래 안에서만 도는 것은 그 갈래의
`_components/` 에 두고 접두어를 붙이지 않는다 — 폴더 경로가 이미 어느 화면의 것인지 말하고
있어서, 접두어를 더 붙이면 같은 말을 두 번 하게 된다.

**목록 층이 통째로 공유 패키지에 있는 것이 이 콘솔의 특징이다.** 표·툴바·카드를 앱이 갖지
않아서, `app/_components/` 에 남은 것은 껍데기와 폼뿐이다(§2).

## 2. `app/_components/` — 콘솔 전체가 쓰는 뼈대

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `FnbShell` | 껍데기 | 사이드바(최상위 메뉴) · 상단 헤더(현재 위치 · 계정 · 로그아웃) · 본문 왼쪽 보조 메뉴를 그린다. `lg` 미만에서는 사이드바가 칩 내비게이션으로 접힌다 | **33장** — 매니페스트의 모든 화면 |
| `FnbRecordForm` | 폼 | 폼 한 벌의 바깥 — 저장 줄과 저장 앞의 확인 창. `mode` 로 등록과 수정을 가르고, `validate` 로 각 폼의 검사를 받는다 | 9장 |
| `FnbField` | 폼 | 칸 하나 — 라벨 · 필수 표시 · 안내 문구 · 오류 문구를 함께 그린다 | 11장 — 폼이 아닌 `InquiryDetailView`·`PeriodFields` 도 쓴다 |
| `FnbTextInput` · `FnbReadonly` · `FnbToggle` · `FnbTextArea` · `FnbSelect` | 폼 | **모양은 공유 것이고 이름만 이 콘솔 것이다** — `@winpilot/ui` 의 `FormFields` 를 그대로 재수출한다 | 10 / 9 / 7 / 6 / 4 |
| `FaqListView` | 목록 | 자주 묻는 것 목록 한 벌. 창업과 고객센터가 `audience` 만 달리해 같은 것을 쓴다 | `/franchise/faqs` · `/support/faqs` |
| `FaqForm` | 폼 | 위와 같은 이유로 여기 있는 폼 한 벌. `audience` 는 고르는 칸이 아니라 **화면이 정해서 넘기는 값**이다 | `/franchise/faqs/*` · `/support/faqs/*` — 4장 |
| `DashboardView` | 목록 | 첫 화면의 카드 묶음 — 밀린 창업 문의와 지금 사이트에 걸린 것 | `/` 한 장 |
| `PickChips` | 폼 | 정해진 목록에서 **여럿 고르는 알약 줄**. 넣고 빼는 규칙까지 여기서 갖는다 | `MenuForm`(알레르기 · 표시) · `StoreForm`(되는 것) |
| `OctopusMark` | 껍데기 | 로고 자리에 서는 문어 실루엣 | `FnbShell` 한 곳 (§2.2) |

`FaqListView` · `FaqForm` · `DashboardView` · `PickChips` · `OctopusMark` 에 `Fnb` 가 붙어 있지
않은 것은 규칙에 어긋난 자리다 — `docs/coding-conventions.md` §2.1 에 적어 두었다.

`FnbSaveRow` 도 함께 재수출되지만 **부르는 곳이 없다.** 저장 줄은 `FnbRecordForm` 이 안에서
그리므로 폼이 따로 세울 일이 없다. 지우지 않고 두는 것은 저장 줄만 필요한 화면(읽기 전용 표에
단추 하나를 붙이는 자리)이 생길 수 있어서인데, 그런 화면이 끝내 안 생기면 지운다.

### 2.0 이 콘솔은 모달을 갖지 않는다

`app/_components/` 에 모달이 한 장도 없다. 뜨는 창은 **저장·삭제 확인 하나뿐**이고 그것은
`@winpilot/ui` 의 `ConfirmModal` 이다.

원래는 IR 어드민 안에만 있던 것을, 이 콘솔이 같이 쓰기로 하면서 올렸다. 콘솔마다 확인 창을
따로 두면 **나중에 만든 콘솔일수록 확인이 빠진다** — 실제로 그렇게 갈라진 자리를 세다가
`Badge` · `Button` · `Modal` 이 차례로 올라갔다(`@winpilot/ui` 머리말). 특히 모달 스택이 없는
쪽에서는 확인 창 위에서 Esc 를 누르면 **뒤의 입력 폼까지 함께 닫혔다.**

복사한 날에는 같았고 고친 날부터 갈라진다. 그래서 이 콘솔은 모달을 앱 안에 두지 않는다.

### 2.1 확인 창을 삭제에만 세우지 않는 이유

`FnbRecordForm` 은 삭제뿐 아니라 **저장 앞에도** 확인 창을 세운다. 여기서 저장하는 것은 전부
사이트에 그대로 나가는 값이라, 값이 틀리면 손님이 겪은 뒤에 우리에게 온다. 목록 한 줄 고치는
일과 같은 무게로 저장되면 안 되는 자리다.

확인 창의 값어치는 **막는 데 있지 않고 읽게 하는 데** 있다. 그래서 `detail` 에 무엇이 어디로
나가는지를 한 줄로 다시 적는다. 대신 **결과는 확인 창이 아니라 토스트로** 알린다
(`@winpilot/ui` 의 `useToast`) — 창이 두 번 뜨면 두 번째는 읽지 않고 닫는다.

### 2.2 `OctopusMark` 가 두 벌인 이유

같은 파일이 `apps/fnb-client-a/app/_components/OctopusMark.tsx` 에도 있다. **알고 두는 두
벌이다.**

이 브랜드는 아직 로고 원본 파일이 없다. 그림을 안 넘기면 `BrandMark` 자리에 다른 브랜드의
로고가 서고, 무료 사진을 받아 쓰면 **다른 집 문어**가 이 브랜드의 얼굴로 선다. 그래서 직접 그린
실루엣을 사이트와 콘솔이 함께 쓴다.

그런데 그 조각을 공유 패키지에 올릴 수 없다. `@winpilot/ui` 는 **자기가 무엇을 담는지 모르는**
자리이고(그 패키지 머리말), 특정 브랜드의 그림은 도메인을 아는 것이다. 그렇다고 한쪽 앱에서
다른 쪽 앱을 부를 수도 없다 — 뷰 하나가 곧 레포 하나라는 전제가 그 순간 깨진다.

이것이 §6 의 승격 기준("두 앱이 같은 것을 쓰기로 정했느냐")만으로는 결정이 나지 않는 자리다.
두 앱이 같은 것을 쓰기로 정한 것은 맞지만, **올라갈 곳이 없다.** 그래서 두 벌로 두고 대신
사라질 조건을 적어 둔다 — 로고 원본을 받는 날 `mark` 를 넘기던 두 줄만 지우면 `BrandMark` 가
파일을 쓰고 두 벌 다 없어진다.

## 3. `components/domain/` — 자원을 아는 조각

**이 앱에는 `components/` 폴더 자체가 없다.**

자원을 아는 조각이 없다는 뜻은 아니다. `PickChips`(알레르기 · 되는 것)와
`banners/_components/PeriodFields`(거는 기간)가 그것인데, 둘 다 **쓰는 화면 옆**에 있다.
폴더를 먼저 만들어 두지 않는 이유는 조각이 둘뿐이어서다 — 한 층을 위해 폴더를 파면 그 층에
무엇이 들어가야 하는지 다음 사람이 매번 다시 판단하게 된다.

도메인을 모르는 원시 요소는 앱이 갖지 않고 `@winpilot/ui` 한 곳에 둔다 (§5).

## 4. `app/<route>/_components/` — 갈래 안에서 나눠 쓰는 뼈대

화면 하나만 쓰는 조각은 여기 적지 않는다. **두 화면 이상이 나눠 쓰는 것만** 적는다.

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `banners/_components/PeriodFields` | 폼 | 거는 기간 두 칸과 그 검사(`dateBroken` · `periodBackwards`). 시작은 반드시 있고, 종료를 비우면 상시이며, 앞뒤가 뒤집히면 막는다 | `/banners/main/*` · `/banners/popups/*` |
| `menus/[menuId]/_components/MenuForm` | 폼 | 메뉴 등록·수정 폼 한 벌 | `/menus/new` · `/menus/[menuId]` |
| `stores/[storeId]/_components/StoreForm` | 폼 | 가맹점 등록·수정 폼 한 벌 | `/stores/new` · `/stores/[storeId]` |
| `marketing/[postId]/_components/MarketingForm` | 폼 | 마케팅 글 등록·수정 폼 한 벌 | `/marketing/new` · `/marketing/[postId]` |
| `banners/main/[bannerId]/_components/BannerForm` | 폼 | 메인 비주얼 등록·수정 폼 한 벌 | `/banners/main/new` · `/banners/main/[bannerId]` |
| `banners/popups/[popupId]/_components/PopupForm` | 폼 | 팝업 등록·수정 폼 한 벌 | `/banners/popups/new` · `/banners/popups/[popupId]` |
| `support/notices/_components/NoticeForm` | 폼 | 공지 등록·수정 폼 한 벌 | `/support/notices/new` · `/support/notices/[noticeId]` |
| `settings/admins/[adminId]/_components/AdminForm` | 폼 | 관리자 등록·수정 폼 한 벌. 여기 `Admin` 은 메뉴 라벨 '관리자' 이고 엔티티는 `staff` 다 | `/settings/admins/new` · `/settings/admins/[adminId]` |
| `inquiries/_components/InquiryListView` | 목록 | 창업 문의 목록. 상태 색 표(`INQUIRY_TONE`)를 함께 내보내 상세 화면이 같은 색을 쓴다 | `/inquiries` · `InquiryDetailView` |

등록 화면과 상세 화면이 같은 `*Form` 을 쓰는 것은 **상세가 곧 수정 화면**이기 때문이다.
갈리는 것은 셋뿐이라 `mode` 인자 하나로 족하다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
토스트. 그 경계는 `docs/path.md` §3 에 적혀 있다.

목록 본체(`*ListView`)는 전부 한 화면만 쓴다. 갈래 폴더(`banners/_components/`)에 둔 것은
배너와 팝업이 **같은 상태 규칙**(`bannerState()`)을 읽기 때문이지 두 화면이 같은 목록을 쓰기
때문이 아니다.

### 4.1 `Modal` 을 감싸 쓰는 모달

| 이름 | 여는 화면 |
|---|---|
| `ConfirmModal` (`@winpilot/ui`) | 폼 11장의 저장 · 목록의 삭제 |

**이 표에 앱의 파일이 한 줄도 없다.** 목록 한 장으로 끝나는 자원이 모달 폼을 갖는 다른 콘솔과
달리, 여기는 자원마다 등록·상세 화면을 따로 둔다 — 메뉴·가맹점·배너는 한 화면에 담을 값이
많고, 값이 적은 자원(메뉴 묶음 · 창업 비용)은 아예 읽기 전용이다. 그 경계는 `docs/path.md` §3
에 있다.

## 5. `@winpilot/ui` — 앱들이 나눠 쓰는 원시 요소

여기 들어가는 것은 **도메인을 모르는 것**과, **두 앱이 같은 것을 쓰기로 정한 것**이다.
뷰 하나가 곧 레포 하나이므로 앱 안에 복사해 두면 레포를 나누는 순간 두 벌이 되어 어긋난다.

**셸은 여전히 앱이 갖는다** — 사이드바 메뉴도, 어느 콘솔인지 알리는 워드마크(`F&B`)도 실제로
다르기 때문이다. 반대로 표(`RecordTable`)와 카드(`Panel`)는 올라갔다. 폼 뼈대가 아직 앱에 남아
있는 이유는 §6 아래에 적는다.

숫자는 그 이름을 쓰는 **파일 수**다 (fnb-admin / fnb-client-a). `/docs` 아래는 세지 않았다.

| 이름 | 층 | 하는 일 | 쓰는 파일 |
|---|---|---|---|
| `Panel` · `PanelSummary` | 목록 | 제목 한 줄이 붙는 카드. 목록·폼·읽기 전용 표가 전부 이 안에 들어간다 | 13 / 0 |
| `RecordTable` | 목록 | 12칸 그리드 표 한 벌 — 머리글 · 행 · 선택 · 빈 상태 · 총 건수. 열 폭은 `RecordColumn` 의 `span` 으로 받는다 | 9 / 0 |
| `ListToolbar` | 목록 | 윗줄에 상태 탭과 주요 액션, 아랫줄에 검색과 거르개. 넘겨받지 않은 것은 그 줄이나 단추를 그리지 않는다 | 9 / 0 |
| `PageHeading` | 껍데기 | 화면 제목과 한 줄 설명, 오른쪽 보조 자리 | 13 / 0 |
| `Badge` | 목록 | 상태 알약. 색이 아니라 **뜻**(`neutral`·`brand`·`ok`·`wait`·`danger`)을 받는다 | 13 / 1 |
| `Dropdown` | 폼 | 네이티브 `<select>` 대신. 목록을 `body` 로 포털해 카드의 `overflow` 에 잘리지 않는다 | 3 / 2 |
| `Field` · `RequiredLegend` | 폼 | 라벨 · 안내 · 오류를 함께 그리는 칸 (`FnbField` 가 이것이다) | 1 / 1 |
| `Readonly` · `TextInput` · `TextArea` · `Select` · `Toggle` · `SaveRow` | 폼 | 폼 칸 여섯. `FnbForm.tsx` 가 이름만 바꿔 재수출한다 | 1 / 0 |
| `Button` | 폼 | 폼·모달 아래줄의 단추 (h-9). `primary`·`secondary`·`danger` | 2 / 1 |
| `ConfirmModal` | 알림 | 저장·삭제 앞의 확인 창. 언제나 다른 창 위에서 열리므로 `elevated` 다 | 1 / 0 |
| `BackLink` | 껍데기 | 상세 화면에서 목록으로 돌아가는 줄 | 1 / 1 |
| `BrandMark` | 껍데기 | 로고 · 이름 · 워드마크 한 묶음. 로고 파일이 없어 `mark` 로 문어를 넘긴다 (§2.2) | 1 / 2 |
| `StatusScreen` | 알림 | 404 · 오류가 한 컴포넌트를 쓴다 | 2 / 2 |
| `ToastProvider` · `useToast` | 알림 | 동작 결과 통지. 공급자는 `app/layout.tsx` 에 한 번만 둔다 | 2 / 1 |

`HintInput` · `HintTextarea` · `Checkbox` · `RowActions` · `ImageUploader` · `RichTextEditor` ·
`Modal` 은 이 패키지에 있지만 **이 콘솔이 쓰지 않는다.** 쓰지 않는 이유는 각각 다르다 — 폼 칸은
`FormFields` 쪽을 쓰고, 행 동작과 선택은 `RecordTable` 이 안에서 그리고, 이미지와 본문 편집기는
아직 붙일 화면이 없다.

### 5.0 단추가 둘로 갈린 이유 — `Button`(36px) 과 `RowTextButton`(32px)

크기가 아니라 **서는 자리**로 갈랐다. 행은 한 줄에 대여섯 칸이 들어가는 자리라 36px 단추를
넣으면 줄 높이가 그 단추에 끌려간다. 하나의 `size` 로 묶지 않는 것은, 자리가 다르면 나중에
갈라질 것(테두리 색 · 아이콘 짝 · 접근성 라벨 규칙)도 다르기 때문이다.

**이 콘솔은 행 단추를 직접 쓰지 않는다.** `RecordTable` 이 행 오른쪽 끝의 조회·삭제를 안에서
그리므로, 앱 코드에는 32px 짜리가 한 자리도 나오지 않는다. 규칙을 여기 적어 두는 것은 표를 쓰지
않는 화면(대시보드 카드 · 읽기 전용 표)에서 단추를 손으로 놓게 되는 날을 위해서다.

### 5.1 `placeholder` — 이 콘솔은 두 방식이 섞여 있다

목록 툴바의 검색은 안내 문구를 **실제 텍스트 노드**로 겹쳐 두고 CSS 로만 숨긴다. 반면 폼 칸
(`FnbTextInput` · `FnbTextArea`)은 네이티브 `placeholder` 속성을 그대로 쓴다 — 기간 칸의
`2026-08-05` 가 그렇다.

**둘째 쪽은 Figma 에서 빈 상자로 나온다.** `placeholder` 는 DOM 텍스트 노드가 아니라 추출되지
않기 때문이다(`docs/spec/05-component.md`). 지금은 값이 빈 채로 캡처되는 화면이 등록 폼뿐이라
그대로 두었고, 등록 화면을 캡처 대상에 넣는 날 툴바와 같은 방식으로 옮겨야 한다. **모르고 둔
것이 아니라 알고 둔 것**이다.

같은 이유로 아이콘은 전부 인라인 SVG 다. 아이콘 폰트나 이미지로 두면 글리프·비트맵이 되어
벡터로 복원되지 않는다.

## 6. 금지 사항

- 같은 역할의 컴포넌트를 화면마다 복제하기 — 세 벌이 되면 한 벌만 고쳐진다
- 도메인을 모르는 원시 요소를 앱 안에 두기 (`@winpilot/ui` 로 간다)
- **두 앱이 같은 것을 쓰기로 정한 조각을 앱 안에 두기** — `Modal` 이 그렇게 갈라졌다 (§2.0)
- 두 앱 중 하나만 쓰는 조각을 `@winpilot/ui` 에 올리기 — 올릴지 말지의 기준은 "화면 구조를
  아느냐" 가 아니라 **"두 앱이 같은 것을 쓰기로 정했느냐"** 다. 셸이 여전히 앱에 있는 이유가
  이것이고, 폼 뼈대(`FnbRecordForm`)가 아직 안 올라간 이유는 조금 다르다 — **저장한 뒤 어디로
  가는가**가 콘솔마다 달라 라우팅을 아는 조각이 되는데, 공유 패키지는 `next` 에 기대지 않는다
- 그 기준으로도 답이 안 나오는 자리는 **두 벌인 것과 사라질 조건을 함께 적는다** (`OctopusMark`, §2.2)
- Tailwind 클래스 문자열을 **값 쪽 파일**(`packages/store`)에 담기 — 색은 `BadgeTone` 처럼 뜻으로
  적고 클래스는 컴포넌트만 안다
- `app/<route>/_components/` 의 조각에 `Fnb` 접두어 붙이기
- 인라인 `style` 속성 · raw hex · raw px (`docs/design.md` §9)

## 7. 아직 없는 것

- **`components/` 폴더** — 앱 전용 원시 요소도, 도메인 조각을 모아 둘 층도 아직 필요해진 적이 없다 (§3).
- **컴포넌트 갤러리** — `library` 동작으로 등록된 화면이 이 뷰에 없다. 컴포넌트의 상태 변형을
  한자리에 그려 둔 곳이 없어, Figma ComponentSet 으로 넘길 면도 아직 없다.
- **날짜 입력** — 기간을 받는 화면(배너 · 팝업)이 `FnbTextInput` 에 글자로 받고 정규식으로 모양만
  검사한다. `type="date"` 는 `TextInput` 이 받을 수 있지만 쓰는 곳이 없다.
- **이미지 올리기** — 메뉴 사진·매장 사진 자리가 값(경로)만 받는다. `ImageUploader` 가 공유
  패키지에 있으나 이 콘솔에서 부르는 곳이 없다.
- **로그인 화면** — 헤더 오른쪽에 로그아웃 링크가 있고 주소(`/login`)도 맞춰 두었지만 화면이
  없다. 다른 콘솔과 같은 자리에 같은 것이 있어야 오가는 사람이 찾는다.
