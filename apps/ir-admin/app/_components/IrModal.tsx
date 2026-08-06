'use client';

import { useId, type ReactNode } from 'react';
import { Button, Modal } from '@winpilot/ui';

/**
 * 사내 어드민의 **등록·수정 창** — 폼 하나와 `취소`/`저장` 두 단추가 붙은 모달.
 *
 * 등록 폼을 **목록 위 모달**에서 끝내는 이유: 이 콘솔의 자원은 한 줄에 들어가는 값이
 * 대여섯 개뿐이라, 화면을 따로 세우면 등급 하나 만드는 데 목록 → 등록 → 저장 → 목록으로
 * 네 번 오간다. 값이 많아지는 자원이 생기면 그때 화면을 나눈다 (`docs/path.md` §3.2).
 *
 * ## 창을 여닫는 일은 이제 여기서 하지 않는다
 * Esc·스크롤 잠금·첫 요소 포커스는 `@winpilot/ui` 의 `Modal` 이 맡는다. 전에는 그 백 줄이
 * B2C Admin 의 `AdminModal` 과 **두 벌로** 있었고, 두 벌인 동안 이쪽에만 없는 것이 넷 생겼다
 * (모달 스택 · 열림 애니메이션 · `elevated` · `bg-surface-raised`). 특히 **모달 스택이 없어
 * 확인 창 위에서 Esc 를 누르면 뒤의 이 폼까지 함께 닫혔다** — 쓰던 값이 사라진다.
 *
 * 남은 것은 이 콘솔이 정한 **모양** 하나다: 폼이 있고, 아래줄은 언제나 취소·저장 둘.
 * 아홉 화면이 같은 모양을 쓰기로 했으므로 여기 한 번만 적는다.
 */
export function IrModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  elevated,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** 저장을 눌렀을 때. 막을 조건이 있으면 여기서 막고 토스트로 알린다 */
  onSubmit: () => void;
  submitLabel: string;
  /**
   * 창 **위에** 뜨는 창인지.
   *
   * 고객사 창 안에서 제공자·레코드 창을 여는 자리가 생겼다. 겹치는 창이 같은 높이면
   * 뒤의 창이 앞을 덮어 눌리지 않는다 — 위에 뜨는 쪽이 자기가 위라고 말해야 한다.
   */
  elevated?: boolean;
  children: ReactNode;
}) {
  // 제목을 id 로 쓰면 공백이 들어가고 두 창이 같은 제목일 때 겹친다.
  const formId = useId();

  return (
    <Modal
      open={open}
      title={title}
      {...(description === undefined ? {} : { description })}
      onClose={onClose}
      {...(elevated ? { elevated } : {})}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          {/*
            `form` 속성으로 바깥의 단추를 안쪽 폼에 묶는다. `Modal` 의 아래줄은 본문 밖에 있어
            단추를 `<form>` 안에 넣을 수 없는데, 그렇다고 `onClick` 으로 제출하면 Enter 키로
            저장하는 길이 사라진다 — 값을 몇 개만 넣는 창에서 그 길이 가장 빠르다.
          */}
          <Button type="submit" form={formId}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-5"
      >
        {children}
      </form>
    </Modal>
  );
}
