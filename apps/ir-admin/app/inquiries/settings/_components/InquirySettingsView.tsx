'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/** 사이트 양식이 묻는 칸. 여기서 끄면 그 칸이 사이트에서 사라진다. */
const FIELDS = [
  { id: 'company', label: '회사명', required: true },
  { id: 'region', label: '지역', required: true },
  { id: 'name', label: '담당자명', required: true },
  { id: 'phone', label: '휴대폰 번호', required: true },
  { id: 'email', label: '이메일', required: true },
  { id: 'body', label: '문의 내용', required: true },
  { id: 'files', label: '첨부파일', required: false },
] as const;

/**
 * 문의 > 설정.
 *
 * ## 받는 곳을 한 자리에서 정한다
 * 사이트 양식의 갈래(도입·기술·주주…)마다 받는 사람이 다르다. 그 주소가 코드에 흩어져 있으면
 * 담당이 바뀌는 날 **문의가 조용히 사라진다** — 보낸 쪽에는 보냈다는 화면이 뜨고, 받는 쪽에는
 * 아무것도 오지 않는다.
 *
 * ## 칸을 여기서 끄지 못하게 둔 이유
 * 목록만 보여 주고 켜고 끄지는 않는다. 필수 칸을 끄면 **이미 그 값을 전제로 만든 답변 절차**가
 * 어긋나기 때문이다 — 회사명 없이 들어온 문의는 기존 상담 이력과 이어지지 않는다. 칸을 바꾸는
 * 일은 양식과 답변 절차를 함께 손보는 일이라, 그때는 코드를 고친다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function InquirySettingsView() {
  const toast = useToast();
  const [inbox, setInbox] = useState(IR_COMPANY.irEmail);
  const [pending, setPending] = useState(false);

  return (
    <>
      <PageHeading title="문의 설정" description="양식이 무엇을 묻고 어디로 보낼지를 정하세요." />

      <IrPanel title="받는 곳" description="사이트 문의가 이 주소로 갑니다.">
        <IrField label="대표 수신 메일" htmlFor="inquiry-inbox" hint="갈래별 담당자는 이 주소에서 다시 나눕니다.">
          <input
            id="inquiry-inbox"
            type="email"
            value={inbox}
            onChange={(event) => setInbox(event.target.value)}
            className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink"
          />
        </IrField>

        <IrSaveRow>
          <IrPrimaryButton type="button" onClick={() => setPending(true)}>
            저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrPanel title="양식이 묻는 것" description="사이트의 문의 양식에 서는 칸입니다.">
        <ul className="flex flex-col">
          {FIELDS.map((one) => (
            <li
              key={one.id}
              className="flex items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{one.label}</span>
                <span className="block font-mono text-xs text-ink-faint">{one.id}</span>
              </span>
              <Badge tone={one.required ? 'brand' : 'neutral'}>{one.required ? '필수' : '선택'}</Badge>
            </li>
          ))}
        </ul>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 칸을 켜고 끄는 자리는 두지 않습니다 — 필수 칸을 끄면 이미
        그 값을 전제로 만든 답변 절차가 어긋납니다.
      </p>

      <IrConfirmModal
        open={pending}
        title="이 주소로 저장할까요"
        message="사이트에서 보낸 문의가 이 주소로 갑니다. 주소가 틀리면 보낸 쪽에는 보냈다는 화면이 뜨고 받는 쪽에는 아무것도 오지 않습니다."
        detail={inbox}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({ message: '수신 주소를 저장했습니다.', detail: inbox });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
