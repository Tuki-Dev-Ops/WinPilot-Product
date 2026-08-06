'use client';

import { Badge, Button, Checkbox, Modal, RowActions, RowTextButton } from '@winpilot/ui';
import { maskSecret } from '@/lib/data/integrations';
import { findOauthProvider, type OauthSetting } from '@/lib/data/oauth-providers';
import type { TenantRecord } from '@/lib/data/tenants';

/** 그 제공자의 필수 값이 다 찼는가 — 켤 수 있는 상태인지를 목록에서 바로 읽게 한다. */
export function oauthReady(setting: OauthSetting): boolean {
  return findOauthProvider(setting.id)
    .fields.filter((field) => field.required)
    .every((field) => (setting.credentials[field.key] ?? '').trim());
}

/**
 * 한 고객사의 **소셜 로그인 제공자 목록** 창.
 *
 * ## 왜 창인가
 * 전에는 고객사 목록 밑에 이 목록이 이어져 있었다. 다른 고객사를 누르면 화면은 그대로인데
 * 아래만 바뀌어서, 지금 켜고 있는 것이 누구 것인지 제목을 다시 읽어야 했다. **로그인 키는
 * 잘못 들어가면 그 고객사의 고객이 로그인하지 못하는 값**이다.
 *
 * ## 아래줄이 닫기 하나다
 * 저장은 **제공자마다 따로** 일어난다(`OauthProviderModal`). 이 창에 저장을 두면 그 단추가
 * 무엇을 저장하는지 알 수 없다 — 켜고 끈 것인지, 안쪽 창에서 넣은 키인지.
 *
 * ## 값이 덜 찬 채로 켤 수 없다
 * 켜 두기만 하면 고객사 화면에는 단추가 뜨는데 누르면 오류로 간다. 그 어긋남은 **고객이
 * 눌러 봐야** 드러나므로, 켜는 순간 값 창을 열어 준다.
 */
export function OauthTenantModal({
  open,
  tenant,
  providers,
  brokenOf,
  onClose,
  onToggle,
  onEdit,
}: {
  open: boolean;
  tenant: TenantRecord | undefined;
  providers: OauthSetting[];
  /** 그 제공자에 붉은 글씨가 남아 있는가 */
  brokenOf: (id: string) => boolean;
  onClose: () => void;
  onToggle: (setting: OauthSetting, on: boolean) => void;
  onEdit: (id: string) => void;
}) {
  if (!tenant) return null;

  return (
    <Modal
      open={open}
      title={`소셜 로그인 — ${tenant.name}`}
      description="켤 제공자를 고르고, 키는 줄의 설정을 눌러 넣습니다. 리다이렉트 주소는 고객사 도메인에서 자동으로 만들어집니다."
      onClose={onClose}
      footer={
        <Button tone="secondary" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <div className="flex flex-col">
        {providers.map((setting) => {
          const provider = findOauthProvider(setting.id);
          const secretField = provider.fields.find((field) => field.secret);
          const savedSecret = secretField ? setting.credentials[secretField.key] ?? '' : '';
          const done = provider.fields.filter((field) => (setting.credentials[field.key] ?? '').trim()).length;

          return (
            <div
              key={setting.id}
              className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Checkbox
                  checked={setting.enabled}
                  onChange={(checked) => onToggle(setting, checked)}
                  label={`${provider.label} 사용`}
                />
                <div className="min-w-0">
                  <p className="min-w-0 truncate text-sm font-medium">{provider.label}</p>
                  {/* 어느 콘솔로 가야 하는지 — 값을 찾으러 나갈 때 첫 번째로 막히는 자리다. */}
                  <p className="min-w-0 truncate text-xs text-ink-faint">{provider.console}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span className="whitespace-nowrap text-sm tabular-nums">
                  {done}
                  <span className="text-ink-faint"> / {provider.fields.length}</span>
                </span>
                <span className="whitespace-nowrap font-mono text-xs text-ink-faint">
                  {maskSecret(savedSecret)}
                </span>
                {/*
                  켠 것과 끈 것을 색만이 아니라 글자로도 가른다. 켰는데 값이 덜 찬 상태를 따로
                  적는 이유: `사용` 으로만 보이면 되는 줄 알고 지나간다.
                */}
                {brokenOf(setting.id) ? (
                  <Badge tone="danger">확인 필요</Badge>
                ) : setting.enabled ? (
                  <Badge tone={oauthReady(setting) ? 'ok' : 'wait'}>
                    {oauthReady(setting) ? '사용' : '값 부족'}
                  </Badge>
                ) : (
                  <Badge tone="neutral">사용 안 함</Badge>
                )}
                <RowActions>
                  <RowTextButton onClick={() => onEdit(setting.id)}>설정</RowTextButton>
                </RowActions>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
