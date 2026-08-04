# 기능 명세 — Orders

> 화면: [`/orders`](/orders) · id `orders`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

내 주문이 지금 어디까지 왔는지 본다.

## 할 수 있는 일

- 배송 상태 탭으로 좁히기
- 주문 상세 열기

## 막는 것

- 한 건도 없는 상태는 탭에서 뺀다 — 늘 0 인 탭이 줄지어 있으면 탭 줄만 길어진다.

## 어드민 연동

- 판매 목록 (`/products/sales`) — 고객 화면의 '주문' 과 같은 자원

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/orders)
- [화면 캡처](/page-view/orders)
- [IA](/ia) · [Flow Chart](/flow)
