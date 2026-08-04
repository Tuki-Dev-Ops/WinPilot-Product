# 기능 명세 — My Page Coupons

> 화면: [`/mypage/coupons`](/mypage/coupons) · id `mypage-coupons`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

가진 쿠폰과 받을 수 있는 쿠폰을 나눠 본다.

## 할 수 있는 일

- 내 쿠폰 / 쿠폰 받기 탭 전환
- 쿠폰 받기(확인 창)

## 막는 것

- 기간이 지난 쿠폰도 숨기지 않고 흐리게 남긴다 — 왜 못 쓰는지 알 수 있어야 한다.

## 어드민 연동

- *(쿠폰 화면 예정)* — 값은 store `COUPONS`

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/mypage-coupons)
- [화면 캡처](/page-view/mypage-coupons)
- [IA](/ia) · [Flow Chart](/flow)
