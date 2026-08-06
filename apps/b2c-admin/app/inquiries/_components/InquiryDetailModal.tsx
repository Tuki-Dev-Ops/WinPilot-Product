'use client';

import { useEffect, useState } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { Button, Modal, RichTextEditor } from '@winpilot/ui';
import {
  INQUIRY_STATES,
  INQUIRY_STATE_TONE,
  pathLabel,
  type InquiryRecord,
  type InquiryState,
} from '@/lib/data/inquiries';
import { hasErrors } from '@/lib/validation/content-record';
import { validateAnswer, type AnswerFormErrors } from '@/lib/validation/inquiry-record';

export type InquiryAnswerInput = { answer: string; state: InquiryState };

export type InquiryDetailModalProps = {
  open: boolean;
  inquiry: InquiryRecord | null;
  onClose: () => void;
  onSubmit: (input: InquiryAnswerInput) => void;
};

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
 * 목록에서 상세로 이동시키면 답변 하나 쓰는 데 화면을 두 번 오가게 된다.
 * 문의는 한 건이 짧고 처리량이 많은 일이라, 목록 위에서 바로 끝내는 편이 맞다.
 */
export function InquiryDetailModal({ open, inquiry, onClose, onSubmit }: InquiryDetailModalProps) {
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState<InquiryState>('접수');
  const [errors, setErrors] = useState<AnswerFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || !inquiry) return;
    setAnswer(inquiry.answer);
    setState(inquiry.state);
    setErrors({});
    setSubmitted(false);
  }, [open, inquiry]);

  const update = (nextAnswer: string, nextState: InquiryState) => {
    setAnswer(nextAnswer);
    setState(nextState);
    if (submitted) setErrors(validateAnswer({ answer: nextAnswer, state: nextState }));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validateAnswer({ answer, state });
    setErrors(found);
    if (hasErrors(found)) return;
    setConfirmOpen(true);
  };

  if (!inquiry) return null;

  return (
    <>
      <Modal
        open={open}
        title="문의 상세"
        description={`${inquiry.id} · ${pathLabel(inquiry.path)}`}
        onClose={onClose}
        footer={
          <>
            <Button tone="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button onClick={submit}>
              답변 저장
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
            <Row label="접수 경로">
              <span className="font-mono text-xs text-ink-muted">{inquiry.path}</span>
            </Row>
            <Row label="문의 유형">{inquiry.category}</Row>
            <Row label="이름">{inquiry.name}</Row>
            <Row label="이메일">
              <span className="font-mono text-xs">{inquiry.email}</span>
            </Row>
            <Row label="연락처">
              <span className="font-mono text-xs tabular-nums">{inquiry.phone || '미입력'}</span>
            </Row>
            <Row label="접수일시">
              <span className="font-mono text-xs tabular-nums text-ink-muted">{inquiry.createdAt}</span>
            </Row>
          </dl>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{inquiry.title}</span>
            {/* 고객이 적은 글은 서식 없이 그대로 보여준다 — 줄바꿈만 살린다. */}
            <p className="whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed">
              {inquiry.message}
            </p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">처리 상태</legend>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INQUIRY_STATES.map((option) => {
                const active = option === state;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update(answer, option)}
                    className={`h-10 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
                      active
                        ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'border-border-strong text-ink-muted hover:border-ink-faint'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="inquiry-answer" className="text-sm font-medium">
              답변
            </label>
            <RichTextEditor
              id="inquiry-answer"
              hint="답변 내용을 입력해 주세요"
              value={answer}
              onChange={(html) => update(html, state)}
            />
            {errors.answer && <p className="text-sm text-signal-danger">{errors.answer}</p>}
            {inquiry.answeredAt && (
              <p className="text-xs text-ink-faint">
                마지막 답변 {inquiry.answeredAt} · {inquiry.answeredBy}
              </p>
            )}
          </div>
        </div>
      </Modal>

      <AdminConfirmModal
        open={confirmOpen}
        elevated
        tone="brand"
        title="답변 저장"
        description={
          state === '답변완료'
            ? '답변을 저장하고 처리 상태를 답변완료로 바꿉니다.'
            : '답변 내용과 처리 상태를 저장합니다.'
        }
        confirmLabel="저장"
        summary={[
          { label: '문의번호', value: inquiry.id },
          { label: '문의자', value: `${inquiry.name} · ${inquiry.email}` },
          { label: '접수 경로', value: pathLabel(inquiry.path) },
          { label: '처리 상태', value: state },
        ]}
        onConfirm={() => {
          setConfirmOpen(false);
          onSubmit({ answer, state });
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}

export { INQUIRY_STATE_TONE };
