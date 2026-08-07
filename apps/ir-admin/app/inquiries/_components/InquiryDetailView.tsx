'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, useToast } from '@winpilot/ui';
import type { SiteInquiry, SiteInquiryState } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrGhostButton, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import { IrSelect, IrTextArea } from '@/app/_components/IrRecordForm';

const LIST = '/inquiries';

const STATES: SiteInquiryState[] = ['접수', '처리중', '답변완료', '보류'];

const STATE_TONE = { 접수: 'wait', 처리중: 'brand', 답변완료: 'ok', 보류: 'neutral' } as const;

/**
 * 문의 상세 — 읽고 답한다.
 *
 * ## 보낸 사람의 글을 고치지 못하게 둔다
 * 문의 내용은 읽기만 한다. 오타를 고치고 싶어지는 자리지만, 이것은 **밖에서 들어온 기록**이라
 * 고치는 순간 무엇이 실제로 왔는지 알 수 없게 된다 — 나중에 "그렇게 말한 적 없다" 가 되면
 * 우리 쪽에 남은 것이 이 글뿐이다.
 *
 * ## 지역과 연락처를 답 위에 둔다
 * 답을 쓰기 전에 보는 것이 그 둘이다 — 어디인지에 따라 방문 일정이 달라지고, 번호가 있어야
 * 통화로 넘어갈지 정한다. 답 상자 아래에 두면 다 쓰고 나서 다시 올라와 읽게 된다.
 *
 * ## 답변완료로 바꿀 때만 답을 요구한다
 * 처리중 · 보류로 두는 동안에는 답이 비어도 된다. 완료로 표시하는 순간에만 막는다 — **답 없이
 * 완료된 문의**는 목록에서 사라져 다시는 눈에 띄지 않는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function InquiryDetailView({ inquiry }: { inquiry: SiteInquiry }) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<string>(inquiry.state);
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const needsAnswer = state === '답변완료' && !answer.trim();

  return (
    <>
      <IrPanel
        title="보낸 사람"
        description="답을 쓰기 전에 확인하세요."
        aside={<Badge tone={STATE_TONE[inquiry.state]}>{inquiry.state}</Badge>}
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 px-6 py-5 md:grid-cols-2">
          <Row label="회사명" value={inquiry.company} />
          <Row label="지역" value={inquiry.region} note="방문 일정을 정하는 값" />
          <Row label="담당자" value={inquiry.name} />
          <Row label="갈래" value={inquiry.kind} />
          <Row label="휴대폰" value={inquiry.phone} mono />
          <Row label="이메일" value={inquiry.email} mono />
          <Row label="받은 때" value={inquiry.receivedAt} mono />
          <Row label="첨부파일" value={inquiry.attachment || '없음'} />
        </dl>
      </IrPanel>

      <IrPanel title="문의 내용" description="보낸 사람이 적은 글 그대로입니다. 고칠 수 없습니다.">
        <p className="whitespace-pre-wrap px-6 py-5 text-sm leading-relaxed text-ink">
          {inquiry.message}
        </p>
      </IrPanel>

      <IrPanel title="답변" description="여기 적은 것이 보낸 사람의 메일로 갑니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField label="상태" htmlFor="inquiry-state" required hint="목록에서 남은 일을 세는 값입니다.">
            <IrSelect id="inquiry-state" value={state} onChange={setState} options={STATES} />
          </IrField>

          <IrField
            label="답변 내용"
            htmlFor="inquiry-answer"
            {...(needsAnswer
              ? { error: '답변완료로 바꾸려면 내용을 적어 주세요. 답 없이 완료된 문의는 다시 눈에 띄지 않습니다.' }
              : { hint: '보낸 사람이 쓴 말로 답하세요 — 우리 용어로 답하면 되묻는 문의가 한 번 더 옵니다.' })}
          >
            <IrTextArea
              id="inquiry-answer"
              rows={10}
              value={answer}
              onChange={setAnswer}
              placeholder={`${inquiry.name} 님, 문의 주셔서 감사합니다.`}
              invalid={needsAnswer}
            />
          </IrField>
        </div>

        <IrSaveRow>
          <IrGhostButton
            onClick={() => {
              toast.info({ message: '문의 목록으로 이동합니다.', detail: '저장하지 않은 것은 반영되지 않습니다.' });
              router.push(LIST);
            }}
          >
            목록
          </IrGhostButton>
          <IrPrimaryButton
            type="button"
            onClick={() => {
              if (needsAnswer) {
                toast.error({ message: '저장하지 못했습니다.', detail: '답변 내용이 비어 있습니다.' });
                return;
              }
              setAsking(true);
            }}
          >
            저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrConfirmModal
        open={asking}
        title={state === '답변완료' ? '답변을 보낼까요' : '상태를 바꿀까요'}
        message={
          state === '답변완료'
            ? '적은 내용이 보낸 사람의 메일로 갑니다. 보낸 뒤에는 되돌릴 수 없습니다.'
            : '목록에서 이 문의의 상태가 바뀝니다. 메일은 가지 않습니다.'
        }
        detail={`${inquiry.company} · ${inquiry.name} · ${inquiry.email}`}
        confirmLabel={state === '답변완료' ? '보내기' : '저장'}
        tone={state === '답변완료' ? 'danger' : 'primary'}
        onConfirm={() => {
          setAsking(false);
          toast.success({
            message: state === '답변완료' ? '답변을 보냈습니다.' : '상태를 저장했습니다.',
            detail: `${inquiry.id} · ${state}`,
          });
          router.push(LIST);
        }}
        onCancel={() => setAsking(false)}
      />
    </>
  );
}

/** 이름과 값 한 쌍. 번호·주소는 고정폭이라야 자릿수를 눈으로 견줄 수 있다. */
function Row({ label, value, note, mono }: { label: string; value: string; note?: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-ink-faint">
        {label}
        {note && <span className="ml-1.5">· {note}</span>}
      </dt>
      <dd className={`min-w-0 break-words text-sm ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}
