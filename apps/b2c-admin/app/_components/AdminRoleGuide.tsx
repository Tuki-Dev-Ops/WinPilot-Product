'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  ACTION_LABEL,
  ACTION_NOTE,
  TENANT_GROUPS,
  TENANT_RESOURCES,
  TENANT_ROLES,
  hasPermission,
  type PermissionAction,
} from '@winpilot/store';
import { Badge } from '@winpilot/ui';

const ACTIONS: PermissionAction[] = ['read', 'write', 'delete', 'manage'];

/** 열 수만큼의 그리드. 조립하면 Tailwind 가 클래스를 못 찾으므로 표로 적어 둔다. */
const GRID: Record<number, string> = {
  2: 'lg:grid-cols-[minmax(0,1fr)_repeat(2,7rem)]',
  3: 'lg:grid-cols-[minmax(0,1fr)_repeat(3,7rem)]',
  4: 'lg:grid-cols-[minmax(0,1fr)_repeat(4,7rem)]',
  5: 'lg:grid-cols-[minmax(0,1fr)_repeat(5,7rem)]',
};

/**
 * 역할이 무엇을 여는지 보여 주는 표.
 *
 * ## 왜 이 화면에 있어야 하나
 * 관리자를 등록할 때 고르는 것은 **역할 이름 하나**인데, 그 이름이 무엇을 여는지는 어디에도
 * 적혀 있지 않았다. `CS` 와 `상품 심사` 중 무엇을 줘야 하는지 화면에서 답할 수 없으면,
 * 결국 넓은 쪽(`최고 관리자`)을 주게 된다 — **최소 권한이 무너지는 가장 흔한 자리**다.
 *
 * ## 우리가 정하고 고객사가 고른다
 * 목록의 원본은 `@winpilot/store` 의 `TENANT_ROLES` 다. 사내 콘솔
 * (`internal-admin` 의 `/subscriptions/roles`)이 정하는 그 값을 여기서 읽기만 한다 —
 * 고객사가 역할 자체를 만들지는 못한다. 자유롭게 만들게 두면 이름만 다른 역할이 열 개 생기고,
 * 그때부터 누가 무엇을 할 수 있는지 아무도 답하지 못한다.
 *
 * ## 접어 두는 이유
 * 관리자 목록을 여는 사람이 언제나 권한을 정하러 오는 것은 아니다. 늘 펼쳐 두면 표가
 * 목록보다 길어져 정작 볼 것을 밀어낸다.
 */
export function AdminRoleGuide() {
  const [open, setOpen] = useState(false);
  const cols = GRID[TENANT_ROLES.length] ?? GRID[4];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold tracking-tight">역할이 여는 것</span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
            관리자를 등록할 때 고르는 역할 넷이 각각 무엇을 할 수 있는지입니다.
          </span>
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-ink-faint transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <ChevronDown aria-hidden className="size-3.5" strokeWidth={1.5} />
        </span>
      </button>

      {open && (
        <>
          <div className="overflow-x-auto border-t border-border">
            <div className="min-w-180">
              <div className={`hidden gap-x-2 border-b border-border px-6 py-3 lg:grid ${cols} lg:items-end`}>
                <span className="text-xs uppercase tracking-widest text-ink-faint">자원</span>
                {TENANT_ROLES.map((role) => (
                  <div key={role.id} className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold">{role.label}</span>
                    {/* 최고 관리자는 지울 수 없다 — 없애려다 막히는 이유가 화면에 있어야 한다. */}
                    {role.fixed && <span className="whitespace-nowrap text-3xs text-ink-faint">고정</span>}
                  </div>
                ))}
              </div>

              {TENANT_GROUPS.map((group) => {
                const inGroup = TENANT_RESOURCES.filter((one) => one.group === group);
                if (inGroup.length === 0) return null;

                return (
                  <div key={group}>
                    <p className="border-b border-border bg-surface px-6 py-2 text-xs uppercase tracking-widest text-ink-faint">
                      {group}
                    </p>

                    {inGroup.map((resource) => (
                      <div
                        key={resource.key}
                        className={`grid grid-cols-1 gap-x-2 gap-y-2 border-b border-border px-6 py-3 last:border-b-0 lg:gap-y-0 ${cols} lg:items-center`}
                      >
                        <div className="min-w-0">
                          <p className="min-w-0 truncate text-sm">{resource.label}</p>
                          <p className="min-w-0 truncate text-xs text-ink-faint">{resource.note}</p>
                        </div>

                        {TENANT_ROLES.map((role) => {
                          const on = resource.actions.filter((action) =>
                            hasPermission(role, resource.key, action),
                          );
                          return (
                            <div key={role.id} className="flex flex-wrap items-center gap-1 lg:justify-center">
                              {/* 좁은 화면에는 열 머리가 없으므로 역할 이름을 함께 적는다. */}
                              <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">
                                {role.label}
                              </span>
                              {on.length === 0 ? (
                                <>
                                  <span aria-hidden className="text-ink-faint">
                                    —
                                  </span>
                                  <span className="sr-only">권한 없음</span>
                                </>
                              ) : (
                                ACTIONS.filter((action) => on.includes(action)).map((action) => (
                                  <Badge
                                    key={action}
                                    size="sm"
                                    /* 되돌릴 수 없는 것은 색으로도 갈라 둔다. */
                                    tone={action === 'delete' || action === 'manage' ? 'danger' : 'neutral'}
                                  >
                                    {ACTION_LABEL[action]}
                                  </Badge>
                                ))
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface px-6 py-4">
            {ACTIONS.map((action) => (
              <div key={action} className="flex items-baseline gap-3">
                <span className="w-20 shrink-0">
                  <Badge
                    size="sm"
                    tone={action === 'delete' || action === 'manage' ? 'danger' : 'neutral'}
                  >
                    {ACTION_LABEL[action]}
                  </Badge>
                </span>
                <span className="min-w-0 text-xs leading-relaxed text-ink-muted">{ACTION_NOTE[action]}</span>
              </div>
            ))}
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">
              역할은 계약한 플랜이 정합니다. 여기서 만들거나 고치지 못하며, 바꾸려면 담당자에게
              문의하세요.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
