'use client';

import { useEffect, useState } from 'react';
import { Badge, Checkbox, HintInput } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { PLUGIN_DEFAULTS, type PluginSetting } from '@/lib/data/integrations';
import type { TenantRecord } from '@/lib/data/tenants';

/** 켜 둔 조각의 키만 본다 — 켤 생각이 없는 값 때문에 저장이 막히면 안 된다. */
export function validatePlugins(list: PluginSetting[]): Record<string, string> {
  const found: Record<string, string> = {};

  for (const plugin of list) {
    if (!plugin.enabled || !plugin.keyField) continue;

    const value = plugin.key.trim();
    if (!value) {
      found[plugin.id] = `${plugin.keyField.label}을(를) 입력해 주세요.`;
      continue;
    }
    if (plugin.keyField.pattern && !plugin.keyField.pattern.test(value)) {
      found[plugin.id] = plugin.keyField.patternMessage ?? `${plugin.keyField.label} 형식이 올바르지 않습니다.`;
    }
  }
  return found;
}

/**
 * 한 고객사의 **얹는 조각**을 켜고 키를 넣는 창.
 *
 * ## 왜 화면 아래가 아니라 창인가
 * 전에는 고객사 목록 밑에 설정 묶음이 이어져 있었다. 목록에서 다른 고객사를 누르면 **화면은
 * 그대로인데 아래 내용만 바뀌어서**, 지금 보고 있는 것이 누구 것인지 제목을 다시 읽어야 했다.
 * 키는 고객사마다 다른 값이고 잘못 넣으면 남의 배포에 남의 키가 들어간다 — 그 자리는
 * **어느 고객사의 것인지가 화면을 덮을 만큼 분명해야** 한다.
 *
 * 창은 또 **한 번에 한 고객사**라는 사실을 모양으로 말한다. 닫으면 목록으로 돌아오고,
 * 목록은 어디가 켜져 있는지를 계속 보여 준다.
 *
 * ## 키 칸은 꺼 두어도 보인다
 * 전에는 켜야 나타났는데, 그러면 **무엇을 준비해야 켤 수 있는지**를 켜 보기 전에는 알 수
 * 없었다. 대신 별표는 켰을 때만 붙는다.
 */
export function PluginSettingsModal({
  open,
  tenant,
  onClose,
  onSubmit,
}: {
  open: boolean;
  tenant: TenantRecord | undefined;
  onClose: () => void;
  onSubmit: (plugins: PluginSetting[]) => void;
}) {
  const [plugins, setPlugins] = useState<PluginSetting[]>(PLUGIN_DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  /* 창을 열 때마다 그 고객사의 값으로 되돌린다 — 앞 고객사의 키가 남아 있으면 사고가 난다. */
  useEffect(() => {
    if (!open) return;
    setPlugins(PLUGIN_DEFAULTS);
    setErrors({});
    setSubmitted(false);
  }, [open, tenant?.id]);

  if (!tenant) return null;

  const update = (id: string, patch: Partial<PluginSetting>) => {
    const next = plugins.map((item) => (item.id === id ? { ...item, ...patch } : item));
    setPlugins(next);
    if (submitted) setErrors(validatePlugins(next));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validatePlugins(plugins);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit(plugins);
  };

  const hidden = plugins.filter((plugin) => plugin.enabled && !plugin.visible);

  return (
    <InternalModal
      open={open}
      title={`얹는 조각 — ${tenant.name}`}
      description="켜는 순간 고객사 화면에서 바로 돕니다. 플랜이 열어 주지 않는 것은 켤 수 없습니다."
      onClose={onClose}
      onSubmit={submit}
      submitLabel="저장"
    >
      {plugins.map((plugin) => (
        <div key={plugin.id} className="flex flex-col gap-4 rounded-lg border border-border px-5 py-4">
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
              <Badge tone={plugin.visible ? 'brand' : 'neutral'}>
                {plugin.visible ? '화면에 보임' : '보이지 않음'}
              </Badge>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                {plugin.requires} 이상
              </span>
            </div>
          </div>

          {plugin.keyField && (
            <InternalField
              label={plugin.keyField.label}
              htmlFor={`plugin-${plugin.id}-key`}
              required={plugin.enabled}
              {...(errors[plugin.id] ? { error: errors[plugin.id] } : { hint: plugin.keyField.note })}
            >
              <HintInput
                id={`plugin-${plugin.id}-key`}
                type="text"
                hint={plugin.keyField.hint}
                value={plugin.key}
                onChange={(event) => update(plugin.id, { key: event.target.value })}
                invalid={Boolean(errors[plugin.id])}
                {...(errors[plugin.id] ? { 'aria-describedby': `plugin-${plugin.id}-key-error` } : {})}
              />
            </InternalField>
          )}
        </div>
      ))}

      {hidden.length > 0 && (
        <p className="rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-ink-muted">
          보이지 않는 조각 {hidden.length}개가 켜져 있습니다 — {hidden.map((plugin) => plugin.label).join(', ')}.
          고객사 화면에는 나타나지 않지만 값은 밖으로 나갑니다.
        </p>
      )}
    </InternalModal>
  );
}
