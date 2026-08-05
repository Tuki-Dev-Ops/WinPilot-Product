'use client';

import { useMemo, useState } from 'react';
import { HintInput, useToast } from '@winpilot/ui';
import {
  InternalField,
  InternalGhostButton,
  InternalPrimaryButton,
  InternalSaveRow,
} from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalSummary } from '@/app/_components/InternalPanel';
import { InternalToolbar } from '@/app/_components/InternalToolbar';
import { CODE_GROUPS, type CodeGroup } from '@/lib/data/settings';

const EMPTY_DRAFT = { name: '', usedBy: '', first: '' };

/**
 * 기준 값.
 *
 * 목록마다 **어느 화면이 읽는지**를 함께 적는다. 값 하나를 고칠 때 무엇이 달라지는지 모르면
 * 아무도 고치지 못하고, 못 고치면 결국 화면마다 새로 적기 시작한다.
 *
 * **잠긴 목록**은 화면이 코드로 들고 있는 것이다. 청구 상태처럼 상태마다 화면이 다르게
 * 그리는 값은 여기서 늘려도 화면이 그리지 못한다 — 늘릴 수 없다는 사실을 잠금으로 보여 주고,
 * 왜 그런지도 한 줄로 적는다. 잠긴 이유를 적지 않으면 버그로 읽힌다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function CodeListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<CodeGroup[]>(CODE_GROUPS);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return groups;
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(keyword) ||
        group.values.some((value) => value.toLowerCase().includes(keyword)) ||
        group.usedBy.some((screen) => screen.toLowerCase().includes(keyword)),
    );
  }, [groups, search]);

  const locked = groups.filter((group) => group.locked);
  const total = groups.reduce((sum, group) => sum + group.values.length, 0);

  const addValue = (group: CodeGroup) => {
    const value = (draft[group.id] ?? '').trim();
    if (!value) {
      toast.error({ message: '더하지 못했습니다.', detail: '값을 입력해 주세요.' });
      return;
    }
    if (group.values.includes(value)) {
      toast.error({ message: '더하지 못했습니다.', detail: `'${value}' 는 이미 있는 값입니다.` });
      return;
    }
    setGroups((previous) =>
      previous.map((item) => (item.id === group.id ? { ...item, values: [...item.values, value] } : item)),
    );
    setDraft((previous) => ({ ...previous, [group.id]: '' }));
    toast.success({ message: `${group.name} 에 값을 더했습니다.`, detail: `${value} · ${group.usedBy.length}개 화면에 반영됩니다.` });
  };

  const createGroup = () => {
    if (!newGroup.name.trim() || !newGroup.first.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '목록 이름과 첫 값을 모두 적어 주세요.' });
      return;
    }
    if (groups.some((group) => group.name === newGroup.name.trim())) {
      toast.error({ message: '등록하지 못했습니다.', detail: `'${newGroup.name.trim()}' 은 이미 있는 목록입니다.` });
      return;
    }

    /*
      새 목록은 잠기지 않은 채로 만든다. 잠금은 **화면이 값마다 다르게 그릴 때**만 붙는 것이라
      여기서 정할 값이 아니다 — 붙이려면 화면을 함께 고쳐야 한다.
    */
    const record: CodeGroup = {
      id: `C-${newGroup.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || groups.length + 1}`,
      name: newGroup.name.trim(),
      usedBy: newGroup.usedBy
        .split(',')
        .map((one) => one.trim())
        .filter(Boolean),
      values: [newGroup.first.trim()],
      locked: false,
      note: '',
    };

    setGroups((previous) => [...previous, record]);
    setNewGroup(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '기준 값 목록을 등록했습니다.', detail: `${record.name} · ${record.values[0]}` });
  };

  const removeValue = (group: CodeGroup, value: string) => {
    setGroups((previous) =>
      previous.map((item) =>
        item.id === group.id ? { ...item, values: item.values.filter((one) => one !== value) } : item,
      ),
    );
    toast.info({ message: `${group.name} 에서 값을 뺐습니다.`, detail: value });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '목록', value: `${groups.length}개` },
          { label: '값', value: `${total}개` },
          {
            label: '잠긴 목록',
            value: `${locked.length}개`,
            hint: '화면이 코드로 들고 있어 여기서 늘릴 수 없습니다.',
          },
        ]}
      />

      <InternalToolbar
        searchId="code-search"
        searchLabel="기준 값 검색"
        searchHint="목록 이름, 값, 쓰는 화면으로 검색"
        search={search}
        onSearch={setSearch}
        action={{ label: '기준 값 목록 등록', onClick: () => setCreating(true) }}
      />

      {visible.length === 0 ? (
        <InternalPanel title="기준 값" description="여러 화면이 함께 쓰는 목록입니다.">
          <InternalEmpty>조건에 맞는 목록이 없습니다.</InternalEmpty>
        </InternalPanel>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((group) => (
            <InternalPanel
              key={group.id}
              title={group.name}
              description={group.note || undefined}
              aside={
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs text-ink-faint">{group.id}</span>
                  {group.locked && (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                      잠김
                    </span>
                  )}
                </div>
              }
            >
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-widest text-ink-faint">값</p>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => (
                      <span
                        key={value}
                        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-strong px-3 py-1.5 text-sm"
                      >
                        {value}
                        {!group.locked && (
                          <button
                            type="button"
                            aria-label={`${group.name} 에서 ${value} 빼기`}
                            onClick={() => removeValue(group, value)}
                            className="shrink-0 text-ink-faint transition-colors duration-150 hover:text-signal-danger"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-widest text-ink-faint">이 목록을 읽는 화면</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.usedBy.map((screen) => (
                      <span
                        key={screen}
                        className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted"
                      >
                        {screen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {group.locked ? (
                <p className="border-t border-border bg-surface px-6 py-4 text-sm leading-relaxed text-ink-muted">
                  화면이 값마다 다르게 그리므로 이 목록은 코드가 들고 있습니다 — 늘리려면 화면을 함께 고쳐야 합니다.
                </p>
              ) : (
                <InternalSaveRow>
                  <label htmlFor={`code-${group.id}-new`} className="sr-only">
                    {group.name} 에 더할 값
                  </label>
                  <input
                    id={`code-${group.id}-new`}
                    type="text"
                    value={draft[group.id] ?? ''}
                    onChange={(event) => setDraft((previous) => ({ ...previous, [group.id]: event.target.value }))}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-border-strong bg-canvas px-3 text-sm text-ink sm:max-w-64 sm:flex-none"
                  />
                  <InternalGhostButton onClick={() => setDraft((previous) => ({ ...previous, [group.id]: '' }))}>
                    지우기
                  </InternalGhostButton>
                  <InternalPrimaryButton type="button" onClick={() => addValue(group)}>
                    더하기
                  </InternalPrimaryButton>
                </InternalSaveRow>
              )}
            </InternalPanel>
          ))}
        </div>
      )}

      <InternalModal
        open={creating}
        title="기준 값 목록 등록"
        description="새 목록은 잠기지 않은 채로 만들어집니다. 잠금은 화면이 값마다 다르게 그릴 때만 붙습니다."
        onClose={() => setCreating(false)}
        onSubmit={createGroup}
        submitLabel="등록"
      >
        <InternalField label="목록 이름" htmlFor="code-new-name">
          <HintInput
            id="code-new-name"
            type="text"
            hint="예: 계약 형태"
            value={newGroup.name}
            onChange={(event) => setNewGroup((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!newGroup.name.trim()}
          />
        </InternalField>

        <InternalField
          label="이 목록을 읽는 화면"
          htmlFor="code-new-usedby"
          hint="쉼표로 나눠 적습니다. 비워 두면 아직 쓰는 화면이 없다는 뜻입니다."
        >
          <HintInput
            id="code-new-usedby"
            type="text"
            hint="예: 고객사 · 고객, 결제 · 예정일"
            value={newGroup.usedBy}
            onChange={(event) => setNewGroup((previous) => ({ ...previous, usedBy: event.target.value }))}
          />
        </InternalField>

        <InternalField label="첫 값" htmlFor="code-new-first" hint="값이 하나도 없는 목록은 화면에서 고를 것이 없습니다.">
          <HintInput
            id="code-new-first"
            type="text"
            hint="예: 연간 계약"
            value={newGroup.first}
            onChange={(event) => setNewGroup((previous) => ({ ...previous, first: event.target.value }))}
            invalid={!newGroup.first.trim()}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
