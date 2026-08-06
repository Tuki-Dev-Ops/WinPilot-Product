'use client';

import { useState } from 'react';
import { Badge, HintInput, PageHeading, useToast } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * DART 연동.
 *
 * ## 우리가 만드는 값이 아니다
 * 전자공시(DART)의 원문은 금융감독원이 갖고 있다. 이 화면이 하는 일은 **어느 회사의 공시를
 * 끌어올지**를 정하고, 얼마나 자주 확인할지를 두는 것뿐이다 — 공시 내용을 여기서 고치지
 * 않는다. 고칠 수 있게 두면 원문과 다른 글이 사이트에 서고, 그 차이는 투자자가 두 곳을
 * 비교할 때 드러난다.
 *
 * ## 고유번호는 종목코드가 아니다
 * DART 는 회사마다 여덟 자리 고유번호를 따로 쓴다. 종목코드를 넣으면 조회가 통째로 비는데,
 * 오류가 아니라 **빈 결과**로 와서 연동이 된 것처럼 보인다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function DartSettingsView() {
  const toast = useToast();
  const [corpCode, setCorpCode] = useState('00000000');
  const [apiKey, setApiKey] = useState('');
  const [interval, setInterval] = useState('30');
  const [pending, setPending] = useState(false);

  const errors = {
    corpCode:
      /^[0-9]{8}$/.test(corpCode.trim())
        ? undefined
        : 'DART 고유번호는 여덟 자리 숫자입니다. 종목코드가 아닙니다.',
    apiKey: apiKey.trim().length >= 20 ? undefined : 'DART 오픈API 인증키를 그대로 붙여 넣어 주세요.',
    interval:
      Number(interval) >= 5 && Number(interval) <= 1440
        ? undefined
        : '확인 주기는 5분 이상 1440분(하루) 이하로 적습니다.',
  };
  const broken = Object.values(errors).filter(Boolean).length;

  return (
    <>
      <PageHeading title="DART 연동" description="전자공시에서 어느 회사의 공시를 끌어올지 정하세요." />

      <IrPanel
        title="DART 연동"
        description="전자공시 원문을 끌어옵니다. 공시 내용은 여기서 고치지 않습니다 — 원본은 금융감독원에 있습니다."
        aside={<Badge tone={broken > 0 ? 'danger' : 'ok'}>{broken > 0 ? `확인 필요 ${broken}` : '설정됨'}</Badge>}
      >
        {/* 한 줄에 한 칸. 키는 옮겨 적는 값이라 나란히 두면 잘못 붙여 넣기 쉽다. */}
        <div className="flex flex-col gap-5 px-6 py-6">
          <IrField label="회사" hint="종목 코드와 시장은 회사 정보에서 옵니다.">
            <p className="flex h-11 items-center rounded-lg bg-surface px-3 text-sm">
              {IR_COMPANY.name} · {IR_COMPANY.market} {IR_COMPANY.ticker}
            </p>
          </IrField>

          <IrField
            label="DART 고유번호"
            htmlFor="dart-corp"
            required
            {...(errors.corpCode ? { error: errors.corpCode } : { hint: '고유번호는 종목코드와 다릅니다. DART 공시정보 > 고유번호에서 확인합니다.' })}
          >
            <HintInput
              id="dart-corp"
              type="text"
              hint="여덟 자리 숫자"
              value={corpCode}
              onChange={(event) => setCorpCode(event.target.value.replace(/[^0-9]/g, ''))}
              invalid={Boolean(errors.corpCode)}
            />
          </IrField>

          <IrField
            label="오픈API 인증키"
            htmlFor="dart-key"
            required
            {...(errors.apiKey ? { error: errors.apiKey } : { hint: 'DART 오픈API 신청 후 메일로 받습니다.' })}
          >
            <HintInput
              id="dart-key"
              type="password"
              hint="40자리 인증키"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              invalid={Boolean(errors.apiKey)}
            />
          </IrField>

          <IrField
            label="확인 주기 (분)"
            htmlFor="dart-interval"
            {...(errors.interval ? { error: errors.interval } : { hint: '너무 짧게 두면 호출 한도에 걸려 그날 조회가 막힙니다.' })}
          >
            <HintInput
              id="dart-interval"
              type="text"
              hint="5 ~ 1440"
              value={interval}
              onChange={(event) => setInterval(event.target.value.replace(/[^0-9]/g, ''))}
              invalid={Boolean(errors.interval)}
            />
          </IrField>
        </div>

        <IrSaveRow>
          <IrPrimaryButton
            type="button"
            onClick={() => {
              if (broken > 0) {
                toast.error({ message: '저장하지 못했습니다.', detail: `확인이 필요한 항목이 ${broken}개 있습니다.` });
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
        title="이 설정으로 저장할까요"
        message="이 주기로 DART 를 확인하고 새 공시를 끌어옵니다. 고유번호가 틀리면 오류가 아니라 빈 결과로 와서 연동된 것처럼 보입니다."
        detail={`${IR_COMPANY.name} · 고유번호 ${corpCode} · ${interval}분마다`}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({ message: 'DART 연동을 저장했습니다.', detail: `고유번호 ${corpCode} · ${interval}분마다 확인` });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
