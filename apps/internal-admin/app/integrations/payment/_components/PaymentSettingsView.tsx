'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Checkbox, Dropdown, HintInput, useToast } from '@winpilot/ui';
import { TenantPicker } from '@/app/integrations/_components/TenantPicker';
import {
  DEFAULT_PG,
  PAY_METHODS,
  PG_LABELS,
  maskSecret,
  type PgProviderId,
  type PgSetting,
} from '@/lib/data/integrations';
import { TENANTS, findTenant } from '@/lib/data/tenants';

/**
 * PG 정보 — 고객사의 결제 연동을 다룬다.
 *
 * **실결제 전환은 되돌리기 어려운 동작**이다. 테스트 모드에서 실결제로 넘기는 순간
 * 고객의 카드에서 돈이 빠지므로, 켜는 순간 눈에 띄게 경고한다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PaymentSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? TENANTS[0]?.id ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  const [value, setValue] = useState<PgSetting>(DEFAULT_PG);
  const [loadedFor, setLoadedFor] = useState(tenantId);

  // 고객사를 바꾸면 그 고객사의 값으로 다시 시작한다 — 앞 고객사의 키가 남아 있으면 사고가 난다.
  if (loadedFor !== tenantId) {
    setValue(DEFAULT_PG);
    setLoadedFor(tenantId);
  }

  const update = <K extends keyof PgSetting>(field: K, next: PgSetting[K]) => {
    setValue((previous) => ({ ...previous, [field]: next }));
  };

  const toggleMethod = (method: string, checked: boolean) => {
    update('methods', checked ? [...value.methods, method] : value.methods.filter((item) => item !== method));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.merchantId.trim() || !value.secretKey.trim()) {
      toast.error({ message: '저장하지 못했습니다.', detail: '상점 ID 와 비밀 키는 반드시 입력해야 합니다.' });
      return;
    }
    if (value.methods.length === 0) {
      toast.error({ message: '저장하지 못했습니다.', detail: '결제 수단을 1개 이상 선택해 주세요.' });
      return;
    }

    toast.success({
      message: 'PG 정보를 저장했습니다.',
      detail: `${tenant?.name} · ${value.label} · ${value.live ? '실결제' : '테스트'}`,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TenantPicker value={tenantId} onChange={setTenantId} tenant={tenant} />

      <section className="rounded-xl border border-border bg-canvas">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight">결제 대행사</h2>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">대행사</span>
            <Dropdown
              id="pg-provider"
              label="대행사 선택"
              options={(Object.keys(PG_LABELS) as PgProviderId[]).map((id) => ({
                value: id,
                label: PG_LABELS[id],
              }))}
              value={value.provider}
              onChange={(next) => {
                const provider = next as PgProviderId;
                setValue((previous) => ({ ...previous, provider, label: PG_LABELS[provider] }));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pg-merchantId" className="text-sm font-medium">
              상점 ID
            </label>
            <HintInput
              id="pg-merchantId"
              type="text"
              hint="대행사에서 발급받은 상점 아이디"
              value={value.merchantId}
              onChange={(event) => update('merchantId', event.target.value)}
              invalid={!value.merchantId.trim()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pg-secretKey" className="text-sm font-medium">
              비밀 키
            </label>
            <HintInput
              id="pg-secretKey"
              type="password"
              hint="발급받은 비밀 키"
              value={value.secretKey}
              onChange={(event) => update('secretKey', event.target.value)}
              invalid={!value.secretKey.trim()}
            />
            <p className="font-mono text-xs text-ink-faint">저장된 값: {maskSecret(value.secretKey)}</p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">결제 수단</legend>
            <div className="mt-1 flex flex-wrap gap-3">
              {PAY_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-strong px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={value.methods.includes(method)}
                    onChange={(checked) => toggleMethod(method, checked)}
                    label={`${method} 사용`}
                  />
                  {method}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">운영 모드</legend>
            <div className="mt-1 flex w-full gap-2">
              {(['실결제', '테스트'] as const).map((option, index) => {
                const active = index === 0 ? value.live : !value.live;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update('live', index === 0)}
                    className={`h-11 flex-1 whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
                      active
                        ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'border-border-strong text-ink-muted hover:border-ink-faint'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {value.live && (
              <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
                실결제 모드입니다. 이 설정으로 저장하면 고객의 카드에서 실제로 금액이 빠져나갑니다.
              </p>
            )}
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="submit"
            className="h-11 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-6 text-sm font-medium text-white hover:bg-brand-600"
          >
            저장
          </button>
        </div>
      </section>
    </form>
  );
}
