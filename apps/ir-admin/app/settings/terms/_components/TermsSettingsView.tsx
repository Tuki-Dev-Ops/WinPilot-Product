'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { LEGAL_DOCS } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

const DOC_ID = 'terms';

/**
 * 설정 > 서비스 이용약관.
 *
 * ## 그럴듯한 조항을 채워 두지 않는다
 * 약관 견본을 붙여 넣어 두고 싶어지는 자리다. 그러나 약관은 적히는 순간 **우리가 효력을
 * 주장하는 문서**가 되고, 지키지 못할 조항이 섞이면 그 조항만 무효가 되는 것이 아니라 문서
 * 전체의 신뢰가 깎인다.
 *
 * ## 공개를 저장과 따로 둔다
 * 본문을 적는 것과 **사이트에 거는 것**은 다른 일이다. 초안을 적어 두고 법무 검토를 기다리는
 * 동안에도 사이트에는 준비 중이라는 사실만 서 있어야 한다 — 검토 전 초안이 걸리면 그 순간부터
 * 그것이 우리가 주장하는 문서가 된다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function TermsSettingsView() {
  const doc = LEGAL_DOCS.find((one) => one.id === DOC_ID);
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(doc?.published ?? false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  return (
    <>
      <PageHeading title="서비스 이용약관" description="사이트 아래의 서비스 이용약관 링크가 여는 글입니다." />

      <IrPanel
        title="본문"
        description="적은 그대로 사이트에 섭니다."
        aside={<Badge tone={published ? 'ok' : 'wait'}>{published ? '공개' : '준비 중'}</Badge>}
      >
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField
            label="서비스 이용약관"
            htmlFor="legal-body"
            hint="법무 검토를 지난 글만 붙여 넣으세요. 견본을 그대로 두면 지키지 못할 조항이 섞입니다."
          >
            <textarea
              id="legal-body"
              rows={16}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="제1조(목적) …"
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
        <Badge tone="danger">확인</Badge> 약관은 적히는 순간 우리가 효력을 주장하는 문서가 됩니다. 검토를 지나기 전에는 걸지 마세요.
      </p>

      <IrConfirmModal
        open={pending}
        title={published ? '이 글을 사이트에 걸까요' : '초안으로 저장할까요'}
        message={
          published
            ? '누구나 볼 수 있게 됩니다. 적힌 것과 실제가 어긋나면 그대로 문제가 됩니다.'
            : '사이트에는 아직 걸리지 않습니다. 준비 중이라는 사실만 섭니다.'
        }
        detail="서비스 이용약관"
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
