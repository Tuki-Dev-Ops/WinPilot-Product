# 기능 명세 — Company

> 화면: [`/company`](/company) · id `company`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

무엇을 하는 회사인지 읽는다.

## 할 수 있는 일

- 소개 읽기
- 사업자 정보 확인

## 막는 것

- 대표 이미지가 없으면 자리표시자를 둔다 — 올렸을 때 배치가 밀리지 않게.

## 어드민 연동

- 회사 > 회사 소개(본문·대표 이미지)
- 설정 > 공급자 정보

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/company)
- [화면 캡처](/page-view/company)
- [IA](/ia) · [Flow Chart](/flow)
