'use client';

import { useEffect, useState } from 'react';
import { Badge, Dropdown, HintTextarea, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import {
  INQUIRY_STATES,
  INQUIRY_TONE,
  type InquiryRecord,
  type InquiryState,
} from '@/lib/data/inquiries';
import { STAFF } from '@/lib/data/settings';
import { findTenant } from '@/lib/data/tenants';
import { errorSummary, hasErrors, maxLength, validate, type FormErrors, type FormSpec } from '@/lib/validation/form';

export type InquiryAnswerInput = { answer: string; state: InquiryState; assignee: string };

type AnswerField = 'answer';

const ANSWER_SPEC: FormSpec<AnswerField> = {
  answer: {
    label: '답변',
    required: true,
    hint: '고객사 담당자가 그대로 읽는 말입니다.',
    rules: [maxLength(1000)],
  },
};

/** 아직 답하지 않은 상태. 답을 비운 채로 둘 수 있는 상태들이다. */
const UNANSWERED: InquiryState[] = ['접수', '처리중', '보류'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm">{children}</dd>
    </div>
  );
}

/**
 * 문의 상세 — **답변도 여기서 쓴다**.
 *
 * ## 왜 줄 안에서 펼치지 않나
 * 전에는 줄을 누르면 그 아래가 열리며 내용과 답변을 읽기만 했다. 그래서 답을 쓰려면 이 화면을
 * 떠나야 했고, 이 목록을 여는 이유가 거의 언제나 **답할 것을 찾는 일**이라 매번 떠나게 됐다.
 * 펼치기는 또 목록의 줄 높이를 그때그때 바꿔, 다음 줄을 누르려던 손이 빗나간다.
 *
 * ## 왜 상세 화면이 아니라 모달인가
 * 한 건에 담긴 것이 **제목 · 내용 · 답변 · 상태 · 담당** 다섯이다. 화면을 따로 세우면 답 하나
 * 쓰는 데 목록 → 상세 → 저장 → 목록으로 네 번 오간다. 반대로 권한 세부 설정처럼 켤 칸이 예순
 * 개인 자리는 모달에 담기지 않아 화면을 세웠다 — 값의 개수가 자리를 정한다.
 *
 * ## 답변완료로 옮기려면 답이 있어야 한다
 * 답이 빈 채로 완료가 되면 목록에서는 끝난 것으로 보이는데 고객사는 아무것도 받지 못한다.
 * 이 어긋남은 고객사가 다시 물어볼 때에야 드러난다.
 */
export function InquiryDetailModal({
  open,
  inquiry,
  onClose,
  onSubmit,
}: {
  open: boolean;
  inquiry: InquiryRecord | null;
  onClose: () => void;
  onSubmit: (input: InquiryAnswerInput) => void;
}) {
  const toast = useToast();
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState<InquiryState>('접수');
  const [assignee, setAssignee] = useState('');
  const [errors, setErrors] = useState<FormErrors<AnswerField>>({});
  const [submitted, setSubmitted] = useState(false);

  /* 창을 열 때마다 그 문의의 값으로 되돌린다 — 앞서 열어 둔 문의의 답이 남아 있으면 엉뚱한 곳에 저장된다. */
  useEffect(() => {
    if (!open || !inquiry) return;
    setAnswer(inquiry.answer);
    setState(inquiry.state);
    setAssignee(inquiry.assignee);
    setErrors({});
    setSubmitted(false);
  }, [open, inquiry]);

  if (!inquiry) return null;

  const tenant = findTenant(inquiry.tenantId);

  /* 아직 답하지 않은 상태로 두는 동안에는 답이 비어 있어도 막지 않는다. */
  const answerRequired = !UNANSWERED.includes(state);

  const commit = (next: { answer: string; state: InquiryState }) => {
    setAnswer(next.answer);
    setState(next.state);
    if (submitted) setErrors(UNANSWERED.includes(next.state) ? {} : validate(ANSWER_SPEC, { answer: next.answer }));
  };

  const submit = () => {
    setSubmitted(true);
    const found = answerRequired ? validate(ANSWER_SPEC, { answer }) : {};
    setErrors(found);

    if (hasErrors(found)) {
      /*
        칸 밑에 붉은 글씨를 띄우면서 토스트로도 알린다. 창이 길어 저장 단추와 빈 칸이 함께
        보이지 않을 때가 있고, 그때는 눌렀는데 아무 일도 없는 것처럼 보인다.
      */
      toast.error({ message: '저장하지 못했습니다.', detail: errorSummary(found) });
      return;
    }

    onSubmit({ answer: answer.trim(), state, assignee });
  };

  return (
    <InternalModal
      open={open}
      title={inquiry.title}
      description={`${tenant?.name ?? inquiry.tenantId} · ${inquiry.sender} 님이 보낸 문의입니다.`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="저장"
    >
      <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
        <Row label="문의 번호">
          <span className="font-mono text-xs">{inquiry.id}</span>
        </Row>
        <Row label="분류">{inquiry.category}</Row>
        <Row label="접수일">
          <span className="font-mono text-xs tabular-nums">{inquiry.receivedAt}</span>
        </Row>
        <Row label="지금 상태">
          <Badge tone={INQUIRY_TONE[inquiry.state]}>{inquiry.state}</Badge>
        </Row>
        {/* 급한 문의는 창 안에서도 표시한다 — 목록에서만 붉으면 창을 연 뒤에는 잊는다. */}
        {inquiry.urgent && (
          <Row label="급함">
            <Badge tone="danger">시간이 곧 손해인 문의</Badge>
          </Row>
        )}
      </dl>

      <InternalField label="문의 내용">
        <p className="whitespace-pre-line rounded-lg border border-border px-4 py-3 text-sm leading-relaxed">
          {inquiry.body}
        </p>
      </InternalField>

      <InternalField label="담당" htmlFor="inquiry-assignee" hint="맡은 사람이 없으면 아무도 손대지 않은 채로 남습니다.">
        <Dropdown
          id="inquiry-assignee"
          label="담당 선택"
          options={[
            { value: '', label: '없음' },
            ...STAFF.map((one) => ({ value: one.name, label: one.name, hint: one.team })),
          ]}
          value={assignee}
          onChange={setAssignee}
        />
      </InternalField>

      <InternalField label="상태" htmlFor="inquiry-state" hint="답변완료로 옮기려면 답변이 있어야 합니다.">
        <Dropdown
          id="inquiry-state"
          label="상태 선택"
          options={INQUIRY_STATES.map((one) => ({ value: one, label: one }))}
          value={state}
          onChange={(next) => commit({ answer, state: next as InquiryState })}
        />
      </InternalField>

      <InternalField
        label={ANSWER_SPEC.answer.label}
        htmlFor="inquiry-answer"
        required={answerRequired}
        {...(errors.answer ? { error: errors.answer } : { hint: ANSWER_SPEC.answer.hint })}
      >
        <HintTextarea
          id="inquiry-answer"
          hint="예: 실결제 모드로 저장되어 있었습니다. 테스트로 되돌리고 결제는 취소 처리했습니다."
          rows={5}
          value={answer}
          onChange={(event) => commit({ answer: event.target.value, state })}
          invalid={answerRequired && !answer.trim()}
        />
      </InternalField>
    </InternalModal>
  );
}
