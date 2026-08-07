'use client';

import { Badge } from '@winpilot/ui';
import {
  ACTION_LABEL,
  ACTION_NOTE,
  hasPermission,
  type PermissionAction,
  type PermissionResource,
  type RoleTemplate,
} from '@/lib/data/permissions';

const ACTIONS: PermissionAction[] = ['read', 'write', 'delete', 'manage'];

export type PermissionMatrixProps = {
  roles: RoleTemplate[];
  resources: PermissionResource[];
  groups: readonly string[];
};

/** 열 수만큼의 그리드. 조립하면 Tailwind 가 클래스를 못 찾으므로 표로 적어 둔다. */
const GRID: Record<number, string> = {
  1: 'grid-cols-[minmax(0,1fr)_repeat(1,7rem)]',
  2: 'grid-cols-[minmax(0,1fr)_repeat(2,7rem)]',
  3: 'grid-cols-[minmax(0,1fr)_repeat(3,7rem)]',
  4: 'grid-cols-[minmax(0,1fr)_repeat(4,7rem)]',
};

/**
 * 그 역할이 이 자원에서 할 수 있는 동작.
 *
 * 켜진 동작만 적는다 — 꺼진 것까지 늘어놓으면 한 칸에 네 마디가 들어가 표가 읽히지 않는다.
 * 대신 **아무것도 못 하면 `—`** 로 비어 있음을 분명히 적는다. 빈 칸은 '없음' 과 '아직 안 정함'
 * 을 구분하지 못한다.
 */
function Cell({ role, resource }: { role: RoleTemplate; resource: PermissionResource }) {
  const on = resource.actions.filter((action) => hasPermission(role, resource.key, action));

  if (on.length === 0) {
  /*
    `min-w-0` 이 함께 있어야 한다. 아래 상자는 세로 `flex` 안에 들어가는데, flex 자식의 최소
    폭은 기본이 `auto` — **안에 든 것보다 좁아지지 않는다.** 그래서 `overflow-x-auto` 를 주어도
    상자 자체가 `min-w-180` 만큼 벌어져, 스크롤 막대 대신 **페이지가 통째로 밀린다.**
  */
  return (
      <span className="flex items-center justify-center">
        <span aria-hidden className="text-ink-faint">
          —
        </span>
        <span className="sr-only">권한 없음</span>
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center justify-center gap-1">
      {ACTIONS.filter((action) => on.includes(action)).map((action) => (
        <Badge
          key={action}
          size="sm"
          /* 되돌릴 수 없는 것은 색으로도 갈라 둔다 — 표를 훑을 때 먼저 눈에 걸려야 한다. */
          tone={action === 'delete' || action === 'manage' ? 'danger' : 'neutral'}
        >
          {ACTION_LABEL[action]}
        </Badge>
      ))}
    </span>
  );
}

/**
 * 역할 × 자원 권한표.
 *
 * ## 왜 표인가
 * 역할마다 카드를 세우면 같은 자원 이름이 역할 수만큼 되풀이되고, **"CS 는 되는데 상품 심사는
 * 안 되는 것"** 을 찾으려면 카드 사이를 눈으로 오가야 한다. 권한을 정할 때 사람이 가장 많이
 * 묻는 것이 그 차이다. 행이 자원, 열이 역할이면 그 물음이 한 줄 읽기가 된다.
 *
 * ## 되돌릴 수 없는 것을 갈라 둔다
 * `삭제` 와 `설정 변경` 은 붉게 적는다. 이 둘은 잘못 열었을 때 되돌릴 수 없는 쪽이라,
 * 권한을 훑는 사람이 먼저 확인해야 하는 자리다.
 *
 * ## 자원마다 갖는 동작이 다르다
 * `통계` 에는 `조회` 밖에 없고 `실결제 전환` 에는 `설정 변경` 밖에 없다. 없는 동작 칸을
 * 그리면 왜 못 누르는지를 찾게 되므로, 자원이 실제로 갖는 것만 그린다.
 */
export function PermissionMatrix({ roles, resources, groups }: PermissionMatrixProps) {
  const cols = GRID[roles.length] ?? GRID[4];

  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="min-w-180">
        <div className={`grid ${cols} items-end gap-x-2 border-b border-border px-6 py-4`}>
          <span className="text-xs uppercase tracking-widest text-ink-faint">자원</span>
          {roles.map((role) => (
            <div key={role.id} className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold">{role.label}</span>
              {/* 지울 수 없는 역할임을 표시한다 — 없애려다 막히는 이유가 화면에 있어야 한다. */}
              {role.fixed && (
                <span className="whitespace-nowrap text-3xs text-ink-faint">고정</span>
              )}
            </div>
          ))}
        </div>

        {groups.map((group) => {
          const inGroup = resources.filter((one) => one.group === group);
          if (inGroup.length === 0) return null;

          return (
            <div key={group}>
              <p className="border-b border-border bg-surface px-6 py-2 text-xs uppercase tracking-widest text-ink-faint">
                {group}
              </p>

              {inGroup.map((resource) => (
                <div
                  key={resource.key}
                  className={`grid ${cols} items-center gap-x-2 border-b border-border px-6 py-3 last:border-b-0`}
                >
                  <div className="min-w-0">
                    <p className="min-w-0 truncate text-sm">{resource.label}</p>
                    <p className="min-w-0 truncate text-xs text-ink-faint">{resource.note}</p>
                  </div>

                  {roles.map((role) => (
                    <Cell key={role.id} role={role} resource={resource} />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 동작 넷이 각각 무슨 뜻인지. 표를 처음 보는 사람이 `설정 변경` 을 짐작으로 읽지 않게 한다. */
export function PermissionLegend() {
  return (
    <div className="flex flex-col gap-2 border-t border-border bg-surface px-6 py-4">
      {ACTIONS.map((action) => (
        <div key={action} className="flex items-baseline gap-3">
          <span className="w-20 shrink-0">
            <Badge size="sm" tone={action === 'delete' || action === 'manage' ? 'danger' : 'neutral'}>
              {ACTION_LABEL[action]}
            </Badge>
          </span>
          <span className="min-w-0 text-xs leading-relaxed text-ink-muted">{ACTION_NOTE[action]}</span>
        </div>
      ))}
    </div>
  );
}
