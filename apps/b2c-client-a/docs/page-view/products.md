# 화면 캡처 — Product List

> 화면: `/products` · id `products`
> 생성: `pnpm docs:capture` (개발 서버가 떠 있어야 한다)
> 이 파일은 **생성물**이다. 캡처를 다시 뜨면 덮어쓴다.

## Product List

정상 화면

`/products`

**Desktop 1440px**

![Product List Desktop](/page-view/products-desktop.png)

**Tablet 768px**

![Product List Tablet](/page-view/products-tablet.png)

**Mobile 375px**

![Product List Mobile](/page-view/products-mobile.png)

## 검색 결과 없음

조건에 맞는 것이 없을 때. 목록 자리를 비우지 않고 한 줄로 알린다.

`/products?q=%EC%97%86%EB%8A%94%EC%83%81%ED%92%88`

**Desktop 1440px**

![검색 결과 없음 Desktop](/page-view/products--empty-desktop.png)

**Tablet 768px**

![검색 결과 없음 Tablet](/page-view/products--empty-tablet.png)

**Mobile 375px**

![검색 결과 없음 Mobile](/page-view/products--empty-mobile.png)

## 분류·가격 적용

조건이 주소에 남아 새로고침·공유에서 살아남는다.

`/products?category=C-01&min=30000&max=200000`

**Desktop 1440px**

![분류·가격 적용 Desktop](/page-view/products--filtered-desktop.png)

**Tablet 768px**

![분류·가격 적용 Tablet](/page-view/products--filtered-tablet.png)

**Mobile 375px**

![분류·가격 적용 Mobile](/page-view/products--filtered-mobile.png)

## 관련 문서

- [기능 명세](/feature/products)
- [비기능 명세](/non-functional/products)
