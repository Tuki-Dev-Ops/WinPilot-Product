# 기능 명세 — Product List

> 화면: [`/products`](/products) · id `products`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

파는 것 전부를 한 자리에서 좁혀 가며 고른다.

## 할 수 있는 일

- 1Depth·2Depth 탭으로 분류
- 상품명 검색
- 필터 서랍에서 분류·가격 범위 적용
- 상품 열기

## 막는 것

- 2Depth 는 고른 1Depth 안에서만 유효하다 — 짝이 맞지 않으면 없는 것으로 본다.
- 가격 입력이 숫자가 아니면 조건이 없는 것으로 본다(목록을 비우지 않는다).

## 어드민 연동

- 상품 > 상품 목록
- 상품 > 카테고리

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/products)
- [화면 캡처](/page-view/products)
- [IA](/ia) · [Flow Chart](/flow)
