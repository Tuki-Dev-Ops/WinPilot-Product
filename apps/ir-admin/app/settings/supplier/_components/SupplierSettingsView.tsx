'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { BUSINESS_ITEMS, BUSINESS_TYPES, SITE_SUPPLIER, type BusinessType } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import { IrSelect } from '@/app/_components/IrRecordForm';

/**
 * 손으로 적는 칸. `required` 는 취향이 아니라 **법이 적으라고 한 것**이다.
 *
 * 업태 · 업종은 여기 없다. 그 둘은 고르는 값이라 아래에 따로 세운다 — 손으로 적게 두면 같은
 * 것이 여러 말로 남고, 등록증과 한 글자만 달라도 상대 회계팀이 되묻는다.
 */
const FIELDS = [
  { key: 'name', label: '상호', required: true, hint: '사업자등록증에 적힌 그대로 적으세요.' },
  { key: 'ceo', label: '대표자', required: true, hint: '' },
  { key: 'businessNumber', label: '사업자등록번호', required: true, hint: '000-00-00000' },
  {
    key: 'mailOrderNumber',
    label: '통신판매업 신고번호',
    required: false,
    hint: '온라인으로 파는 것이 있으면 반드시 적습니다.',
  },
  { key: 'address', label: '주소', required: true, hint: '' },
  { key: 'phone', label: '전화번호', required: true, hint: '' },
  { key: 'email', label: '이메일', required: true, hint: '' },
  {
    key: 'privacyOfficer',
    label: '개인정보보호책임자',
    required: true,
    hint: '대표와 같은 사람이어도 자리가 다르므로 따로 적습니다.',
  },
  {
    key: 'hosting',
    label: '호스팅 제공자',
    required: false,
    hint: '분쟁이 났을 때 자료가 어디 있는지를 가리킵니다.',
  },
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

  /*
    업태를 바꾸면 업종을 그 아래 첫 값으로 되돌린다. 그대로 두면 `건설업 · 소프트웨어 개발업`
    같은 짝이 남는데, 그 짝은 등록증에 있을 수 없다.
  */
  const items = BUSINESS_ITEMS[form.businessType];
  const pickType = (next: string) => {
    const type = next as BusinessType;
    setForm((was) => ({ ...was, businessType: type, businessItem: BUSINESS_ITEMS[type][0] ?? '' }));
  };
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
        <div className="flex flex-col gap-5 px-6 py-6">
          {FIELDS.map((one) => (
            <IrField
              key={one.key}
              label={one.label}
              htmlFor={`supplier-${one.key}`}
              {...(one.required ? { required: true } : {})}
              {...(one.hint ? { hint: one.hint } : {})}
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

          {/*
            업태와 업종은 고른다. 업종이 업태에 딸려 있어 위를 바꾸면 아래가 다시 채워진다 —
            둘을 따로 고르게 두면 등록증에 있을 수 없는 짝이 만들어진다.
          */}
          <IrField
            label="업태"
            htmlFor="supplier-businessType"
            required
            hint="한국표준산업분류의 대분류입니다. 사업자등록증에 적힌 것을 고르세요."
          >
            <IrSelect
              id="supplier-businessType"
              value={form.businessType}
              onChange={pickType}
              options={BUSINESS_TYPES}
            />
          </IrField>

          <IrField
            label="업종"
            htmlFor="supplier-businessItem"
            required
            hint={`${form.businessType} 아래의 종목 ${items.length}개. 여기 없으면 코드에 더해야 합니다.`}
          >
            <IrSelect
              id="supplier-businessItem"
              value={form.businessItem}
              onChange={(next) => setForm((was) => ({ ...was, businessItem: next }))}
              options={items}
            />
          </IrField>
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
        detail={`${form.name} · ${form.ceo} · ${form.businessNumber} · ${form.businessType} / ${form.businessItem}`}
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
