'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useToast } from '@winpilot/ui';
import { IrConfirmModal } from './IrConfirmModal';
import { IrGhostButton, IrPrimaryButton, IrSaveRow } from './IrForm';

export type FormMode = 'create' | 'edit';

/**
 * 등록·수정 화면의 **공통 뼈대**.
 *
 * ## 왜 한 벌로 두나
 * 이 콘솔에는 등록·수정 화면이 열일곱이다. 각자 만들면 저장 단추의 자리 · 확인 창을 세우는지 ·
 * 틀린 칸이 있을 때 무엇을 알리는지가 **열일곱 벌로 갈린다.** 실제로 갈리는 방향은 언제나 같다 —
 * 나중에 만든 화면일수록 확인 창이 빠지고, 검사가 느슨해진다.
 *
 * ## 등록과 수정을 한 화면으로 둔다
 * `mode` 하나만 다르다. 나누면 칸을 하나 더할 때마다 **두 곳을 고쳐야** 하고, 그러다 등록에만
 * 있고 수정에는 없는 칸이 생긴다 — 그 칸은 한 번 적히면 다시는 고칠 수 없다.
 *
 * ## 저장 앞에 확인 창을 세운다
 * 여기서 저장하는 것은 전부 **사이트에 그대로 나가는 값**이다. 목록 한 줄 고치는 일과 같은
 * 무게로 저장되면 안 된다. 확인 창의 값어치는 막는 데 있지 않고 **읽게 하는 데** 있으므로,
 * `detail` 에 무엇이 어디로 나가는지를 한 줄로 다시 적는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function IrRecordForm({
  mode,
  resource,
  listHref,
  detail,
  validate,
  children,
}: {
  mode: FormMode;
  /** `공지사항` · `연혁` 처럼 사람이 부르는 이름. 토스트와 확인 창 문구에 그대로 들어간다 */
  resource: string;
  listHref: string;
  /** 확인 창에서 다시 읽히는 한 줄 — 무엇이 저장되는지 */
  detail: string;
  /**
   * 틀린 칸의 이름들. 비어 있으면 저장으로 넘어간다.
   *
   * 검사를 밖에서 받는 이유: 무엇이 필수인지는 자원마다 다르고, 그 판단이 이 파일에 들어오면
   * 여기가 열일곱 자원을 전부 알게 된다.
   */
  validate: () => string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = useState(false);

  const verb = mode === 'create' ? '등록' : '저장';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const broken = validate();

    if (broken.length > 0) {
      toast.error({
        message: `${verb}하지 못했습니다.`,
        detail: `확인이 필요한 항목이 ${broken.length}개 있습니다 — ${broken.join(' · ')}`,
      });
      return;
    }

    setAsking(true);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      {children}

      <IrSaveRow>
        <IrGhostButton
          onClick={() => {
            toast.info({
              message: `${resource} 목록으로 이동합니다.`,
              detail: '저장하지 않은 것은 반영되지 않습니다.',
            });
            router.push(listHref);
          }}
        >
          목록
        </IrGhostButton>
        <IrPrimaryButton>{verb}</IrPrimaryButton>
      </IrSaveRow>

      <IrConfirmModal
        open={asking}
        title={`${resource}을(를) ${verb}할까요`}
        message="사이트에 그대로 나갑니다. 적힌 것이 맞는지 한 번 더 읽어 주세요."
        detail={detail}
        confirmLabel={verb}
        onConfirm={() => {
          setAsking(false);
          toast.success({ message: `${resource}을(를) ${verb}했습니다.`, detail });
          router.push(listHref);
        }}
        onCancel={() => setAsking(false)}
      />
    </form>
  );
}

/**
 * 입력 원시 조각 다섯 — 이제 `@winpilot/ui` 가 갖는다.
 *
 * F&B 어드민이 같은 것을 **문자 단위로 같게** 들고 있어서 올렸다. 옮긴 것은 모양뿐이고 이름은
 * 그대로 둔다 — 이 콘솔의 화면 마흔둘이 `Ir*` 로 부르고 있고, 그 겹을 남기는 이유는
 * `IrPanel` 과 같다(이 콘솔만의 칸이 생기는 날 고칠 자리를 하나로 유지).
 */
export {
  Readonly as IrReadonly,
  TextInput as IrTextInput,
  TextArea as IrTextArea,
  Select as IrSelect,
  Toggle as IrToggle,
} from '@winpilot/ui';
