'use client';

import { useState, type FormEvent } from 'react';
import { Badge, Checkbox, Dropdown, HintInput, useToast } from '@winpilot/ui';
import { InternalPrimaryButton, InternalSaveRow } from '@/app/_components/InternalForm';
import { InternalPanel, InternalSummary } from '@/app/_components/InternalPanel';
import { ALARM_CHANNELS, ALARM_RULES, RANK_TONE, STAFF_RANKS, type AlarmChannel, type AlarmRule, type StaffRank } from '@/lib/data/settings';

/**
 * 알림 규칙.
 *
 * 규칙마다 **신호를 내는 화면**을 함께 적는다. 알림이 이상하면 고칠 곳이 여기인지 저기인지
 * 부터 찾게 되는데, 출처를 적어 두면 그 한 걸음이 없어진다.
 *
 * `알림 없음` 을 채널의 하나로 둔 이유: 규칙을 지우는 것과 잠시 끄는 것은 다르다. 지우면
 * 그런 신호가 있다는 사실 자체가 화면에서 사라져, 나중에 필요해진 사람이 새로 만든다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function AlarmSettingsView() {
  const toast = useToast();
  const [rules, setRules] = useState<AlarmRule[]>(ALARM_RULES);

  const update = (id: string, patch: Partial<AlarmRule>) => {
    setRules((previous) => previous.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const on = rules.filter((rule) => rule.enabled);
  const silent = on.filter((rule) => rule.channel === '알림 없음');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 켜 두고 며칠인지가 비면 언제 알릴지 아무도 모르는 규칙이 된다.
    const broken = rules.filter((rule) => rule.enabled && !Number.isFinite(rule.offsetDays));
    if (broken.length > 0) {
      toast.error({ message: '저장하지 못했습니다.', detail: '알릴 시점을 숫자로 넣어 주세요.' });
      return;
    }

    toast.success({
      message: '알림 규칙을 저장했습니다.',
      detail: `${on.length}개 켬 · ${rules.length - on.length}개 끔`,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <InternalSummary
        cards={[
          { label: '규칙', value: `${rules.length}개` },
          { label: '켜 둔 규칙', value: `${on.length}개` },
          {
            label: '보내지 않는 규칙',
            value: `${silent.length}개`,
            tone: silent.length > 0 ? 'text-signal-danger' : '',
            hint: '켜져 있지만 채널이 알림 없음입니다.',
          },
        ]}
      />

      <InternalPanel
        title="언제 · 누구에게 알릴까"
        description="신호를 내는 화면을 함께 적습니다. 알림이 이상할 때 어디를 고쳐야 하는지가 바로 보여야 합니다."
      >
        <div className="flex flex-col">
          {rules.map((rule) => (
            <div key={rule.id} className="flex flex-col gap-4 border-b border-border px-6 py-5 last:border-b-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Checkbox
                    checked={rule.enabled}
                    onChange={(checked) => update(rule.id, { enabled: checked })}
                    label={`${rule.event} 알림 사용`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{rule.event}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{rule.source}</p>
                  </div>
                </div>

                <Badge tone={RANK_TONE[rule.audience]}>
                  {rule.audience}
                </Badge>
              </div>

              {rule.enabled && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor={`alarm-${rule.id}-offset`} className="text-sm font-medium">
                      알릴 시점
                    </label>
                    <HintInput
                      id={`alarm-${rule.id}-offset`}
                      type="text"
                      hint="며칠 전 · 후"
                      value={`${rule.offsetDays}`}
                      onChange={(event) =>
                        update(rule.id, { offsetDays: Number(event.target.value.replace(/[^0-9]/g, '')) || 0 })
                      }
                      invalid={!Number.isFinite(rule.offsetDays)}
                    />
                    <p className="text-xs leading-relaxed text-ink-faint">
                      {rule.offsetDays === 0 ? '일이 생긴 그 자리에서 알립니다.' : `${rule.offsetDays}일을 기준으로 알립니다.`}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-sm font-medium">보내는 곳</span>
                    <Dropdown
                      id={`alarm-${rule.id}-channel`}
                      label="채널 선택"
                      options={ALARM_CHANNELS.map((channel) => ({ value: channel, label: channel }))}
                      value={rule.channel}
                      onChange={(next) => update(rule.id, { channel: next as AlarmChannel })}
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-sm font-medium">받는 사람</span>
                    <Dropdown
                      id={`alarm-${rule.id}-audience`}
                      label="직급 선택"
                      options={STAFF_RANKS.map((item) => ({ value: item, label: item }))}
                      value={rule.audience}
                      onChange={(next) => update(rule.id, { audience: next as StaffRank })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {silent.length > 0 && (
          <p className="border-t border-border bg-surface px-6 py-4 text-sm leading-relaxed text-ink-muted">
            켜져 있지만 보내는 곳이 `알림 없음` 인 규칙이 {silent.length}개 있습니다. 규칙을 지우는 것과 잠시
            끄는 것은 다르므로 이 상태를 오류로 보지 않습니다 — 다만 아무 데도 가지 않습니다.
          </p>
        )}

        <InternalSaveRow>
          <InternalPrimaryButton>저장</InternalPrimaryButton>
        </InternalSaveRow>
      </InternalPanel>

      <InternalPanel
        title="이 콘솔에는 푸시 알림이 없다"
        description="서버가 없어 보낼 곳이 없습니다. 메일과 사내 메신저는 사람이 받는 곳이고, 화면 안 알림은 토스트 한 자리뿐입니다."
      >
        <p className="px-6 py-5 text-sm leading-relaxed text-ink-muted">
          기준을 미리 정해 두는 이유는, 나중에 필요해진 사람이 그 자리에서 즉흥으로 정하면 그때부터 두 벌이 되기
          때문입니다. 비기능 명세의 알림 절과 같은 말입니다.
        </p>
      </InternalPanel>
    </form>
  );
}
