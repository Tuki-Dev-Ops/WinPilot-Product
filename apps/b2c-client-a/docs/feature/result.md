# 기능 명세 — Result

> 화면: [`/result`](/result) · id `result`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

방금 한 일이 끝났는지 알린다.

## 할 수 있는 일

- 다음 화면으로 이동(주문 내역·마이페이지 등)

## 막는 것

- 무엇이 끝났는지(`kind`)와 잘됐는지(`state`)를 주소로 받는다 — 새로고침해도 남는다.

## 어드민 연동

- 판매 목록 · 문의 > 설정의 완료 문구

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/result)
- [화면 캡처](/page-view/result)
- [IA](/ia) · [Flow Chart](/flow)
