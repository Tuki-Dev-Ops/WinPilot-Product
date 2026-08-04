# 기능 명세 — Signup

> 화면: [`/signup`](/signup) · id `signup`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

계정을 만든다.

## 할 수 있는 일

- 항목 입력
- 닉네임 자동 생성
- 이메일 인증(발송·확인)
- 가입(확인 창)

## 막는 것

- 이메일 인증을 마쳐야 가입할 수 있다.
- 인증 뒤 주소를 고치면 인증이 풀린다.
- 비밀번호 8자 이상·확인 일치·필수 동의.

## 어드민 연동

- 사용자 > 사용자 추가(목록 안 모달)와 같은 항목

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/signup)
- [화면 캡처](/page-view/signup)
- [IA](/ia) · [Flow Chart](/flow)
