'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { LEGAL_DOCS } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

const DOC_ID = 'privacy';

/**
 * 설정 > 개인정보 처리방침.
 *
 * ## 서버가 하는 일과 맞춰 적는다
 * 처리방침은 홍보문이 아니라 **사실 진술**이다. 보관 기간을 1년으로 적어 두고 서버가 3년을
 * 들고 있으면 그것이 곧 위반이고, 문의 양식이 받는 칸(회사명·휴대폰)이 여기 없으면 동의
 * 없이 받은 것이 된다 — 그래서 `문의 > 설정` 에서 칸을 바꾸는 날 이 글도 함께 고쳐야 한다.
 *
 * ## 공개를 저장과 따로 둔다
 * 본문을 적는 것과 **사이트에 거는 것**은 다른 일이다. 초안을 적어 두고 법무 검토를 기다리는
 * 동안에도 사이트에는 준비 중이라는 사실만 서 있어야 한다 — 검토 전 초안이 걸리면 그 순간부터
 * 그것이 우리가 주장하는 문서가 된다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function PrivacySettingsView() {
  const doc = LEGAL_DOCS.find((one) => one.id === DOC_ID);
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(doc?.published ?? false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  return (
    <>
      <PageHeading title="개인정보 처리방침" description="사이트 아래의 개인정보 처리방침 링크가 여는 글입니다." />

      <IrPanel
        title="본문"
        description="적은 그대로 사이트에 섭니다."
        aside={<Badge tone={published ? 'ok' : 'wait'}>{published ? '공개' : '준비 중'}</Badge>}
      >
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField
            label="개인정보 처리방침"
            htmlFor="legal-body"
            hint="수집 항목은 문의 양식이 실제로 받는 칸과 같아야 합니다 — 회사명 · 담당자명 · 휴대폰 번호 · 이메일 · 문의 내용 · 첨부파일."
          >
            <textarea
              id="legal-body"
              rows={16}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="1. 수집하는 개인정보 항목 …"
              className="w-full min-w-0 resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
          </IrField>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-brand"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">사이트에 건다</span>
              <span className="block text-xs leading-relaxed text-ink-muted">
                끄면 사이트에는 준비 중이라는 사실과 물어볼 곳만 섭니다.
              </span>
            </span>
          </label>

          <IrSaveRow>
            <IrPrimaryButton
              type="button"
              onClick={() => {
                if (published && !body.trim()) {
                  toast.error({ message: '본문이 비어 있으면 걸 수 없습니다.' });
                  return;
                }
                setPending(true);
              }}
            >
              저장
            </IrPrimaryButton>
          </IrSaveRow>
        </div>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="danger">확인</Badge> 적힌 것과 서버가 실제로 하는 일이 어긋나면 그대로 법 위반입니다. 문의 양식의 칸을 바꾸는 날 이 글도 함께 고치세요.
      </p>

      <IrConfirmModal
        open={pending}
        title={published ? '이 글을 사이트에 걸까요' : '초안으로 저장할까요'}
        message={
          published
            ? '누구나 볼 수 있게 됩니다. 적힌 것과 실제가 어긋나면 그대로 문제가 됩니다.'
            : '사이트에는 아직 걸리지 않습니다. 준비 중이라는 사실만 섭니다.'
        }
        detail="개인정보 처리방침"
        confirmLabel="저장"
        tone={published ? 'danger' : 'primary'}
        onConfirm={() => {
          setPending(false);
          toast.success({ message: published ? '사이트에 걸었습니다.' : '초안으로 저장했습니다.' });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
