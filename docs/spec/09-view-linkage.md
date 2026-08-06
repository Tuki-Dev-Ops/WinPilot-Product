# 뷰 연동 대조표 — B2C Admin ↔ B2C Client ↔ Internal Admin

> SSOT: `packages/spec/src/features.ts` (화면 짝) · `packages/store/src/**` (값)
> 집행: `pnpm spec:check` (짝) · 값의 연동은 **아직 검사기가 없다** (§5)

운영자가 어드민에서 바꾼 것이 고객 화면에 그대로 나타나야 한다. 이 문서는 그 연결이 지금
**어디까지 실제로 이어져 있는지**를 자원 단위로 적은 것이다.

두 가지를 구분한다.

- **화면 짝** — 같은 기능이 두 뷰에 각각 화면을 갖는가. `features.ts` 의 `views` 바인딩이
  원본이고 `spec:check` 가 검사한다.
- **값 연동** — 두 화면이 **같은 배열을 읽는가**. 이쪽은 검사기가 없어 손으로 대조했다.

화면 짝이 있어도 값이 갈라져 있으면 연동된 것이 아니다. 어드민에서 저장한 값이 고객 화면에
나타나지 않는데, 화면은 둘 다 멀쩡히 있으므로 **열어 보기 전에는 드러나지 않는다.**

## 1. 화면 짝 — 74개 기능

| 구분 | 개수 |
|---|---|
| 두 뷰 모두 | **19** |
| 어드민에만 | 24 |
| 고객 화면에만 | 7 |
| 사내 어드민 등 나머지 | 22 |

### 1.1 두 뷰 모두 있는 19개

| Feature ID | 이름 | B2C Admin | B2C Client |
|---|---|---|---|
| `product.list` | 상품 목록 | `/products` | `/products` |
| `product.detail` | 상품 상세 | `/products/[productId]` | `/products/[productId]` |
| `order.list` | 주문 | `/products/sales` | `/orders` |
| `order.detail` | 주문 상세 | `/products/sales/[orderId]` | `/orders/[orderId]` |
| `coupon.list` | 쿠폰함 | `/products/coupons` | `/mypage/coupons` |
| `inquiry.list` | 문의 | `/inquiries` | `/mypage/inquiries` |
| `inquiry.settings` | 문의 폼 설정 | `/inquiries/settings` | `/contact` |
| `notice.list` · `notice.detail` | 공지사항 | `/contents/notices` | `/notices` |
| `news.list` · `news.detail` | 뉴스 | `/contents/news` | `/news` |
| `portfolio.list` | 포트폴리오 | `/contents/portfolios` | `/portfolios` |
| `faq.list` | FAQ | `/contents/faqs` | `/faqs` |
| `profile.settings` | 회사 소개 | `/company/about` | `/company` |
| `milestone.list` | 연혁 | `/company/history` | `/company/history` |
| `terms.settings` | 서비스 이용약관 | `/settings/terms` | `/terms` |
| `privacy.settings` | 개인정보 처리방침 | `/settings/privacy` | `/privacy` |
| `user.auth` | 로그인 | `/login` | `/login` |
| `status.result` | 처리 결과 | `/result` | `/result` |

**경로가 다른 것은 의도된 것이다.** 어드민은 자원을 갈래로 묶어 두고(`/products/sales`),
고객 화면은 사람이 찾는 말로 둔다(`/orders`). 같은 기능인지는 경로가 아니라 Feature ID 가
말한다 — 그래서 ID 를 먼저 정하고 경로를 나중에 정한다 (`02-naming-convention.md`).

### 1.2 고객 화면에만 있는 7개

`site.home` · `user.signup` · `user.settings` · `order.create` · `cart.list` · `alarm.list` ·
`faq.detail`.

전부 **고객이 하는 일**이라 어드민에 짝이 없는 것이 맞다. 장바구니와 결제는 운영자가 대신
해 주지 않고, 알람은 고객에게만 쌓인다. `features.ts` 에 `singleViewByDesign: true` 로
표시해 두어 `spec:check` 의 `VIEW_PARTIAL` 경고가 뜨지 않는다 — **모르고 빠진 것과 알고
빼 둔 것을 검사기가 구분할 수 있어야** 경고가 뜻을 갖는다.

## 2. 값 연동 — 14개 자원

어드민 화면이 읽는 배열과 고객 화면이 읽는 배열이 **같은 곳에서 오는가**.

| 자원 | 원본 (`@winpilot/store`) | B2C Admin | B2C Client | 판정 |
|---|---|---|---|---|
| `product` | `products.ts` | 재수출 | 재수출 | 연동 |
| `coupon` | `coupons.ts` | 재수출 | 재수출 | 연동 |
| `inquiry` | `inquiries.ts` | 재수출 | 재수출 | 연동 |
| `notice` · `news` · `portfolio` · `faq` | `contents.ts` | 재수출 | 재수출 | 연동 |
| `milestone` · `profile` | `company.ts` | 재수출 | 재수출 | 연동 |
| `terms` · `privacy` | `policies.ts` | 재수출 | 재수출 | 연동 |
| `review` | `reviews.ts` | 재수출 | 재수출 | 연동 |
| `order` | `orders.ts` | 재수출 | `ordersOf()` | 연동 |
| `support` | `support.ts` | `requestsOf()` | — (고객 화면에 없다) | 연동 |

**14 연동 · 0 갈라짐.**

고객 화면은 `@winpilot/store` 를 직접 읽지 않고 `@winpilot/client-content` 를 거친다
(화면 51곳). `client-content` 가 store 를 재수출하므로 결과적으로 같은 배열에 닿는다.
한 겹을 두는 이유는 템플릿 A~F 가 **콘텐츠 계약**을 공유하기 위해서다 —
값은 store 에서 오고, 그 값을 화면이 어떤 이름으로 부를지는 `client-content` 가 정한다.

## 3. 사내 콘솔로 건너가는 자리 — 고객 지원

앞의 표는 **한 고객사 안에서** 어드민과 고객 화면이 같은 값을 읽는가를 본다. 지원 요청은
그 밖으로 나가는 유일한 자원이다 — **고객사가 올리고 우리가 답한다.**

| 어디 | 화면 | 무엇을 하는가 |
|---|---|---|
| B2C Admin | `/support` | 올린다. `requestsOf(tenantId)` 로 **자기 고객사 것만** 본다 |
| Internal Admin | `/inquiries` | 답한다. 모든 고객사의 것을 본다 |

원본은 `packages/store/src/support.ts` 하나다(`SUPPORT_REQUESTS`). 사내 콘솔은 이름만
갈아 끼워 읽는다(`apps/internal-admin/lib/data/inquiries.ts` — `INQUIRIES` 로 재수출).
이 콘솔의 화면 열몇 곳이 이미 `문의` 라는 말로 적혀 있고 그것이 사이드바 메뉴 이름이라,
자원 이름까지 바꾸면 화면 말이 함께 흔들린다.

### 왜 사내 콘솔에만 있던 값을 옮겼나

전에는 이 시드가 `internal-admin` 안에만 있었다. 고객사가 문의를 올릴 자리가 화면에
없었으므로, 사내 목록만 보면 문의는 **어디선가 그냥 생기는 것**이었다. 올리는 쪽을
만들면서 값을 공유 패키지로 옮겼다 — 두 벌로 두면 고객사가 올린 것이 우리 목록에 없거나
우리가 쓴 답이 고객사에게 보이지 않고, 그 어긋남은 **고객사가 "답이 없다" 고 전화할 때**
처음 드러난다.

### 지금 이어지지 않는 것 — 서버가 없다

**시드는 한 곳이지만 실행 중인 두 앱은 서로의 메모리를 보지 못한다.** `b2c-admin`(3301)과
`internal-admin`(3302)은 각각 다른 Next 프로세스이고, 이 저장소에는 서버가 없다. 그래서
`/support` 에서 **방금 올린** 문의는 그 브라우저 세션 안에서만 목록에 선다.

한 자리에서 확인할 수 있는 것은 이렇다.

- 두 화면이 같은 시드를 읽는다 — `Q-3080` 은 양쪽에서 같은 제목·상태·담당으로 보인다
- 상태·분류 이름이 글자까지 같다 (`접수` · `처리중` · `답변완료` · `보류`)
- 번호 규칙이 한 곳이다 (`nextRequestId`)
- 고객사 범위가 한 곳이다 (`requestsOf`)

서버가 붙는 순간 갈라질 자리는 **없다.** 두 화면이 이미 같은 타입·같은 함수·같은 이름을
쓰고 있어, 그 함수들이 배열 대신 API 를 읽게 하는 일만 남는다.

## 4. 합친 자리 — 주문

주문은 이 문서를 처음 쓸 때 **유일하게 갈라져 있던 자원**이었다. 지금은 합쳤고, 무엇이
문제였는지는 남겨 둔다 — 다음에 자원을 하나 더 붙일 때 같은 일을 되풀이하지 않기 위해서다.

### 전에는 이랬다

```
apps/b2c-admin/lib/data/orders.ts          ORDERS  6건
packages/client-content/src/account.ts     ACCOUNT.orders  3건
```

두 배열이 서로를 몰랐다. 겹치는 3건은 필드값이 글자까지 같았지만 **손으로 맞춘 복사본**이라
어긋나도 막는 장치가 없었다.

### 무엇이 깨져 있었나

**하나 — 어드민에서 바꾼 값이 고객 화면에 닿지 않았다.**
`/products/sales` 의 송장 등록(`TrackingModal`)과 교환 접수(`ExchangeModal`)가
`shipState` · `courier` · `trackingNumber` 를 바꾸는데, 고객 화면은 다른 배열을 읽었다.

**둘 — 고객 화면이 남의 주문을 자기 것으로 보여 주고 있었다.**
합치고 나서야 드러난 것이다. 고객 화면은 `S-24081` · `S-24079` · `S-24077` 셋을 김서연의
주문으로 보여 줬는데, 어드민 시드에서 뒤의 둘은 **이하늘 · 최유진의 주문**이었다. 두 배열을
아무도 대조하지 않았으므로 아무도 몰랐다.

두 번째가 이 작업의 값이다. 첫 번째는 문서를 읽으면 짐작할 수 있었지만, 두 번째는 **실제로
합쳐서 `buyerEmail` 로 걸러 보기 전에는 드러나지 않았다.**

### 지금

```ts
// packages/store/src/orders.ts
export const ORDERS: OrderRecord[] = [ /* 8건, 구매자 정보 포함 */ ];

/** 그 사람의 주문만, 좁은 모양으로 */
export function ordersOf(email: string): OrderSummary[]
```

- 어드민 `/products/sales` — `ORDERS` 전체(8건)를 본다
- 고객 `/orders` — `ordersOf(ACCOUNT.email)`(3건)을 본다

`coupons.ts` 의 `couponsOf()` · `inquiries.ts` 의 `inquiriesOf()` 와 같은 모양이다.

**원본은 넓게 두고 좁은 모양은 함수가 뽑는다.** 어드민은 구매자 정보까지 봐야 하고
(`buyerName` · `buyerPhone` · `address` · `payMethod`) 고객은 자기 주문이라 그것을 다시
보여 줄 이유가 없다. 옵션도 어드민은 코드(`O-1042-BE-M`), 고객은 사람이 읽는 말
(`베이지 / M`) 이라 `optionLabelOf()` 로 옮긴다.

### 시드를 늘린 이유

합치고 나니 김서연의 주문이 하나뿐이라 고객 화면이 비었고, 상태 다양성(배송완료 · 결제취소)도
사라졌다. **남의 주문을 김서연에게 옮기는 대신 김서연의 주문 둘(`S-24075` · `S-24074`)을
더했다** — 어드민 목록은 여러 사람의 주문이 섞여 있어야 실제와 닮는다.

알람의 링크도 함께 고쳤다. `/orders/S-24079` 를 가리키고 있었는데 그것은 이하늘의 주문이라,
눌러 들어가면 없는 화면이 된다.

## 5. 이 문서가 손으로 쓰여 있는 이유

화면 짝은 `spec:check` 가 검사한다. **값 연동은 검사기가 없다.**

`lib/data/*.ts` 가 store 를 재수출하는지 자기 배열을 드는지는 기계가 볼 수 있는 사실이므로,
검사기를 만들 수 있다. 만들지 않은 이유는 "자체값이면 무조건 잘못" 이 아니기 때문이다 —
`analytics.ts`(통계 시드) · `industry.ts`(업태 분류)는 고객 화면이 쓰지 않아 자체값이 맞다.

검사기를 만든다면 **`features.ts` 에서 두 뷰 짝이 있는 기능의 entity 만** 골라, 그 자원의
시드가 store 에 있는지 보면 된다. 지금은 그 목록이 19개뿐이라 손으로 대조하는 편이 빠르지만,
기능이 늘면 이 문서가 먼저 낡는다.

> **이 표가 낡았는지 아는 법**: `pnpm spec:matrix` 로 두 뷰 짝의 수를 세어 §1 의 19와
> 다르면 이 문서를 먼저 고친다.
