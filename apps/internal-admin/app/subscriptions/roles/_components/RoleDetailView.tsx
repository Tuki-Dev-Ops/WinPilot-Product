'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Checkbox, useToast } from '@winpilot/ui';
import { InternalPanel } from '@/app/_components/InternalPanel';
import {
  ACTION_LABEL,
  ACTION_NOTE,
  CONSOLE_GROUPS,
  CONSOLE_NOTE,
  CONSOLE_RESOURCES,
  permissionKey,
  type ConsoleDomain,
  type PermissionAction,
  type RoleTemplate,
} from '@/lib/data/permissions';

const ACTIONS: PermissionAction[] = ['read', 'write', 'delete', 'manage'];

/** 되돌릴 수 없는 동작은 색으로도 갈라 둔다. */
function isHeavy(action: PermissionAction): boolean {
  return action === 'delete' || action === 'manage';
}

/**
 * 역할 하나의 **세부 권한**을 켜고 끄는 자리.
 *
 * ## 왜 목록에서 내려왔나
 * 자원이 열다섯이고 동작이 넷이면 예순 칸이다. 목록 밑에 늘 펼쳐 두면 "역할이 몇 개인가" 를
 * 보러 온 사람이 예순 칸을 지나쳐야 하고, 모달에 넣으면 가로로 잘린다. 한 역할을 정하고 나서
 * 하는 일이라 화면을 따로 세웠다.
 *
 * ## 줄이 자원, 칸이 동작
 * `자원 하나 × 동작 서넛` 으로 묶어 고를 것을 줄인다 — 원자 권한을 예순 개 늘어놓으면 고르는
 * 사람이 매번 예순 번 판단한다(`@winpilot/store` 의 `permissions.ts` 머리말).
 *
 * ## 없는 칸은 그리지 않는다
 * `주문` 에 `삭제` 가 없는 것은 권한이 없어서가 아니라 **주문은 지우는 자원이 아니어서**다.
 * 회색으로 눌리지 않는 칸을 두면 왜 못 누르는지를 찾게 되므로 자리 자체를 비운다.
 *
 * ## 고정 역할
 * 최고 관리자는 칸을 잠근다. 여기서 한 칸이라도 끄면 그 콘솔에서 권한을 되돌릴 수 있는 사람이
 * 아무도 남지 않는 순간이 생긴다.
 */
export function RoleDetailView({ domain, role }: { domain: ConsoleDomain; role: RoleTemplate }) {
  const toast = useToast();
  const resources = CONSOLE_RESOURCES[domain];
  const groups = CONSOLE_GROUPS[domain];

  /*
    저장 전까지는 화면 안에서만 바뀐다. 칸을 켤 때마다 저장하면 잘못 누른 것을 되돌릴 자리가
    없어지고, 권한은 잘못 켠 것을 알아차리는 데 가장 오래 걸리는 값이다.
  */
  const [granted, setGranted] = useState<string[]>(role.grants);
  const saved = useMemo(() => new Set(role.grants), [role.grants]);
  const current = new Set(granted);

  const dirty = granted.length !== saved.size || granted.some((key) => !saved.has(key));

  const toggle = (key: string, on: boolean) =>
    setGranted((previous) => (on ? [...previous, key] : previous.filter((one) => one !== key)));

  /** 그 도메인에서 켤 수 있는 칸의 총수. 분모가 없으면 `28개` 가 넓은지 좁은지 알 수 없다. */
  const total = resources.reduce((sum, resource) => sum + resource.actions.length, 0);

  const save = () => {
    if (role.fixed) return;
    /*
      **조회 없이 등록만 켜진 자원**을 막는다. 목록을 보지 못하는 사람에게 등록 단추만 주면
      자기가 만든 것조차 확인하지 못한다 — 화면은 열리는데 아무것도 보이지 않는 상태가 된다.
    */
    const broken = resources.filter((resource) => {
      if (!resource.actions.includes('read')) return false;
      const hasOther = resource.actions.some(
        (action) => action !== 'read' && current.has(permissionKey(resource.key, action)),
      );
      return hasOther && !current.has(permissionKey(resource.key, 'read'));
    });

    if (broken.length > 0) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `${broken.map((one) => one.label).join(' · ')} — 조회 없이 다른 동작만 켤 수 없습니다.`,
      });
      return;
    }

    if (granted.length === 0) {
      toast.error({
        message: '저장하지 못했습니다.',
        detail: '아무것도 열지 않는 역할은 둘 이유가 없습니다. 최소 한 칸은 켜세요.',
      });
      return;
    }

    /* 프론트엔드 전용이라 시드는 그대로다 — 서버가 붙으면 이 자리가 저장 호출이 된다. */
    toast.success({
      message: '권한을 저장했습니다.',
      detail: `${role.label} · ${granted.length}개 / ${total}개`,
    });
  };

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <InternalPanel title={`${role.label} 세부 권한`} description={CONSOLE_NOTE[domain]}>
          {groups.map((group) => {
            const inGroup = resources.filter((resource) => resource.group === group);
            if (inGroup.length === 0) return null;

            return (
              <div key={group}>
                <p className="border-b border-border bg-surface px-6 py-2 text-xs uppercase tracking-widest text-ink-faint">
                  {group}
                </p>

                {inGroup.map((resource) => (
                  <div
                    key={resource.key}
                    className="flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
                  >
                    <div className="min-w-0 lg:flex-1">
                      <p className="min-w-0 truncate text-sm font-medium">{resource.label}</p>
                      <p className="min-w-0 truncate text-xs text-ink-faint">{resource.note}</p>
                      <p className="min-w-0 truncate font-mono text-3xs text-ink-faint">{resource.key}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
                      {/* 없는 동작은 자리 자체를 비운다 — 눌리지 않는 칸을 두면 왜 못 누르는지를 찾게 된다. */}
                      {ACTIONS.filter((action) => resource.actions.includes(action)).map((action) => {
                        const key = permissionKey(resource.key, action);
                        const on = current.has(key);

                        return (
                          <label
                            key={action}
                            className={`flex items-center gap-2 ${role.fixed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Checkbox
                              checked={on}
                              onChange={(checked) => toggle(key, checked)}
                              label={`${resource.label} ${ACTION_LABEL[action]}`}
                              disabled={role.fixed}
                            />
                            <span
                              className={`whitespace-nowrap text-xs ${
                                on && isHeavy(action) ? 'font-medium text-signal-danger' : 'text-ink-muted'
                              }`}
                            >
                              {ACTION_LABEL[action]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </InternalPanel>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-6 xl:sticky xl:top-6 xl:w-80">
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-canvas px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-semibold tracking-tight">{role.label}</h2>
            <Badge tone="brand">{domain}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">{role.note}</p>
          <p className="font-mono text-xs text-ink-faint">{role.id}</p>

          <div className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
            <span className="shrink-0 text-xs text-ink-faint">여는 권한</span>
            <span className="text-sm tabular-nums">
              {granted.length}
              <span className="text-ink-faint"> / {total}</span>
            </span>
          </div>

          {role.fixed ? (
            /* 잠긴 이유를 화면에 두지 않으면 매번 말로 설명하게 된다. */
            <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
              고정 역할이라 칸을 바꾸지 못합니다. 여기서 한 칸이라도 끄면 그 콘솔에서 권한을
              되돌릴 수 있는 사람이 아무도 남지 않는 순간이 생깁니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <Button block onClick={save} disabled={!dirty}>
                저장
              </Button>
              <Button block tone="secondary" onClick={() => setGranted(role.grants)} disabled={!dirty}>
                되돌리기
              </Button>
            </div>
          )}

          <a
            href="/subscriptions/roles"
            className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            목록으로
          </a>
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-border bg-canvas px-6 py-5">
          <h2 className="text-base font-semibold tracking-tight">동작</h2>
          {ACTIONS.map((action) => (
            <div key={action} className="flex items-baseline gap-3">
              <span className="w-20 shrink-0">
                <Badge size="sm" tone={isHeavy(action) ? 'danger' : 'neutral'}>
                  {ACTION_LABEL[action]}
                </Badge>
              </span>
              <span className="min-w-0 text-xs leading-relaxed text-ink-muted">{ACTION_NOTE[action]}</span>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}
