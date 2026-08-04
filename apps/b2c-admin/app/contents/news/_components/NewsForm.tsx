'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentReadonly,
  ContentSection,
  ContentToggle,
} from '@/app/contents/_components/ContentFormShell';
import { ContentMobilePreview } from '@/app/contents/_components/ContentMobilePreview';
import { HintInput, HintTextarea, useToast } from '@winpilot/ui';
import {
  hasErrors,
  isHttpUrl,
  validateNews,
  type NewsFormErrors,
  type NewsFormInput,
} from '@/lib/validation/content-record';

export const EMPTY_NEWS: NewsFormInput = {
  title: '',
  press: '',
  url: '',
  publishedAt: '',
  summary: '',
  visible: true,
};

export type NewsFormProps = {
  mode: 'create' | 'edit';
  newsCode: string;
  createdAt: string;
  initial?: NewsFormInput;
};

/**
 * 뉴스 등록·수정.
 *
 * 뉴스는 본문을 옮겨 싣지 않고 **원문 링크**로 보낸다 — 기사 저작권은 언론사에 있다.
 * 그래서 이 화면의 핵심 입력은 링크이며, 주소 형식을 저장 전에 확인한다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function NewsForm({ mode, newsCode, createdAt, initial }: NewsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<NewsFormInput>(initial ?? EMPTY_NEWS);
  const [errors, setErrors] = useState<NewsFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof NewsFormInput>(field: K, next: NewsFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateNews(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateNews(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['title', 'press', 'url', 'publishedAt'] as const).find((field) => found[field]);
      if (first) document.getElementById(`news-${first}`)?.focus();
      toast.error({
        message: `${mode === 'create' ? '등록' : '저장'}하지 못했습니다.`,
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const applySubmit = () => {
    setConfirmOpen(false);
    toast.success({
      message: `뉴스를 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${newsCode} · ${value.title.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '뉴스 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/contents/news');
  };

  const linkReady = isHttpUrl(value.url);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="기본 정보">
          <ContentReadonly label="뉴스 코드" value={newsCode} note={mode === 'create' ? '자동생성' : '수정 불가'} />
          <ContentReadonly label="등록일" value={createdAt} note="자동입력" />

          <ContentField id="news-title" label="제목" {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="news-title"
              type="text"
              hint="기사 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
            />
          </ContentField>

          <ContentField id="news-press" label="언론사" {...(errors.press ? { error: errors.press } : {})}>
            <HintInput
              id="news-press"
              type="text"
              hint="예: 테크리포트"
              value={value.press}
              onChange={(event) => update('press', event.target.value)}
              invalid={Boolean(errors.press)}
            />
          </ContentField>

          <ContentField
            id="news-publishedAt"
            label="발행일"
            {...(errors.publishedAt ? { error: errors.publishedAt } : {})}
          >
            <HintInput
              id="news-publishedAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD"
              value={value.publishedAt}
              onChange={(event) => update('publishedAt', event.target.value)}
              invalid={Boolean(errors.publishedAt)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="원문 링크" description="고객이 이 주소로 이동합니다. 기사 본문은 싣지 않습니다.">
          <ContentField id="news-url" label="링크 주소" {...(errors.url ? { error: errors.url } : {})}>
            <HintInput
              id="news-url"
              type="url"
              inputMode="url"
              hint="https://example.com/news/..."
              value={value.url}
              onChange={(event) => update('url', event.target.value)}
              invalid={Boolean(errors.url)}
            />
          </ContentField>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
            <p className="min-w-0 truncate text-xs text-ink-muted">
              {linkReady ? '주소 형식이 올바릅니다.' : 'http:// 또는 https:// 로 시작해야 합니다.'}
            </p>
            {linkReady && (
              <a
                href={value.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => toast.info('원문을 새 창에서 엽니다.')}
                className="shrink-0 whitespace-nowrap text-xs text-brand-700 underline underline-offset-2 dark:text-brand-300"
              >
                링크 열어 확인
              </a>
            )}
          </div>
        </ContentSection>

        <ContentSection title="요약 (선택)">
          <ContentField id="news-summary" label="요약">
            <HintTextarea
              id="news-summary"
              hint="목록에 함께 보여줄 한두 문장을 입력해 주세요"
              value={value.summary}
              onChange={(event) => update('summary', event.target.value)}
            />
          </ContentField>
        </ContentSection>
      </div>

      <ContentFormActions mode={mode} onList={goToList}>
        <ContentSection title="노출 설정">
          <ContentToggle
            legend="고객 화면 노출"
            options={['노출', '숨김']}
            value={value.visible}
            onChange={(next) => update('visible', next)}
          />
        </ContentSection>

        <ContentMobilePreview
          kind="뉴스"
          visible={value.visible}
          title={value.title}
          meta={[
            { label: '언론사', value: value.press },
            { label: '발행일', value: value.publishedAt },
          ]}
          summary={value.summary}
          linkUrl={value.url}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '뉴스 등록' : '뉴스 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 뉴스를 등록합니다. 고객은 원문 링크로 이동합니다.'
            : '아래 내용으로 뉴스를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '뉴스 코드', value: newsCode },
          { label: '제목', value: value.title.trim() },
          { label: '언론사', value: value.press.trim() },
          { label: '발행일', value: value.publishedAt.trim() },
          { label: '원문 링크', value: value.url.trim() },
          { label: '노출', value: value.visible ? '노출' : '숨김' },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
