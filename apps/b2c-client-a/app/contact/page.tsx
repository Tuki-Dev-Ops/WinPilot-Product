import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `inquiry.settings` · B2C Client (템플릿 A) · route `/contact`
 *
 * 폼 구성은 어드민의 **문의 폼 설정**에서 온다 — 항목·필수 여부·안내 문구를 템플릿이 정하지 않는다.
 * 어드민 목록의 Path 열이 이 경로(`/contact`)로 표시된다.
 */
export const metadata: Metadata = { title: `${COPY.inquiry.title} — ${CONTENT.seo.title}` };

export default function ContactPage() {
  const { inquiryForm } = CONTENT;

  return (
    <SiteShell>
      <PageTitle title={COPY.inquiry.title} description={inquiryForm.guideText} />

      <form
        id={SLOT.inquiryForm}
        data-ssot-cid={cid('inquiry.settings', 'SiteInquiryForm')}
        className="flex max-w-160 flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="inquiry-category" className="text-sm font-medium">
            {COPY.inquiry.categoryLabel}
          </label>
          {/*
            네이티브 select 를 쓰지 않는다 — option 텍스트는 DOM 텍스트 노드가 아니라
            추출되지 않고 Figma 에서 빈 상자가 된다 (docs/spec/05-component.md).
          */}
          <div id="inquiry-category" className="flex flex-wrap gap-2">
            {inquiryForm.categories.map((category) => (
              <span
                key={category}
                className="shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-3 py-2 text-sm text-ink-muted"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {inquiryForm.fields
          .filter((field) => field.key !== 'privacy')
          .map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label htmlFor={`inquiry-${field.key}`} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="ml-1 text-signal-danger">*</span>}
              </label>
              <input
                id={`inquiry-${field.key}`}
                name={field.key}
                type="text"
                className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
              />
            </div>
          ))}

        <div className="flex flex-col gap-2">
          <label htmlFor="inquiry-message" className="text-sm font-medium">
            문의 내용<span className="ml-1 text-signal-danger">*</span>
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={6}
            className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm"
          />
        </div>

        {inquiryForm.fields.some((field) => field.key === 'privacy') && (
          <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
            개인정보 수집 동의가 필요합니다. 자세한 내용은 {CONTENT.privacy.label}을 확인해 주세요.
          </p>
        )}

        <button
          type="button"
          className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
        >
          {COPY.inquiry.submit}
        </button>
      </form>
    </SiteShell>
  );
}
