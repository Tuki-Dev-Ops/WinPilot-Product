# 기능 명세 — Login

> 화면: [`/login`](/login) · id `login`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

계정으로 들어온다.

## 할 수 있는 일

- 이메일·비밀번호 로그인
- 소셜 로그인 5종
- 회원가입 탭으로 이동

## 막는 것

- 어느 항목이 틀렸는지 말하지 않는다 — 계정 존재 여부를 알려 주는 것과 같다.

## 어드민 연동

- 사용자 > 사용자 목록
- 사내 어드민 > OAuth 설정

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/login)
- [화면 캡처](/page-view/login)
- [IA](/ia) · [Flow Chart](/flow)
