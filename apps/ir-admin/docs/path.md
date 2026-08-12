# Path 정의서 — IR Admin

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm docs:check`(문서 ↔ 화면)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| IR Admin | *(없음)* | `Ir` | `apps/ir-admin` |
| IR Client | *(없음)* | *(없음)* | `apps/ir-client-a` |

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/contentsNotices` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/notice/N-001` |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/products/publish` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[slug]` |
| 후행 슬래시·확장자 없음 | | `/products/`, `/products.html` |

## 3. 동작별 경로 꼬리

| 동작 | 꼬리 | 이 콘솔의 예 |
|---|---|---|
| 목록 | *(없음)* | `/products` · `/contents/notices` · `/banners` |
| 등록 | `/new` | `/contents/news/new` · `/company/history/new` |
| 상세·수정 | `/[id]` | `/products/[productId]` · `/banners/[bannerId]` |
| 설정 | 자원 아래 이름 | `/products/settings` · `/inquiries/settings` |

**등록 경로가 없는 자원이 있다.** 제품 · 문제 · 해법 · 서비스가 그렇다 — 상세 화면이 코드로
짜여 있어, 목록에 한 줄 더한다고 사이트에 화면이 생기지 않는다.

## 4. 갈래별 경로 — 사이드바와 나란하다

| 사이드바 | 경로 |
|---|---|
| 대시보드 | `/` |
| 문의 | `/inquiries` · `/inquiries/[inquiryId]` · `/inquiries/settings` |
| 콘텐츠 | `/contents/{notices,news,faqs}` |
| 제품 | `/products` · `/products/[productId]` · `/products/settings` |
| 서비스 | `/services` · `/services/[serviceId]` · `/services/settings` |
| 회사 | `/company/{about,history,credentials}` |
| 배너 | `/banners` · `/banners/popups` |
| 통계 | `/statistics` · `/statistics/{period,pages}` |
| 설정 | `/settings/{supplier,seo,terms,privacy,locales}` |

사이드바의 `제품` 이 `/products` 인데 값은 `SOLUTIONS` 다. 한때 이름이 `솔루션` 이었는데
사이트에서 SOLUTION 이 **서비스 둘**을 뜻하게 되면서 어드민에서는 반대를 가리키게 되어
이름만 고쳤다. 주소는 두었다 — 밖에서 들어오는 화면이 아니라 메뉴로만 여는 자리라 얻을 것이
없다.

## 5. 공시 · 재무 · 주주 · 자료를 지웠다

`/disclosures` · `/disclosures/dart` · `/financials` · `/financials/stock` ·
`/financials/dividends` · `/shareholders/meetings` · `/shareholders/governance` ·
`/library` · `/library/schedules` · `/library/notifications` — **열 화면이 있었고 지웠다.**

이 콘솔이 처음에는 공시 중심이었는데 실제로 손대는 것은 회사 홈페이지였다. 사이드바에서
뺐다가, `IR` 갈래로 되돌렸다가, 다시 뺐다가, 결국 화면째 지웠다. 되돌렸던 근거는 그 열 안에
**되돌릴 수 없는 공시 게시**가 있다는 것이었는데, 운영이 필요 없다고 정했다.

매니페스트의 **80번대를 비워 둔다.** 번호를 90번대로 당기지 않는 이유: 비워 두면 여기 무엇이
있었는지가 번호로 남고, 되살리는 날 같은 자리에 들어간다.

**투자자 사이트는 그대로다.** `apps/ir-client-a` 의 공시 · 재무 · 주주 · 자료 화면 열하나가
`@winpilot/store` 의 `ir.ts` 를 직접 읽으므로 계속 그린다 — 다만 이제 **저장소 어디에도 고치는
자리가 없다.** 사이트에서 그 화면들까지 내리기로 하면 그때 `ir.ts` 를 함께 지운다.

### 아직 메뉴 밖인 화면 넷

| 갈래 | 주소 | 왜 |
|---|---|---|
| 문제 · 해법 | `/solutions` · `/solutions/settings` · `/solutions/[solutionId]` | **제품 갈래와 겹친다** — 둘이 `SOLUTIONS` 라는 같은 값을 보는데 이름만 달랐다. 값이 같으니 화면을 지울 것까지는 없어 주소만 남겼다 |
| 처리 결과 | `/result` | 저장·삭제 뒤에 서는 자리라 원래 메뉴에 있을 것이 아니다 |

이 넷은 `pages.manifest.ts` 에 남아 `docs:check` 와 `overflow:check` 가 계속 센다.

## 6. `/result`

저장·삭제 뒤에 서는 결과 화면이다. 어느 자원에도 딸리지 않으므로 최상위다 — 자원 아래
두면 자원마다 한 벌씩 생긴다.

## 7. 문서 라우트

`/docs/**` 는 개발 도구다. `devOnlyRoutes` 로 추출 대상에서 뺀다 — 고객사에 노출되지 않는다.
