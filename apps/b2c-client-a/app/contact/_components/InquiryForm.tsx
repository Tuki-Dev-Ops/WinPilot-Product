'use client';

import { useState, type FormEvent } from 'react';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';

/**
 * 문의 폼 — **검사 → 확인 → 접수 → 안내**.
 *
 * 폼 구성(항목·필수 여부·안내 문구·첨부 규격)은 전부 어드민에서 온다. 템플릿이 정하지 않는다.
 *
 * 첨부는 **고른 파일을 목록으로 보여 준다.** 파일 이름이 보이지 않으면 무엇을 붙였는지 알 수 없고,
 * 잘못 고른 것을 빼는 방법도 없다.
 *
 * ## 어드민 연동
 * - 문의 유형 · 입력 항목 · 필수 여부 · 안내 문구 ← `b2c-admin` 문의 > 설정 (`/inquiries/settings`)
 * - 첨부 형식·용량 제한 ← 같은 설정의 첨부 규격 (store `INQUIRY_ATTACHMENT`)
 * - 보낸 문의는 어드민 문의 > 목록(`/inquiries`)에 **Path `/contact`** 로 쌓인다
 * - 개인정보 처리방침 문구 ← 설정 > 약관 정보 (store `PRIVACY`)
 */
type Values = Record<string, string>;

export function InquiryForm() {
  const toast = useToast();
  const { inquiryForm } = CONTENT;
  const { attachment } = inquiryForm;

  const textFields = inquiryForm.fields.filter(
    (field) => field.key !== 'privacy' && field.key !== 'attachment',
  );
  const hasAttachment = inquiryForm.fields.some((field) => field.key === 'attachment');
  const privacyField = inquiryForm.fields.find((field) => field.key === 'privacy');

  const [category, setCategory] = useState(inquiryForm.categories[0] ?? '');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Values>({});
  const [confirming, setConfirming] = useState(false);

  const set = (key: string, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: '' }));
  };

  const pickFiles = (list: FileList | null) => {
    if (!list) return;

    const picked = Array.from(list);
    const tooMany = files.length + picked.length > attachment.maxCount;
    if (tooMany) {
      toast.error({
        message: '첨부할 수 있는 개수를 넘었습니다',
        detail: `최대 ${attachment.maxCount}개까지 붙일 수 있습니다.`,
      });
      return;
    }

    // 형식과 용량은 고른 순간 걸러 낸다 — 보내고 나서 막으면 적은 내용이 통째로 날아간다.
    const allowed = attachment.accept.split(',').map((item) => item.trim().toLowerCase());
    const rejected = picked.find((file) => {
      const dot = file.name.lastIndexOf('.');
      const extension = dot === -1 ? '' : file.name.slice(dot).toLowerCase();
      return !allowed.includes(extension);
    });
    if (rejected) {
      toast.error({ message: '붙일 수 없는 형식입니다', detail: `${rejected.name} · ${attachment.acceptText} 만 됩니다.` });
      return;
    }

    const tooBig = picked.find((file) => file.size > attachment.maxMb * 1024 * 1024);
    if (tooBig) {
      toast.error({ message: '파일이 너무 큽니다', detail: `${tooBig.name} · 최대 ${attachment.maxMb}MB` });
      return;
    }

    setFiles((previous) => [...previous, ...picked.map((file) => file.name)]);
    toast.info({ message: '파일을 붙였습니다', detail: picked.map((file) => file.name).join(', ') });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next: Values = {};
    textFields.forEach((field) => {
      if (field.required && !(values[field.key] ?? '').trim()) next[field.key] = `${field.label}을(를) 입력해 주세요.`;
    });
    if (!message.trim()) next.message = `${COPY.inquiry.messageLabel}을 입력해 주세요.`;

    // 이메일은 모양이 어긋나면 답변이 아예 가지 않는다 — 다른 항목보다 한 겹 더 본다.
    const email = (values.email ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '이메일 형식을 확인해 주세요.';

    setErrors(next);

    const failed = Object.values(next);
    if (failed.length > 0) {
      toast.error({ message: '문의를 보내지 못했습니다', detail: `${failed.length}개 항목을 확인해 주세요 — ${failed[0]}` });
      return;
    }

    if (privacyField?.required && !agreed) {
      toast.error({ message: '문의를 보내지 못했습니다', detail: `${privacyField.label}에 동의해 주세요.` });
      return;
    }

    setConfirming(true);
  };

  const send = () => {
    setConfirming(false);
    toast.success({ message: '문의가 접수되었습니다', detail: inquiryForm.doneText });
  };

  return (
    <>
      <form
        id={SLOT.inquiryForm}
        data-ssot-cid={cid('inquiry.settings', 'SiteInquiryForm')}
        onSubmit={submit}
        className="flex w-full flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            {COPY.inquiry.categoryLabel}
            <span className="ml-1 text-signal-danger">*</span>
          </span>
          {/*
            네이티브 select 를 쓰지 않는다 — option 텍스트는 DOM 텍스트 노드가 아니라
            추출되지 않고 Figma 에서 빈 상자가 된다 (docs/spec/05-component.md).
          */}
          <div className="flex flex-wrap gap-2">
            {inquiryForm.categories.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                    active ? 'border-ink bg-ink font-medium text-white' : 'border-border-strong text-ink-muted hover:text-ink'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {textFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <label htmlFor={`inquiry-${field.key}`} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="ml-1 text-signal-danger">*</span>}
            </label>
            <input
              id={`inquiry-${field.key}`}
              name={field.key}
              type="text"
              value={values[field.key] ?? ''}
              onChange={(event) => set(field.key, event.target.value)}
              aria-invalid={Boolean(errors[field.key])}
              className={`h-11 w-full rounded-lg border bg-surface px-3 text-sm ${
                errors[field.key] ? 'border-signal-danger' : 'border-border-strong'
              }`}
            />
            {errors[field.key] && <p className="text-xs text-signal-danger">{errors[field.key]}</p>}
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <label htmlFor="inquiry-message" className="text-sm font-medium">
            {COPY.inquiry.messageLabel}
            <span className="ml-1 text-signal-danger">*</span>
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={7}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setErrors((previous) => ({ ...previous, message: '' }));
            }}
            aria-invalid={Boolean(errors.message)}
            className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm ${
              errors.message ? 'border-signal-danger' : 'border-border-strong'
            }`}
          />
          {errors.message && <p className="text-xs text-signal-danger">{errors.message}</p>}
        </div>

        {hasAttachment && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{COPY.inquiry.attachmentLabel}</span>
            {/*
              파일 선택 버튼은 브라우저가 그리는 부분이라 모양을 맞출 수 없고, 버튼 안 글자도
              DOM 텍스트가 아니라 추출되지 않는다. 그래서 입력은 감추고 라벨을 눌러 연다.
            */}
            <label
              htmlFor="inquiry-attachment"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface px-4 py-7 text-center"
            >
              <span className="text-ink-faint">
                <ClipIcon />
              </span>
              <span className="text-sm text-ink-muted">{COPY.inquiry.attachmentDrop}</span>
              <span className="text-xs text-ink-faint">
                {attachment.acceptText} · 최대 {attachment.maxMb}MB · {attachment.maxCount}개까지
              </span>
            </label>
            <input
              id="inquiry-attachment"
              name="attachment"
              type="file"
              multiple
              accept={attachment.accept}
              onChange={(event) => pickFiles(event.target.files)}
              className="hidden"
            />

            {files.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {files.map((name, index) => (
                  <li
                    key={`${name}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted"
                  >
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((previous) => previous.filter((_, position) => position !== index));
                        toast.info({ message: '첨부를 뺐습니다', detail: name });
                      }}
                      className="shrink-0 whitespace-nowrap text-ink-faint hover:text-ink"
                    >
                      빼기
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {privacyField && (
          <div className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-4">
            {/*
              동의는 **눌러서 켜는 것**이어야 한다. 안내 문장만 두면 무엇에 동의했는지 남지 않고,
              운영자가 필수로 켜 둔 뜻도 화면에 나타나지 않는다.
              네이티브 체크박스 그림은 브라우저마다 달라 추출이 어긋나므로 직접 그린다.
            */}
            <label htmlFor="inquiry-privacy" className="flex cursor-pointer items-center gap-2.5">
              <input
                id="inquiry-privacy"
                name="privacy"
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="size-4 shrink-0 appearance-none rounded border border-border-strong bg-canvas checked:border-brand-500 checked:bg-brand-500"
              />
              <span className="text-sm">
                {privacyField.label}
                {privacyField.required && <span className="ml-1 text-signal-danger">*</span>}
              </span>
            </label>
            <p className="text-xs leading-relaxed text-ink-muted">
              {COPY.inquiry.privacyGuide}{' '}
              <a href={ROUTES.privacy} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
                {CONTENT.privacy.label}
              </a>
              을 확인해 주세요.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {COPY.inquiry.submit}
        </button>
      </form>

      <ConfirmDialog
        open={confirming}
        title="문의를 보낼까요?"
        description={inquiryForm.guideText}
        confirmLabel={COPY.inquiry.submit}
        tone="brand"
        onConfirm={send}
        onClose={() => setConfirming(false)}
        summary={[
          { label: COPY.inquiry.categoryLabel, value: category },
          ...textFields.map((field) => ({ label: field.label, value: values[field.key] ?? '-' })),
          ...(files.length > 0 ? [{ label: COPY.inquiry.attachmentLabel, value: `${files.length}개` }] : []),
        ]}
      />
    </>
  );
}

/** 첨부 안내 아이콘 — 클립. 파일이라는 뜻을 글자 없이 전한다. */
function ClipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M13.5 6.5 L7.8 12.2 a2.4 2.4 0 0 0 3.4 3.4 l6.1 -6.1 a4 4 0 0 0 -5.7 -5.7 l-6.1 6.1 a5.6 5.6 0 0 0 7.9 7.9 L17 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
