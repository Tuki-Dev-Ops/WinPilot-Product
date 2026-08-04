'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentSection,
  ContentToggle,
} from '@/app/contents/_components/ContentFormShell';
import { Checkbox, HintInput, HintTextarea, useToast } from '@winpilot/ui';
import {
  DEFAULT_INQUIRY_SETTINGS,
  type InquiryFieldSetting,
  type InquiryPathRecord,
  type InquirySettings,
} from '@/lib/data/inquiries';
import { hasErrors } from '@/lib/validation/content-record';
import {
  checkInquiryPath,
  validateInquirySettings,
  type InquirySettingsErrors,
} from '@/lib/validation/inquiry-record';

/**
 * 문의 폼 설정 — 고객 화면의 문의하기 폼이 이 값을 따른다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 * 이름·이메일·개인정보 동의는 끄지 못하게 잠근다. 그것이 없으면 답변을 보낼 방법도,
 * 개인정보를 받을 근거도 사라진다.
 */
export function InquirySettingsView() {
  const toast = useToast();
  const [value, setValue] = useState<InquirySettings>(DEFAULT_INQUIRY_SETTINGS);
  const [errors, setErrors] = useState<InquirySettingsErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [categoryDraft, setCategoryDraft] = useState('');
  const [pathDraft, setPathDraft] = useState('');
  const [labelDraft, setLabelDraft] = useState('');

  const update = <K extends keyof InquirySettings>(field: K, next: InquirySettings[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateInquirySettings(draft));
  };

  const addCategory = () => {
    const draft = categoryDraft.trim();
    if (!draft) return;
    if (value.categories.includes(draft)) {
      toast.error({ message: '이미 등록한 문의 유형입니다.', detail: draft });
      return;
    }
    update('categories', [...value.categories, draft]);
    setCategoryDraft('');
  };

  const addPath = () => {
    const reason = checkInquiryPath(pathDraft, labelDraft, value.paths.map((item) => item.path));
    if (reason) {
      toast.error({ message: '경로를 추가하지 못했습니다.', detail: reason });
      return;
    }
    update('paths', [...value.paths, { path: pathDraft.trim(), label: labelDraft.trim(), visible: true }]);
    setPathDraft('');
    setLabelDraft('');
  };

  const setField = (key: string, patch: Partial<InquiryFieldSetting>) => {
    update(
      'fields',
      value.fields.map((field) => (field.key === key ? { ...field, ...patch } : field)),
    );
  };

  const setPath = (path: string, patch: Partial<InquiryPathRecord>) => {
    update(
      'paths',
      value.paths.map((item) => (item.path === path ? { ...item, ...patch } : item)),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateInquirySettings(value);
    setErrors(found);

    if (hasErrors(found)) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const onDraftKeyDown = (run: () => void) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    // 폼 안의 Enter 는 기본적으로 제출이다 — 여기서는 항목 추가로 쓴다.
    event.preventDefault();
    run();
  };

  const enabledFields = value.fields.filter((field) => field.enabled);
  const visiblePaths = value.paths.filter((path) => path.visible);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection
          title="접수 경로"
          description="고객 화면에서 문의 폼을 띄울 경로입니다. 목록의 Path 열이 이 값으로 구분됩니다."
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <HintInput
              aria-label="경로"
              type="text"
              hint="/contact"
              value={pathDraft}
              onChange={(event) => setPathDraft(event.target.value)}
              onKeyDown={onDraftKeyDown(addPath)}
              className="flex-1"
            />
            <HintInput
              aria-label="경로 이름"
              type="text"
              hint="문의하기"
              value={labelDraft}
              onChange={(event) => setLabelDraft(event.target.value)}
              onKeyDown={onDraftKeyDown(addPath)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addPath}
              className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              추가
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="hidden gap-4 border-b border-border bg-surface px-4 py-2.5 text-xs text-ink-faint sm:grid sm:grid-cols-12 sm:items-center">
              <span className="sm:col-span-4">이름</span>
              <span className="sm:col-span-5">경로</span>
              <span className="sm:col-span-1 sm:text-center">노출</span>
              <span className="sm:col-span-2 sm:text-right">관리</span>
            </div>

            <div className="flex flex-col">
              {value.paths.map((item) => (
                <div
                  key={item.path}
                  className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-12 sm:items-center sm:gap-y-0"
                >
                  <span className="min-w-0 truncate text-sm sm:col-span-4">{item.label}</span>
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted sm:col-span-5">
                    {item.path}
                  </span>
                  <div className="flex items-center gap-2 sm:col-span-1 sm:justify-center">
                    <Checkbox
                      checked={item.visible}
                      onChange={(checked) => setPath(item.path, { visible: checked })}
                      label={`${item.label} 노출`}
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        update('paths', value.paths.filter((path) => path.path !== item.path))
                      }
                      className="h-8 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-3 text-sm text-signal-danger transition-colors duration-150 hover:border-signal-danger"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentSection>

        <ContentSection title="문의 유형" description="고객이 문의를 보낼 때 고르는 항목입니다.">
          <div className="flex items-center gap-2">
            <HintInput
              aria-label="문의 유형"
              type="text"
              hint="예: 상품 문의"
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              onKeyDown={onDraftKeyDown(addCategory)}
              invalid={Boolean(errors.categories)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addCategory}
              className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              추가
            </button>
          </div>

          {value.categories.length === 0 ? (
            <p className="text-sm text-ink-faint">등록한 문의 유형이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {value.categories.map((category) => (
                <span
                  key={category}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface py-1 pl-3 pr-1.5 text-sm"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() =>
                      update('categories', value.categories.filter((item) => item !== category))
                    }
                    aria-label={`${category} 삭제`}
                    className="shrink-0 rounded-full p-1 text-ink-faint transition-colors duration-150 hover:text-signal-danger"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.categories && <p className="text-sm text-signal-danger">{errors.categories}</p>}
        </ContentSection>

        <ContentSection title="수집 항목" description="이름·이메일·개인정보 동의는 끌 수 없습니다.">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="hidden gap-4 border-b border-border bg-surface px-4 py-2.5 text-xs text-ink-faint sm:grid sm:grid-cols-12 sm:items-center">
              <span className="sm:col-span-6">항목</span>
              <span className="sm:col-span-3 sm:text-center">사용</span>
              <span className="sm:col-span-3 sm:text-center">필수</span>
            </div>

            <div className="flex flex-col">
              {value.fields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-12 sm:items-center sm:gap-y-0"
                >
                  <div className="flex items-center gap-2 sm:col-span-6">
                    <span className="text-sm">{field.label}</span>
                    {field.locked && (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">
                        필수 항목
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-3 sm:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint sm:hidden">사용</span>
                    <Checkbox
                      checked={field.enabled}
                      disabled={field.locked ?? false}
                      onChange={(checked) =>
                        setField(field.key, { enabled: checked, ...(checked ? {} : { required: false }) })
                      }
                      label={`${field.label} 사용`}
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-3 sm:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint sm:hidden">필수</span>
                    <Checkbox
                      checked={field.required}
                      disabled={(field.locked ?? false) || !field.enabled}
                      onChange={(checked) => setField(field.key, { required: checked })}
                      label={`${field.label} 필수`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentSection>

        <ContentSection title="안내 문구">
          <ContentField
            id="inquiry-guide"
            label="폼 상단 안내"
            {...(errors.guideText ? { error: errors.guideText } : {})}
          >
            <HintTextarea
              id="inquiry-guide"
              hint="답변까지 걸리는 시간 등을 적어 주세요"
              value={value.guideText}
              onChange={(event) => update('guideText', event.target.value)}
              invalid={Boolean(errors.guideText)}
            />
          </ContentField>

          <ContentField
            id="inquiry-done"
            label="접수 완료 메시지"
            {...(errors.doneText ? { error: errors.doneText } : {})}
          >
            <HintTextarea
              id="inquiry-done"
              hint="문의를 보낸 뒤 고객에게 보여줄 문구"
              value={value.doneText}
              onChange={(event) => update('doneText', event.target.value)}
              invalid={Boolean(errors.doneText)}
            />
          </ContentField>

          <ContentToggle
            legend="접수 자동 회신 메일"
            options={['보냄', '보내지 않음']}
            value={value.autoReply}
            onChange={(next) => update('autoReply', next)}
          />
        </ContentSection>
      </div>

      <ContentFormActions mode="edit" onList={() => toast.info('문의 목록으로 이동합니다.')}>
        <ContentSection title="설정 요약">
          <dl className="flex flex-col gap-2">
            {[
              { label: '노출 경로', value: `${visiblePaths.length} / ${value.paths.length}개` },
              { label: '문의 유형', value: `${value.categories.length}개` },
              { label: '수집 항목', value: `${enabledFields.length}개` },
              { label: '자동 회신', value: value.autoReply ? '보냄' : '보내지 않음' },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{row.label}</dt>
                <dd className="text-sm tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </ContentSection>
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title="문의 폼 설정 저장"
        description="아래 설정으로 고객 화면의 문의 폼이 바뀝니다."
        confirmLabel="저장"
        summary={[
          { label: '노출 경로', value: `${visiblePaths.length}개` },
          { label: '문의 유형', value: value.categories.join(', ') || '없음' },
          { label: '수집 항목', value: enabledFields.map((field) => field.label).join(', ') },
          { label: '자동 회신', value: value.autoReply ? '보냄' : '보내지 않음' },
        ]}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success({
            message: '문의 폼 설정을 저장했습니다.',
            detail: `경로 ${visiblePaths.length}개 · 유형 ${value.categories.length}개`,
          });
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
