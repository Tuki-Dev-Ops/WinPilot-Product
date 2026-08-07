'use client';

import { useState } from 'react';
import { Badge, Checkbox, Dropdown, PageHeading, useToast } from '@winpilot/ui';
import { IR_COMPANY, STOCK } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * 주가 연동.
 *
 * ## 지연 표시를 반드시 켠다
 * 무료로 받는 시세는 대개 **15~20분 지연**이다. 지연이라는 사실을 화면에 적지 않으면 투자자는
 * 실시간으로 읽고, 그 차이로 판단한 뒤에야 알게 된다. 그래서 이 화면의 스위치는 켜는 것이
 * 아니라 **끌 때 경고가 붙는** 자리다.
 *
 * ## 값은 우리가 만들지 않는다
 * 시세는 거래소와 시세 제공사에서 온다. 여기서 정하는 것은 어디서 받을지와 어떻게 보여
 * 줄지뿐이다 — 숫자를 손으로 고치는 칸을 두지 않는 이유다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function StockSettingsView() {
  const toast = useToast();
  /** 저장을 누른 뒤 확인을 기다리는 중인가. */
  const [pending, setPending] = useState(false);
  const [source, setSource] = useState('krx');
  const [delayed, setDelayed] = useState(true);

  return (
    <>
      <PageHeading title="주가 연동" description="시세를 어디서 받아 어떻게 보여 줄지 정하세요." />

      <IrPanel
        title="지금 값"
        description="투자자 화면의 주가 정보가 이 값을 그대로 읽습니다."
        aside={<span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{STOCK.at} 기준</span>}
      >
        <div className="flex flex-wrap gap-x-10 gap-y-4 px-6 py-5">
          <div>
            <p className="text-xs text-ink-faint">현재가</p>
            <p className="text-2xl font-semibold tabular-nums">{STOCK.price.toLocaleString('ko-KR')}원</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">전일 대비</p>
            <p className={`text-lg tabular-nums ${STOCK.change >= 0 ? 'text-signal-danger' : 'text-brand-700'}`}>
              {STOCK.change >= 0 ? '▲' : '▼'} {Math.abs(STOCK.change).toLocaleString('ko-KR')} ({STOCK.changeRate}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">시가총액</p>
            <p className="text-lg tabular-nums">{STOCK.marketCap.toLocaleString('ko-KR')} 백만원</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">52주</p>
            <p className="text-lg tabular-nums">
              {STOCK.low52.toLocaleString('ko-KR')} ~ {STOCK.high52.toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </IrPanel>

      <IrPanel title="받아 오는 곳" description={`${IR_COMPANY.market} ${IR_COMPANY.ticker} 의 시세를 어디서 받을지 정합니다.`}>
        <div className="flex flex-col gap-5 px-6 py-6">
          <IrField label="시세 제공" htmlFor="stock-source" hint="바꾸면 지연 시간과 갱신 주기가 함께 달라집니다.">
            <Dropdown
              id="stock-source"
              label="제공처 선택"
              options={[
                { value: 'krx', label: '한국거래소', hint: '지연 20분' },
                { value: 'vendor', label: '시세 제공사', hint: '실시간 · 유료' },
              ]}
              value={source}
              onChange={setSource}
            />
          </IrField>

          <IrField
            label="지연 표시"
            hint="지연 시세를 실시간으로 읽으면 그 차이로 판단하게 됩니다. 끄는 것은 실시간 계약이 있을 때만입니다."
          >
            <label className="flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-strong px-3 py-2 text-sm">
              <Checkbox checked={delayed} onChange={setDelayed} label="지연 표시" />
              {delayed ? '지연임을 화면에 적음' : '적지 않음'}
            </label>
          </IrField>

          {/* 끈 상태는 되돌리기 쉬운 값이지만 밖에서 드러나는 값이라 그 자리에서 경고한다. */}
          {!delayed && (
            <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
              지연 표시를 껐습니다. 실시간 시세 계약이 없다면 투자자가 지연된 값을 실시간으로 읽습니다.
            </p>
          )}
        </div>

        <IrSaveRow>
          <IrPrimaryButton
            type="button"
            onClick={() => setPending(true)}
          >
            저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 시세 숫자를 손으로 고치는 칸은 두지 않습니다 — 값은 거래소에서
        오고, 여기서 고치면 원본과 다른 값이 사이트에 섭니다.
      </p>

      {/*
        저장 전에 한 번 묻는다. 이 설정은 **투자자 화면의 숫자가 어디서 오는지**를 정하는 것이라,
        잘못 바꾸면 화면에 값이 서긴 하는데 출처가 다르다 — 틀린 것이 아니라 다른 것이라 오류로
        드러나지 않는다.
      */}
      <IrConfirmModal
        open={pending}
        title="이 설정으로 저장할까요"
        message="투자자 화면의 주가가 이 출처에서 옵니다. 지연 표시를 끄면 실시간으로 읽히므로, 실제로 실시간 시세일 때만 끄세요."
        detail={`${source === 'krx' ? '한국거래소' : '시세 제공사'} · ${delayed ? '지연 표시 켬' : '지연 표시 끔'}`}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({
            message: '주가 연동을 저장했습니다.',
            detail: `${source === 'krx' ? '한국거래소' : '시세 제공사'} · ${delayed ? '지연 표시 켬' : '지연 표시 끔'}`,
          });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
