# 기능 명세 — Product Detail

> 화면: [`/products/[productId]`](/products/[productId]) · id `products-detail`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

이 상품을 살지 결정하는 데 필요한 것만 모아 둔다.

## 할 수 있는 일

- 색상 → 사이즈 순서로 옵션 고르기
- 수량 조절
- 장바구니 담기
- 바로 구매
- 설명·리뷰 탭 전환

## 막는 것

- 옵션이 있는 상품은 고르기 전에 담을 수 없다.
- 재고 0 옵션은 누를 수 없고 취소선으로 표시한다.
- 수량은 재고를 넘지 못한다.

## 어드민 연동

- 상품 > 상품 등록(옵션·적립·배송)
- 상품 > 카테고리

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/products-detail)
- [화면 캡처](/page-view/products-detail)
- [IA](/ia) · [Flow Chart](/flow)
