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
import { HintInput, RichTextEditor, useToast } from '@winpilot/ui';
import {
  hasErrors,
  validateNotice,
  type NoticeFormErrors,
  type NoticeFormInput,
} from '@/lib/validation/content-record';
import { visibilityLabel } from '@/app/_components/AdminVisibilityBadge';

export const EMPTY_NOTICE: NoticeFormInput = { title: '', body: '', pinned: false, visible: true };

export type NoticeFormProps = {
  mode: 'create' | 'edit';
  noticeCode: string;
  createdAt: string;
  initial?: NoticeFormInput;
};

/**
 * 공지사항 등록·수정.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 * 본문은 HTML 이며 이미지도 넣을 수 있다 (`RichTextEditor`).
 */
export function NoticeForm({ mode, noticeCode, createdAt, initial }: NoticeFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<NoticeFormInput>(initial ?? EMPTY_NOTICE);
  const [errors, setErrors] = useState<NoticeFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof NoticeFormInput>(field: K, next: NoticeFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateNotice(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateNotice(value);
    setErrors(found);

    if (hasErrors(found)) {
      if (found.title) document.getElementById('notice-title')?.focus();
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
      message: `공지사항을 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${noticeCode} · ${value.title.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '공지사항 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/contents/notices');
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="기본 정보">
          <ContentReadonly
            label="공지 코드"
            value={noticeCode}
            note={mode === 'create' ? '자동생성' : '수정 불가'}
          />
          <ContentReadonly label="등록일" value={createdAt} note="자동입력" />

          <ContentField id="notice-title" label="제목" required {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="notice-title"
              type="text"
              hint="공지 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
              {...(errors.title ? { 'aria-describedby': 'notice-title-error' } : {})}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="내용" description="글자 서식과 이미지를 넣을 수 있습니다.">
          <ContentField id="notice-body" label="본문" required {...(errors.body ? { error: errors.body } : {})}>
            <RichTextEditor
              id="notice-body"
              hint="공지 내용을 입력해 주세요"
              value={value.body}
              onChange={(html) => update('body', html)}
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
          <ContentToggle
            legend="상단 고정"
            options={['고정', '고정 안 함']}
            value={value.pinned}
            onChange={(next) => update('pinned', next)}
          />
        </ContentSection>

        <ContentMobilePreview
          kind="공지사항"
          visible={value.visible}
          title={value.title}
          meta={[{ label: '등록일', value: createdAt }]}
          body={value.body}
          {...(value.pinned ? { badge: '고정' } : {})}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '공지사항 등록' : '공지사항 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 공지사항을 등록합니다. 노출 상태에 따라 고객 화면에 바로 보일 수 있습니다.'
            : '아래 내용으로 공지사항을 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '공지 코드', value: noticeCode },
          { label: '제목', value: value.title.trim() },
          { label: '노출', value: visibilityLabel(value.visible) },
          { label: '상단 고정', value: value.pinned ? '고정' : '고정 안 함' },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
