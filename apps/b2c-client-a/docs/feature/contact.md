# 기능 명세 — Contact

> 화면: [`/contact`](/contact) · id `contact`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

문의를 보낸다.

## 할 수 있는 일

- 유형 선택
- 항목 입력
- 파일 첨부
- 개인정보 동의
- 보내기(확인 창)

## 막는 것

- 어드민이 켠 항목만 나오고, 필수 여부도 어드민을 따른다.
- 첨부는 고른 순간 형식·용량·개수를 검사한다.
- 필수 동의 없이는 보낼 수 없다.

## 어드민 연동

- 문의 > 설정
- 문의 > 목록(Path `/contact`)

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/contact)
- [화면 캡처](/page-view/contact)
- [IA](/ia) · [Flow Chart](/flow)
