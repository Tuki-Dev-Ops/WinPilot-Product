'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { SOLUTIONS } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * 제품 > 설정.
 *
 * ## 차례를 여기서 정한다
 * 사이트 머리 메뉴의 PRODUCT 아래에 네 제품이 이 차례로 선다. 차례는 취향이 아니라 **읽는
 * 순서**다 — 제조 현장을 검토하는 사람은 MES 를 먼저 찾고, 경영을 보는 사람은 ERP 를 먼저
 * 찾는다. 지금 차례는 앞쪽(MES)에 맞춰 두었다.
 *
 * ## 끄는 자리를 함께 둔다
 * 아직 팔 준비가 안 된 제품을 메뉴에서 내리는 일이 실제로 생긴다. 그때 코드를 고치면 배포를
 * 기다려야 하는데, **메뉴에 있는데 문의하면 아직 없다고 답하는 상태**는 하루도 두면 안 된다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function ProductSettingsView() {
  const [order, setOrder] = useState(SOLUTIONS.map((one) => one.id));
  const [hidden, setHidden] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const rows = order
    .map((id) => SOLUTIONS.find((one) => one.id === id))
    .filter((one): one is (typeof SOLUTIONS)[number] => one !== undefined);

  /** 한 칸씩만 옮긴다 — 끌어 옮기기는 좁은 화면과 키보드에서 쓸 수 없다. */
  function move(index: number, step: number) {
    const next = [...order];
    const target = index + step;
    const a = next[index];
    const b = next[target];
    if (a === undefined || b === undefined) return;
    next[index] = b;
    next[target] = a;
    setOrder(next);
  }

  return (
    <>
      <PageHeading title="제품 설정" description="사이트 PRODUCT 메뉴의 차례와 노출을 정하세요." />

      <IrPanel
        title="메뉴 차례"
        description="위에서부터 사이트 메뉴에 섭니다."
        aside={<Badge tone="neutral">{rows.length - hidden.length}개 노출</Badge>}
      >
        <ul className="flex flex-col">
          {rows.map((one, index) => (
            <li
              key={one.id}
              className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0"
            >
              <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block min-w-0 truncate text-sm font-medium">{one.name}</span>
                <span className="block min-w-0 truncate text-xs text-ink-faint">{one.tagline}</span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                <SmallButton disabled={index === 0} onClick={() => move(index, -1)}>
                  위로
                </SmallButton>
                <SmallButton disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
                  아래로
                </SmallButton>
                <SmallButton
                  onClick={() =>
                    setHidden((was) =>
                      was.includes(one.id) ? was.filter((id) => id !== one.id) : [...was, one.id],
                    )
                  }
                >
                  {hidden.includes(one.id) ? '노출' : '숨김'}
                </SmallButton>
              </span>
            </li>
          ))}
        </ul>

        <IrSaveRow>
          <IrPrimaryButton type="button" onClick={() => setPending(true)}>
            저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrConfirmModal
        open={pending}
        title="메뉴를 이 차례로 저장할까요"
        message="사이트 머리 메뉴가 바로 바뀝니다. 숨긴 제품은 메뉴에서 사라지고 상세 화면도 열리지 않습니다."
        detail={rows.filter((one) => !hidden.includes(one.id)).map((one) => one.name).join(' · ')}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({ message: '제품 메뉴를 저장했습니다.' });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}

/** 줄 안에 서는 작은 단추. 줄 높이를 넘기지 않도록 `h-8` 로 맞춘다. */
function SmallButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled ?? false}
      onClick={onClick}
      className="h-8 shrink-0 rounded-lg border border-border-strong px-2.5 text-xs text-ink-muted transition-colors duration-150 hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
