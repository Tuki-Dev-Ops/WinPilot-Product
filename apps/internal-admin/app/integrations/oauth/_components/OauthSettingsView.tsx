'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Checkbox, HintInput, useToast } from '@winpilot/ui';
import { TenantPicker } from '@/app/integrations/_components/TenantPicker';
import { defaultOauth, maskSecret, type OauthProvider } from '@/lib/data/integrations';
import { TENANTS, findTenant } from '@/lib/data/tenants';

/**
 * OAuth 정보 — 고객사의 소셜 로그인 연동 키를 다룬다.
 *
 * 리다이렉트 주소는 **고객사 도메인에서 자동으로 만든다**. 손으로 적게 하면 오타 하나로
 * 로그인 전체가 막히고, 그 원인은 화면 어디에도 드러나지 않는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function OauthSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? TENANTS[0]?.id ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  const clientDomain =
    tenant?.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? 'example.com';

  // 고객사를 바꾸면 그 고객사의 값으로 다시 시작한다 — 앞 고객사의 키가 남아 있으면 사고가 난다.
  const [providers, setProviders] = useState<OauthProvider[]>(() => defaultOauth(clientDomain));
  const [loadedFor, setLoadedFor] = useState(tenantId);

  if (loadedFor !== tenantId) {
    setProviders(defaultOauth(clientDomain));
    setLoadedFor(tenantId);
  }

  const update = (id: string, patch: Partial<OauthProvider>) => {
    setProviders((previous) =>
      previous.map((provider) => (provider.id === id ? { ...provider, ...patch } : provider)),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 켜 두고 키가 비어 있으면 고객은 버튼을 눌러도 아무 일도 일어나지 않는 화면을 본다.
    const broken = providers.filter(
      (provider) => provider.enabled && (!provider.clientId.trim() || !provider.clientSecret.trim()),
    );
    if (broken.length > 0) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `${broken.map((provider) => provider.label).join(', ')} — 사용으로 켜 두었는데 키가 비어 있습니다.`,
      });
      return;
    }

    const enabled = providers.filter((provider) => provider.enabled);
    toast.success({
      message: 'OAuth 정보를 저장했습니다.',
      detail: `${tenant?.name} · ${enabled.length > 0 ? enabled.map((p) => p.label).join(', ') : '사용 중인 제공자 없음'}`,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TenantPicker value={tenantId} onChange={setTenantId} tenant={tenant} />

      <section className="rounded-xl border border-border bg-canvas">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight">소셜 로그인</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            리다이렉트 주소는 고객사 도메인에서 자동으로 만들어집니다. 각 제공자 콘솔에 같은 주소를 등록해야 합니다.
          </p>
        </div>

        <div className="flex flex-col">
          {providers.map((provider) => (
            <div key={provider.id} className="flex flex-col gap-4 border-b border-border px-6 py-5 last:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={provider.enabled}
                    onChange={(checked) => update(provider.id, { enabled: checked })}
                    label={`${provider.label} 사용`}
                  />
                  <span className="text-sm font-medium">{provider.label}</span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-xs text-ink-faint">
                  {maskSecret(provider.clientSecret)}
                </span>
              </div>

              {provider.enabled && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`oauth-${provider.id}-id`} className="text-sm font-medium">
                      Client ID
                    </label>
                    <HintInput
                      id={`oauth-${provider.id}-id`}
                      type="text"
                      hint="제공자 콘솔에서 발급받은 값"
                      value={provider.clientId}
                      onChange={(event) => update(provider.id, { clientId: event.target.value })}
                      invalid={!provider.clientId.trim()}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor={`oauth-${provider.id}-secret`} className="text-sm font-medium">
                      Client Secret
                    </label>
                    <HintInput
                      id={`oauth-${provider.id}-secret`}
                      type="password"
                      hint="발급받은 비밀 키"
                      value={provider.clientSecret}
                      onChange={(event) => update(provider.id, { clientSecret: event.target.value })}
                      invalid={!provider.clientSecret.trim()}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">리다이렉트 주소</span>
                    {/* 자동 생성 값이라 input 이 아니라 텍스트로 그린다 — 손으로 고칠 것이 아니다. */}
                    <p className="flex h-11 items-center overflow-x-auto rounded-lg bg-surface px-3 font-mono text-xs text-ink-muted">
                      {provider.redirectUri}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
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
