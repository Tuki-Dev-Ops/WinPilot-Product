# 용어

> Internal Admin · 생성: `pnpm docs:build` · 원본: `tools/docs/nfs.ts`

## 목적

같은 것을 두 이름으로 부르면 그때부터 두 구현이 생긴다.

## 적용 범위

화면 문구 · 라우트 · 컴포넌트 이름.

## 정책

- 한 자원에 이름은 하나다. 대체어를 쓰면 검사에서 잡힌다.
- 이름의 원본은 공유 용어집 한 곳이다.
- 화면에 보이는 말은 한글, 주소와 코드 이름은 영문 소문자다.

## 세부 기준

| 쓰는 말 | 쓰지 않는 말 |
|---|---|
| 상품 (product) | item · goods |
| 주문 (order) | purchase · deal |
| 문의 (inquiry) | question · qna |
| 리뷰 (review) | comment · feedback · rating |
| 쿠폰 (coupon) | promotion · discount |

## 예외

- 바깥 서비스의 고유 이름(카카오·네이버)은 그대로 쓴다.

## 점검 항목

- [ ] `pnpm spec:check` 통과
- [ ] `pnpm sync:check` 통과
