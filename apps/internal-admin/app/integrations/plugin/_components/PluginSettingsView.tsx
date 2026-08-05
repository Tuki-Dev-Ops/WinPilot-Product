'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Checkbox, HintInput, useToast } from '@winpilot/ui';
import { InternalField, InternalPrimaryButton, InternalSaveRow } from '@/app/_components/InternalForm';
import { TenantPicker } from '@/app/integrations/_components/TenantPicker';
import { PLUGIN_DEFAULTS, type PluginSetting } from '@/lib/data/integrations';
import { TENANTS, findTenant } from '@/lib/data/tenants';

/**
 * 플러그인 — 고객사 배포에 얹는 조각.
 *
 * **켜는 순간 고객사 화면에서 바로 돈다.** 그래서 항목마다 "고객사 화면에 보이는지" 를 함께
 * 적는다. 채팅 상담처럼 눈에 띄는 것과 분석 스크립트처럼 보이지 않는 것이 섞여 있어서,
 * 켠 사람도 시간이 지나면 무엇을 켰는지 잊는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PluginSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? TENANTS[0]?.id ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  const [plugins, setPlugins] = useState<PluginSetting[]>(PLUGIN_DEFAULTS);
  const [loadedFor, setLoadedFor] = useState(tenantId);

  // 고객사를 바꾸면 그 고객사의 값으로 다시 시작한다 — 앞 고객사의 키가 남아 있으면 사고가 난다.
  if (loadedFor !== tenantId) {
    setPlugins(PLUGIN_DEFAULTS);
    setLoadedFor(tenantId);
  }

  const update = (id: string, patch: Partial<PluginSetting>) => {
    setPlugins((previous) => previous.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 켜 두고 키가 비어 있으면 고객사 화면에서 아무 일도 일어나지 않는다.
    const broken = plugins.filter((plugin) => plugin.enabled && plugin.key.trim() === '' && needsKey(plugin));
    if (broken.length > 0) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `${broken.map((plugin) => plugin.label).join(', ')} — 켜 두었는데 키가 비어 있습니다.`,
      });
      return;
    }

    const on = plugins.filter((plugin) => plugin.enabled);
    toast.success({
      message: '플러그인을 저장했습니다.',
      detail: `${tenant?.name} · ${on.length > 0 ? on.map((plugin) => plugin.label).join(', ') : '켜 둔 것 없음'}`,
    });
  };

  const hidden = plugins.filter((plugin) => plugin.enabled && !plugin.visible);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TenantPicker value={tenantId} onChange={setTenantId} tenant={tenant} />

      <section className="rounded-xl border border-border bg-canvas">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight">고객사 배포에 얹는 조각</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            켜는 순간 고객사 화면에서 바로 돕니다. 플랜이 열어 주지 않는 것은 켤 수 없습니다.
          </p>
        </div>

        <div className="flex flex-col">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="flex flex-col gap-4 border-b border-border px-6 py-5 last:border-b-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Checkbox
                    checked={plugin.enabled}
                    onChange={(checked) => update(plugin.id, { enabled: checked })}
                    label={`${plugin.label} 사용`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{plugin.label}</p>
                    <p className="text-sm leading-relaxed text-ink-muted">{plugin.purpose}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* 보이지 않는 조각을 표시로 갈라 둔다 — 켠 사실을 잊기 쉬운 쪽이다. */}
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                      plugin.visible ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200' : 'bg-surface text-ink-muted'
                    }`}
                  >
                    {plugin.visible ? '화면에 보임' : '보이지 않음'}
                  </span>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                    {plugin.requires} 이상
                  </span>
                </div>
              </div>

              {plugin.enabled && needsKey(plugin) && (
                <InternalField
                  label="연동 키"
                  htmlFor={`plugin-${plugin.id}-key`}
                  hint="각 서비스 콘솔에서 발급받은 값입니다."
                >
                  <HintInput
                    id={`plugin-${plugin.id}-key`}
                    type="text"
                    hint="발급받은 키"
                    value={plugin.key}
                    onChange={(event) => update(plugin.id, { key: event.target.value })}
                    invalid={!plugin.key.trim()}
                  />
                </InternalField>
              )}
            </div>
          ))}
        </div>

        {hidden.length > 0 && (
          <p className="border-t border-border bg-surface px-6 py-4 text-sm leading-relaxed text-ink-muted">
            보이지 않는 조각 {hidden.length}개가 켜져 있습니다 — {hidden.map((plugin) => plugin.label).join(', ')}.
            고객사 화면에는 나타나지 않지만 값은 밖으로 나갑니다.
          </p>
        )}

        <InternalSaveRow>
          <InternalPrimaryButton>저장</InternalPrimaryButton>
        </InternalSaveRow>
      </section>
    </form>
  );
}

/** 키가 있어야 도는 조각인지. 키를 받지 않는 조각까지 빈 칸을 그리면 무엇을 채워야 할지 흐려진다. */
function needsKey(plugin: PluginSetting): boolean {
  return plugin.id === 'chat' || plugin.id === 'analytics' || plugin.id === 'crm';
}
