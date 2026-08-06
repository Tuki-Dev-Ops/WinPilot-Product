'use client';

import { useMemo, useState } from 'react';
import { Badge, useToast } from '@winpilot/ui';
import { InternalConfirmModal } from '@/app/_components/InternalConfirmModal';
import { IntegrationTenantList } from '@/app/integrations/_components/IntegrationTenantList';
import { PLUGIN_DEFAULTS, type PluginSetting } from '@/lib/data/integrations';
import { findTenant, TENANTS } from '@/lib/data/tenants';
import { PluginSettingsModal } from './PluginSettingsModal';

/**
 * 플러그인 — 고객사 배포에 얹는 조각.
 *
 * ## 목록만 남고 설정은 창으로 갔다
 * 전에는 고객사 목록 밑에 설정 묶음이 이어져 있었다. 다른 고객사를 누르면 **화면은 그대로인데
 * 아래 내용만 바뀌어서**, 지금 보고 있는 것이 누구 것인지 제목을 다시 읽어야 했다. 키는
 * 고객사마다 다른 값이고 잘못 넣으면 남의 배포에 남의 키가 들어간다.
 *
 * 지금 이 화면이 답하는 것은 **어느 고객사에 무엇이 켜져 있는가** 하나이고, 켜고 끄는 일은
 * 창에서 한다(`PluginSettingsModal`).
 *
 * ## 켜는 순간 고객사 화면에서 바로 돈다
 * 그래서 조각마다 "고객사 화면에 보이는지" 를 함께 적는다. 채팅 상담처럼 눈에 띄는 것과 분석
 * 스크립트처럼 보이지 않는 것이 섞여 있어서, 켠 사람도 시간이 지나면 무엇을 켰는지 잊는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PluginSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  /*
    고객사마다 켜 둔 조각. 아직 손대지 않은 고객사는 여기 없고, 그때는 기본값을 읽는다 —
    빈 값과 "기본 그대로" 를 같은 것으로 두면 저장한 적 없는 곳이 꺼진 것으로 보인다.
  */
  const [saved, setSaved] = useState<Record<string, PluginSetting[]>>({});
  /* 켠 조각은 **고객사 화면에서 바로 도는 것**이라, 저장 전에 무엇이 켜지는지 한 번 더 읽게 한다. */
  const [pending, setPending] = useState<PluginSetting[] | null>(null);
  const pluginsOf = (id: string) => saved[id] ?? PLUGIN_DEFAULTS;

  const save = (plugins: PluginSetting[]) => {
    if (!tenant) return;

    setSaved((previous) => ({ ...previous, [tenant.id]: plugins }));
    setPending(null);
    setTenantId('');

    const on = plugins.filter((plugin) => plugin.enabled);
    toast.success({
      message: '플러그인을 저장했습니다.',
      detail: `${tenant.name} · ${on.length > 0 ? on.map((plugin) => plugin.label).join(', ') : '켜 둔 것 없음'}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/*
        고객사 목록이 곧 이 화면이다. 켠 조각은 **고객사 화면에서 바로 도는 것**이라, 어디에
        무엇이 켜져 있는지가 목록에서 읽혀야 한다.
      */}
      <IntegrationTenantList
        value={tenantId}
        onChange={setTenantId}
        description="줄을 누르면 그 고객사 배포에 얹는 조각을 창에서 켜고 끕니다."
        columns={[
          { label: '배포 도메인', span: 'lg:col-span-3' },
          { label: '켠 조각', span: 'lg:col-span-2' },
          { label: '플랜', span: 'lg:col-span-2' },
        ]}
        render={(one) => {
          const plugins = pluginsOf(one.id);
          const on = plugins.filter((plugin) => plugin.enabled);
          /* 보이지 않는데 켜져 있는 것은 목록에서 따로 센다 — 켠 사실을 잊기 쉬운 쪽이다. */
          const hidden = on.filter((plugin) => !plugin.visible);

          return [
            <span key="domain" className="min-w-0 truncate font-mono text-xs text-ink-muted">
              {one.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? '배포 없음'}
            </span>,
            <span key="on" className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm tabular-nums">
                {on.length}
                <span className="text-ink-faint"> / {plugins.length}</span>
              </span>
              {hidden.length > 0 && <Badge tone="wait">보이지 않음 {hidden.length}</Badge>}
            </span>,
            <span key="plan" className="min-w-0 truncate text-sm">
              {one.plan}
            </span>,
          ];
        }}
      />

      <PluginSettingsModal
        open={tenant !== undefined}
        tenant={tenant}
        onClose={() => setTenantId('')}
        onSubmit={setPending}
      />

      <InternalConfirmModal
        open={pending !== null}
        title="이 조각으로 저장할까요"
        message="켜는 순간 고객사 화면에서 바로 돕니다. 보이지 않는 조각도 값은 밖으로 나갑니다."
        detail={
          pending && tenant
            ? `${tenant.name} · ${
                pending.filter((plugin) => plugin.enabled).length > 0
                  ? pending.filter((plugin) => plugin.enabled).map((plugin) => plugin.label).join(', ')
                  : '켜 둔 것 없음'
              }`
            : undefined
        }
        confirmLabel="저장"
        onConfirm={() => pending && save(pending)}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

/*
  `needsKey()` 는 여기 있었다 — 어떤 조각이 키를 받는지 id 로 판별하는 함수였다.
  조각이 늘 때마다 이 함수를 함께 고쳐야 했고, 잊으면 키 칸이 조용히 사라졌다.
  이제 `keyField` 가 있는지로 안다 — 사실이 표 한 곳에 있다.
*/
