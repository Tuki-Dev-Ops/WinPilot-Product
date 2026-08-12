'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Button, ConfirmModal, Field, SaveRow, useToast } from '@winpilot/ui';

/**
 * 이 콘솔의 **폼 한 벌** — 입력 칸 · 저장 줄 · 저장 앞의 확인 창.
 *
 * ## 왜 앱 안에 두나
 * 표(`RecordTable`)와 카드(`Panel`)는 `@winpilot/ui` 로 올렸는데 폼은 남겼다. 이유는 **저장한
 * 뒤에 어디로 가는가**가 콘솔마다 다르기 때문이다. IR 어드민은 `next/navigation` 의 라우터로
 * 목록으로 되돌리고, 여기는 아직 그 흐름이 정해지지 않았다.
 *
 * 공유 패키지는 `next` 에 기대지 않는다(그 패키지의 `package.json` 이 말한다). 라우팅을 아는
 * 조각을 거기 올리면 Next 를 안 쓰는 앱에서 그 패키지를 못 쓰게 된다.
 *
 * 올릴지 말지의 기준은 **"두 앱이 같은 것을 쓰기로 정했느냐"** 이고, 폼은 아직 정하지 않았다.
 *
 * ## 저장 앞에 확인 창을 세운다
 * 여기서 저장하는 것은 전부 **사이트에 그대로 나가는 값**이다. 목록 한 줄 고치는 일과 같은
 * 무게로 저장되면 안 된다. 확인 창의 값어치는 막는 데 있지 않고 **읽게 하는 데** 있으므로,
 * `detail` 에 무엇이 어디로 나가는지를 한 줄로 다시 적는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function FnbRecordForm({
  resource,
  mode = 'edit',
  detail,
  confirmMessage,
  validate,
  children,
}: {
  /** `메뉴` · `가맹점` 처럼 사람이 부르는 이름. 토스트와 확인 창 문구에 그대로 들어간다 */
  resource: string;
  /**
   * 이미 있는 것을 고치는가(`edit`), 새로 만드는가(`create`).
   *
   * ## 왜 화면을 나누지 않고 인자로 받나
   * 등록 화면과 상세 화면은 **같은 칸에 같은 검사**를 갖는다. 둘로 나누면 칸이 하나 늘 때
   * 두 곳을 고쳐야 하고, 그러다 등록에만 없는 칸이 생긴다 — 그 어긋남은 등록해 본 뒤에야
   * 드러난다.
   *
   * 갈리는 것은 셋뿐이라 인자 하나로 족하다: 단추에 적히는 말, 확인 창이 묻는 말,
   * 저장 뒤 토스트.
   */
  mode?: 'edit' | 'create';
  /** 확인 창에서 다시 읽히는 한 줄 — 무엇이 저장되는지 */
  detail: string;
  /**
   * 틀린 칸의 이름들. 비어 있으면 저장으로 넘어간다.
   *
   * 검사를 밖에서 받는 이유: 무엇이 필수인지는 자원마다 다르고, 그 판단이 이 파일에 들어오면
   * 여기가 콘솔의 모든 자원을 알게 된다.
   */
  /**
   * 확인 창의 본문. 기본은 `사이트에 그대로 나갑니다` 다.
   *
   * 바꿀 수 있게 둔 이유: **사이트에 안 나가는 화면이 하나 있다**(공급자 관리). 거기서 기본
   * 문구는 거짓말이 되고, 확인 창의 값어치는 막는 데가 아니라 읽게 하는 데 있어서 틀린 말이
   * 적혀 있으면 다음부터 아무도 안 읽는다.
   */
  confirmMessage?: string;
  validate: () => string[];
  children: ReactNode;
}) {
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const creating = mode === 'create';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const broken = validate();

    if (broken.length > 0) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${broken.length}개 있습니다 — ${broken.join(' · ')}`,
      });
      return;
    }

    setAsking(true);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      {children}

      <SaveRow>
        <Button type="submit">{creating ? '등록' : '저장'}</Button>
      </SaveRow>

      <ConfirmModal
        open={asking}
        title={creating ? `${resource}을(를) 등록할까요` : `${resource}을(를) 저장할까요`}
        message={confirmMessage ?? '사이트에 그대로 나갑니다. 적힌 것이 맞는지 한 번 더 읽어 주세요.'}
        detail={detail}
        confirmLabel="저장"
        onConfirm={() => {
          setAsking(false);
          toast.success({
            message: creating ? `${resource}을(를) 등록했습니다.` : `${resource}을(를) 저장했습니다.`,
            detail,
          });
        }}
        onCancel={() => setAsking(false)}
      />
    </form>
  );
}

/**
 * 입력 한 칸 — `@winpilot/ui` 의 `Field` 를 그대로 쓴다.
 *
 * 이 겹을 남겨 두는 이유는 **이 콘솔의 폼이 앞으로 갈라질 수 있는 자리**를 하나로 유지하기
 * 위해서다. 지금은 넘기는 것을 그대로 넘긴다.
 */
export function FnbField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  /** 라벨이 가리키는 입력의 id. 입력이 여럿인 묶음이면 비운다 — 그때는 라벨이 제목 노릇만 한다 */
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field
      label={label}
      {...(htmlFor ? { htmlFor } : {})}
      {...(required ? { required } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    >
      {children}
    </Field>
  );
}

/**
 * 입력 원시 조각 여섯 — `@winpilot/ui` 가 갖는다.
 *
 * 한때 이 파일이 여섯을 직접 그렸다. IR 어드민의 것과 **주석 문장까지 같았다** — 이 파일
 * 머리말이 "폼은 앱 안에 둔다" 고 적어 둔 이유(저장 뒤 라우팅이 콘솔마다 다르다)는 아래
 * `FnbRecordForm` 하나에만 걸리는데, 그 이유가 파일 전체로 번져 있었다.
 *
 * 여섯은 라우터도 콘솔도 모른다. 이름만 이 콘솔 것으로 두고 모양은 공유 것을 쓴다.
 */
export {
  Readonly as FnbReadonly,
  TextInput as FnbTextInput,
  TextArea as FnbTextArea,
  Select as FnbSelect,
  Toggle as FnbToggle,
  SaveRow as FnbSaveRow,
} from '@winpilot/ui';
