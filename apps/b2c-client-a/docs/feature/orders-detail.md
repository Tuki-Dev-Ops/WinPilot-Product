# 기능 명세 — Order Detail

> 화면: [`/orders/[orderId]`](/orders/[orderId]) · id `orders-detail`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

한 주문의 결제·배송·운송장을 확인한다.

## 할 수 있는 일

- 운송장 번호 확인
- 주문 목록으로 돌아가기

## 막는 것

- 없는 주문번호는 404 다.

## 어드민 연동

- 판매 상세 — 운송장·결제 취소·교환은 운영자가 처리한다

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/orders-detail)
- [화면 캡처](/page-view/orders-detail)
- [IA](/ia) · [Flow Chart](/flow)
