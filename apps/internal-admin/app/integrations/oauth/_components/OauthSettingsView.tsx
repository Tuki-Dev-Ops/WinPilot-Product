'use client';

import { useMemo, useState } from 'react';
import { Badge, useToast } from '@winpilot/ui';
import { IntegrationTenantList } from '@/app/integrations/_components/IntegrationTenantList';
import { defaultOauth, findOauthProvider, type OauthSetting } from '@/lib/data/oauth-providers';
import { findTenant, TENANTS } from '@/lib/data/tenants';
import { OauthProviderModal } from './OauthProviderModal';
import { OauthTenantModal, oauthReady } from './OauthTenantModal';

/** 그 고객사의 고객 화면 도메인. 리다이렉트 주소가 여기서 만들어진다. */
function clientDomainOf(tenantId: string): string {
  const tenant = findTenant(tenantId);
  return tenant?.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? 'example.com';
}

/**
 * OAuth 정보 — 고객사의 소셜 로그인 연동 키.
 *
 * ## 목록 → 고객사 창 → 제공자 창
 * 화면에 남는 것은 **고객사 목록** 하나다. 줄을 누르면 그 고객사의 제공자 넷이 창으로 열리고,
 * 키는 다시 그 안의 창에서 넣는다.
 *
 * 층을 셋으로 나눈 이유는 각 층이 답하는 물음이 다르기 때문이다.
 *
 * | 층 | 답하는 물음 |
 * |---|---|
 * | 목록 | 어느 고객사의 로그인이 아직 안 열렸는가 |
 * | 고객사 창 | 그 고객사가 무엇을 켜 두었고 값이 찼는가 |
 * | 제공자 창 | 그 제공자의 키를 넣는다 |
 *
 * 전에는 셋이 한 화면에 펼쳐져 있었다. 애플만 칸이 넷이라(Services ID · Team ID · Key ID ·
 * `.p8`) 화면이 열두 칸 넘게 이어졌고, 카카오 키 하나 보러 온 사람이 그 전부를 지나가야 했다.
 *
 * ## 저장이 제공자마다 따로다
 * 전에는 아래 `저장` 하나가 켜 둔 제공자를 전부 함께 검사했다. 애플을 켜 두고 키를 아직 못
 * 받았으면 **카카오 값을 고쳐도 저장이 막혔다.** 키는 제공자마다 따로 발급받고 따로 들어온다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function OauthSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  /*
    고객사마다의 제공자 설정. 아직 손대지 않은 곳은 여기 없고 그때는 기본값을 읽는다 —
    빈 값과 "기본 그대로" 를 같은 것으로 두면 저장한 적 없는 곳이 꺼진 것으로 보인다.
  */
  const [saved, setSaved] = useState<Record<string, OauthSetting[]>>({});
  const providersOf = (id: string) => saved[id] ?? defaultOauth(clientDomainOf(id));

  /** `제공자.필드` → 메시지. 같은 이름의 칸이 여럿에 있어 제공자를 앞에 붙인다. */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);

  const providers = tenant ? providersOf(tenant.id) : [];
  const editingSetting = providers.find((provider) => provider.id === editing) ?? null;

  /** 제공자 한 곳만 검사한다. 저장이 제공자마다 따로이므로 검사도 따로다. */
  const validate = (setting: OauthSetting): Record<string, string> => {
    const found: Record<string, string> = {};

    for (const field of findOauthProvider(setting.id).fields) {
      const raw = setting.credentials[field.key] ?? '';
      const value = raw.trim();

      if (!value) {
        /* 꺼 둔 제공자는 빈 칸을 막지 않는다 — 켤 생각이 없는 것 때문에 저장이 막히면 안 된다. */
        if (field.required && setting.enabled) found[field.key] = `${field.label}을(를) 입력해 주세요.`;
        continue;
      }
      // 여러 줄 키(.p8)는 줄바꿈이 값의 일부라 공백 검사를 하지 않는다.
      if (!field.multiline && /\s/.test(raw)) {
        found[field.key] = '앞뒤 공백이나 줄바꿈이 섞여 있습니다. 값만 남겨 주세요.';
        continue;
      }
      if (field.multiline && !raw.includes('BEGIN PRIVATE KEY')) {
        found[field.key] = '-----BEGIN PRIVATE KEY----- 로 시작하는 .p8 파일 내용을 그대로 붙여 넣어 주세요.';
      }
    }
    return found;
  };

  const update = (id: string, patch: Partial<OauthSetting>) => {
    if (!tenant) return;
    setSaved((previous) => ({
      ...previous,
      [tenant.id]: providersOf(tenant.id).map((provider) =>
        provider.id === id ? { ...provider, ...patch } : provider,
      ),
    }));
  };

  const setCredential = (id: string, key: string, value: string) => {
    const target = providers.find((provider) => provider.id === id);
    if (!target) return;

    update(id, { credentials: { ...target.credentials, [key]: value } });
    // 고치는 동안 붉은 글씨를 지운다 — 이미 고친 칸이 계속 틀린 것으로 남으면 무엇을 고쳤는지 헷갈린다.
    setErrors((previous) => {
      const next = { ...previous };
      delete next[`${id}.${key}`];
      return next;
    });
  };

  const toggle = (setting: OauthSetting, on: boolean) => {
    update(setting.id, { enabled: on });
    if (!on || oauthReady(setting)) return;

    /*
      값이 덜 찬 채로 켜면 그 자리에서 창을 연다. 켜 두기만 하면 고객사 화면에는 단추가 뜨는데
      누르면 오류로 가고, 그 어긋남은 고객이 눌러 봐야 드러난다.
    */
    setEditing(setting.id);
    toast.error({
      message: `${findOauthProvider(setting.id).label} 키가 아직 없습니다.`,
      detail: '켜기 전에 필요한 값을 채워 주세요.',
    });
  };

  const save = () => {
    if (!editingSetting || !tenant) return;
    const provider = findOauthProvider(editingSetting.id);
    const found = validate(editingSetting);

    if (Object.keys(found).length > 0) {
      setErrors((previous) => {
        const next = { ...previous };
        for (const [key, message] of Object.entries(found)) next[`${editingSetting.id}.${key}`] = message;
        return next;
      });
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setEditing(null);
    toast.success({
      message: `${provider.label} 키를 저장했습니다.`,
      detail: `${tenant.name} · ${editingSetting.enabled ? '사용' : '사용 안 함'}`,
    });
  };

  /** 창에 넘길 오류는 그 제공자 것만 — 창 안에서는 제공자 이름이 이미 제목에 있다. */
  const errorsOf = (id: string): Record<string, string> =>
    Object.fromEntries(
      Object.entries(errors)
        .filter(([at]) => at.startsWith(`${id}.`))
        .map(([at, message]) => [at.slice(id.length + 1), message]),
    );

  return (
    <div className="flex flex-col gap-6">
      {/*
        고객사 목록이 곧 이 화면이다. 가장 급한 물음이 **어느 고객사의 로그인이 아직 안
        열렸는가**인데, 선택기 하나로는 고객사를 하나씩 골라 봐야 알 수 있었다.
      */}
      <IntegrationTenantList
        value={tenantId}
        onChange={setTenantId}
        description="줄을 누르면 그 고객사의 소셜 로그인 제공자 목록이 창에서 열립니다."
        columns={[
          { label: '배포 도메인', span: 'lg:col-span-3' },
          { label: '켠 제공자', span: 'lg:col-span-2' },
          { label: '플랜', span: 'lg:col-span-2' },
        ]}
        render={(one) => {
          const list = providersOf(one.id);
          const on = list.filter((setting) => setting.enabled);
          /* 켰는데 값이 덜 찬 곳을 목록에서 센다 — 그 상태는 고객이 눌러 봐야 드러나는 자리다. */
          const short = on.filter((setting) => !oauthReady(setting));

          return [
            <span key="domain" className="min-w-0 truncate font-mono text-xs text-ink-muted">
              {one.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? '배포 없음'}
            </span>,
            <span key="on" className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm tabular-nums">
                {on.length}
                <span className="text-ink-faint"> / {list.length}</span>
              </span>
              {short.length > 0 && <Badge tone="wait">값 부족 {short.length}</Badge>}
            </span>,
            <span key="plan" className="min-w-0 truncate text-sm">
              {one.plan}
            </span>,
          ];
        }}
      />

      <OauthTenantModal
        open={tenant !== undefined}
        tenant={tenant}
        providers={providers}
        brokenOf={(id) => Object.keys(errorsOf(id)).length > 0}
        onClose={() => {
          setTenantId('');
          setEditing(null);
        }}
        onToggle={toggle}
        onEdit={setEditing}
      />

      {/* 고객사 창 **위에** 뜬다 — 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다. */}
      <OauthProviderModal
        open={editingSetting !== null}
        setting={editingSetting}
        errors={editingSetting ? errorsOf(editingSetting.id) : {}}
        elevated
        onClose={() => setEditing(null)}
        onChange={(key, value) => editingSetting && setCredential(editingSetting.id, key, value)}
        onSubmit={save}
      />
    </div>
  );
}

/* `TENANTS` 는 목록 조각이 읽는다 — 이 파일에서는 고객사 하나를 찾는 데만 쓴다. */
void TENANTS;
