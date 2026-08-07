'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { SITE_SUPPLIER } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/** 칸 하나하나. `required` 는 취향이 아니라 **법이 적으라고 한 것**이다. */
const FIELDS = [
  { key: 'name', label: '상호', required: true },
  { key: 'ceo', label: '대표자', required: true },
  { key: 'businessNumber', label: '사업자등록번호', required: true },
  { key: 'mailOrderNumber', label: '통신판매업 신고번호', required: false },
  { key: 'address', label: '주소', required: true },
  { key: 'phone', label: '전화번호', required: true },
  { key: 'email', label: '이메일', required: true },
  { key: 'privacyOfficer', label: '개인정보보호책임자', required: true },
  { key: 'hosting', label: '호스팅 제공자', required: false },
] as const;

/**
 * 설정 > 공급자 정보.
 *
 * ## 왜 회사 소개와 따로인가
 * `회사 > 소개` 에도 회사 이름과 주소가 있다. 그쪽은 **읽는 사람에게 우리를 알리는 글**이고,
 * 여기 있는 것은 **전자상거래법·정보통신망법이 사이트에 적으라고 정한 항목**이다. 통신판매업
 * 신고번호처럼 소개글에는 들지 않는 값이 여기 있고, 빠지면 과태료가 붙는다.
 *
 * ## 저장에 확인 창을 세운다
 * 이 값은 사이트 모든 화면의 아래에 그대로 나간다. 사업자등록번호 한 자리가 틀린 것은
 * **우리가 아니라 밖에서 먼저 발견된다**.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function SupplierSettingsView() {
  const [form, setForm] = useState({ ...SITE_SUPPLIER });
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const missing = FIELDS.filter((one) => one.required && !form[one.key].trim());

  return (
    <>
      <PageHeading title="공급자 정보" description="사이트 아래에 적히는 사업자 표시입니다." />

      <IrPanel
        title="사업자 표시"
        description="모든 화면의 푸터에 그대로 나갑니다."
        aside={missing.length > 0 ? <Badge tone="danger">{missing.length}칸 비어 있음</Badge> : undefined}
      >
        <div className="grid grid-cols-1 gap-5 px-6 py-5 md:grid-cols-2">
          {FIELDS.map((one) => (
            <IrField
              key={one.key}
              label={one.label}
              htmlFor={`supplier-${one.key}`}
              {...(one.required ? { required: true } : {})}
            >
              <input
                id={`supplier-${one.key}`}
                type="text"
                value={form[one.key]}
                onChange={(event) => setForm((was) => ({ ...was, [one.key]: event.target.value }))}
                className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink"
              />
            </IrField>
          ))}
        </div>

        <IrSaveRow>
          <IrPrimaryButton
            type="button"
            onClick={() => {
              if (missing.length > 0) {
                toast.error({
                  message: '법이 적으라고 정한 칸이 비어 있습니다.',
                  detail: missing.map((one) => one.label).join(' · '),
                });
                return;
              }
              setPending(true);
            }}
          >
            저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrConfirmModal
        open={pending}
        title="사업자 표시를 저장할까요"
        message="사이트 모든 화면의 아래에 이 값이 그대로 나갑니다. 틀린 자리는 밖에서 먼저 발견됩니다."
        detail={`${form.name} · ${form.ceo} · ${form.businessNumber}`}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({ message: '공급자 정보를 저장했습니다.' });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
