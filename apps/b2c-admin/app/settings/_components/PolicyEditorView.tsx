'use client';

import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentSection,
} from '@/app/contents/_components/ContentFormShell';
import { HintInput, HintTextarea, RichTextEditor, useToast } from '@winpilot/ui';
import { daysUntil, type PolicyRecord, type PolicyRevision } from '@/lib/data/policies';
import { hasErrors } from '@/lib/validation/content-record';
import {
  validatePolicy,
  type PolicyFormErrors,
  type PolicyFormInput,
} from '@/lib/validation/policy-record';

export type PolicyEditorViewProps = {
  policy: PolicyRecord;
  today: string;
};

/**
 * 약관 편집 — 서비스 이용약관과 개인정보 처리방침이 같이 쓴다.
 *
 * 약관은 고치는 것이 아니라 **개정하는 것**이다. 그래서 저장할 때 본문만 받지 않고
 * **버전 · 시행일 · 변경 요약**을 함께 받아 이력에 남긴다. 덮어쓰기만 하면 이전에 동의한
 * 고객이 무엇에 동의했는지 나중에 증명할 수 없다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PolicyEditorView({ policy, today }: PolicyEditorViewProps) {
  const toast = useToast();
  const [value, setValue] = useState<PolicyFormInput>({
    version: policy.version,
    effectiveAt: policy.effectiveAt,
    body: policy.body,
    changeSummary: '',
  });
  const [revisions, setRevisions] = useState<PolicyRevision[]>(policy.revisions);
  const [errors, setErrors] = useState<PolicyFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 본문이 실제로 바뀌었는지 — 오타만 고친 경우까지 버전을 올리라고 하지 않기 위해서다.
  const changed = value.body !== policy.body;

  const update = <K extends keyof PolicyFormInput>(field: K, next: PolicyFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) {
      setErrors(
        validatePolicy(draft, { previousVersion: policy.version, changed: draft.body !== policy.body }),
      );
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validatePolicy(value, { previousVersion: policy.version, changed });
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['version', 'effectiveAt', 'changeSummary'] as const).find((field) => found[field]);
      if (first) document.getElementById(`policy-${first}`)?.focus();
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const applySubmit = () => {
    setConfirmOpen(false);

    // 개정이면 이력 맨 위에 쌓는다. 내용을 안 바꿨으면 이력을 늘리지 않는다.
    if (changed) {
      setRevisions((previous) => [
        {
          version: value.version.trim(),
          effectiveAt: value.effectiveAt.trim(),
          summary: value.changeSummary.trim(),
        },
        ...previous,
      ]);
    }

    toast.success({
      message: `${policy.label}을(를) 저장했습니다.`,
      detail: changed
        ? `v${value.version.trim()} · ${value.effectiveAt.trim()} 시행`
        : '내용 변경 없이 저장했습니다.',
    });
    setValue((previous) => ({ ...previous, changeSummary: '' }));
  };

  const left = daysUntil(value.effectiveAt, today);
  const scheduled = left > 0;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection
          title="개정 정보"
          description="본문을 바꾸면 버전을 올리고 무엇이 바뀌었는지 남겨야 합니다."
        >
          <ContentField id="policy-version" label="버전" {...(errors.version ? { error: errors.version } : {})}>
            <HintInput
              id="policy-version"
              type="text"
              inputMode="decimal"
              hint="예: 1.3"
              value={value.version}
              onChange={(event) => update('version', event.target.value)}
              invalid={Boolean(errors.version)}
            />
            <p className="text-xs text-ink-faint">현재 시행 중인 버전 v{policy.version}</p>
          </ContentField>

          <ContentField
            id="policy-effectiveAt"
            label="시행일"
            {...(errors.effectiveAt ? { error: errors.effectiveAt } : {})}
          >
            <HintInput
              id="policy-effectiveAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD"
              value={value.effectiveAt}
              onChange={(event) => update('effectiveAt', event.target.value)}
              invalid={Boolean(errors.effectiveAt)}
            />
            <p className="text-xs text-ink-faint">
              {scheduled ? `${left}일 뒤 시행 예정` : '이미 시행 중입니다'}
            </p>
          </ContentField>

          <ContentField
            id="policy-changeSummary"
            label={changed ? '변경 요약' : '변경 요약 (본문을 바꾸면 필요합니다)'}
            {...(errors.changeSummary ? { error: errors.changeSummary } : {})}
          >
            <HintTextarea
              id="policy-changeSummary"
              hint="예: 환불 조항 문구 정리"
              value={value.changeSummary}
              onChange={(event) => update('changeSummary', event.target.value)}
              invalid={Boolean(errors.changeSummary)}
            />
          </ContentField>

          {/*
            이용자에게 불리한 변경은 30일 전 공지가 필요하다. 시행일을 촉박하게 잡는 실수를
            저장 전에 알려 준다 — 공지 기간은 되돌릴 수 없다.
          */}
          {changed && left < 30 && (
            <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
              시행일까지 {left <= 0 ? '남은 기간이 없습니다' : `${left}일 남았습니다`}. 이용자에게 불리한 변경은
              시행일 30일 전에 공지해야 합니다.
            </p>
          )}
        </ContentSection>

        <ContentSection title="본문" description="글자 서식과 표, 목록을 넣을 수 있습니다.">
          <ContentField id="policy-body" label={policy.label} {...(errors.body ? { error: errors.body } : {})}>
            <RichTextEditor
              id="policy-body"
              hint={`${policy.label} 내용을 입력해 주세요`}
              value={value.body}
              onChange={(html) => update('body', html)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="개정 이력" description="이전 버전은 지우지 않습니다. 동의 시점을 증명하는 근거입니다.">
          <div className="flex flex-col">
            <div className="grid grid-cols-12 gap-4 border-b border-border pb-3 text-xs text-ink-faint">
              <span className="col-span-2">버전</span>
              <span className="col-span-3">시행일</span>
              <span className="col-span-7">변경 내용</span>
            </div>

            {revisions.map((revision) => (
              <div
                key={`${revision.version}-${revision.effectiveAt}`}
                className="grid grid-cols-12 gap-4 border-b border-border py-3 last:border-b-0"
              >
                <span className="col-span-2 font-mono text-sm tabular-nums">v{revision.version}</span>
                <span className="col-span-3 font-mono text-xs tabular-nums text-ink-muted">
                  {revision.effectiveAt}
                </span>
                <span className="col-span-7 min-w-0 truncate text-sm text-ink-muted">{revision.summary}</span>
              </div>
            ))}
          </div>
        </ContentSection>
      </div>

      <ContentFormActions
        mode="edit"
        onList={() => {
          setValue({
            version: policy.version,
            effectiveAt: policy.effectiveAt,
            body: policy.body,
            changeSummary: '',
          });
          setErrors({});
          setSubmitted(false);
          toast.info({ message: '입력을 되돌렸습니다.', detail: '마지막으로 저장된 내용으로 돌아갑니다.' });
        }}
      >
        <ContentSection title="상태">
          <dl className="flex flex-col gap-2">
            {[
              { label: '문서', value: policy.label },
              { label: '현재 버전', value: `v${policy.version}` },
              { label: '작성 중 버전', value: `v${value.version || '-'}` },
              { label: '시행', value: scheduled ? `${left}일 뒤` : '시행 중' },
              { label: '본문 변경', value: changed ? '있음' : '없음' },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{row.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </ContentSection>

        <ContentSection title="고객 화면 미리보기">
          <div className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
            <p className="text-sm font-semibold">{policy.label}</p>
            <p className="font-mono text-xs tabular-nums text-ink-faint">
              v{value.version} · {value.effectiveAt} 시행
            </p>
            {/*
              본문은 방금 이 브라우저에서 담당자가 입력한 HTML 이다.
              바깥에서 받아 온 값이 아니므로 편집기에 넣은 것과 같은 신뢰 수준으로 그린다.
            */}
            <div
              className="max-h-64 overflow-auto text-xs leading-relaxed [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-xs [&_h3]:font-semibold [&_li]:my-0.5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4"
              dangerouslySetInnerHTML={{ __html: value.body }}
            />
          </div>
        </ContentSection>
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={`${policy.label} 저장`}
        description={
          changed
            ? '개정 이력에 남고, 시행일부터 고객 화면에 이 내용이 표시됩니다.'
            : '본문 변경 없이 저장합니다. 개정 이력에는 남지 않습니다.'
        }
        confirmLabel="저장"
        summary={[
          { label: '문서', value: policy.label },
          { label: '버전', value: `v${policy.version} → v${value.version.trim()}` },
          { label: '시행일', value: value.effectiveAt.trim() },
          { label: '본문 변경', value: changed ? '있음' : '없음' },
          { label: '변경 요약', value: value.changeSummary.trim() || '없음' },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
