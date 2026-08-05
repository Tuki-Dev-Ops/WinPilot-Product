'use client';

import { useMemo, useState } from 'react';
import { Dropdown, HintInput, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalSummary } from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  ACTIVITIES,
  ACTIVITY_KINDS,
  ACTIVITY_TONE,
  openNextSteps,
  type ActivityKind,
  type ActivityRecord,
} from '@/lib/data/activities';
import { STAFF } from '@/lib/data/settings';
import { TENANTS, findTenant, todayStamp } from '@/lib/data/tenants';

const EMPTY_DRAFT = {
  kind: ACTIVITY_KINDS[0] as ActivityKind,
  tenantId: TENANTS[0]?.id ?? '',
  staff: STAFF[0]?.name ?? '',
  counterpart: '',
  summary: '',
  nextStep: '',
};

/**
 * 활동 타임라인.
 *
 * 표가 아니라 **최신순 타임라인**으로 그린다. 한 줄에 들어가는 값 중 가장 중요한 것이
 * `무엇을 했는가` 인데 그것이 문장이라, 표의 한 칸에 넣으면 잘리거나 열이 무너진다.
 *
 * `다음에 하기로 한 것`을 따로 세는 이유: 적어 놓고 하지 않으면 적은 뜻이 없다. 몇 건이
 * 남아 있는지가 목록을 여는 첫 물음이다.
 *
 * **프론트엔드 전용** — 기록은 이 화면에만 반영된다.
 */
export function ActivityListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [tenantId, setTenantId] = useState('all');
  const [rows, setRows] = useState<ActivityRecord[]>(ACTIVITIES);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows
      .filter((activity) => {
        if (kind !== 'all' && activity.kind !== kind) return false;
        if (tenantId !== 'all' && activity.tenantId !== tenantId) return false;
        if (!keyword) return true;
        return (
          activity.target.toLowerCase().includes(keyword) ||
          activity.summary.toLowerCase().includes(keyword) ||
          activity.staff.toLowerCase().includes(keyword) ||
          activity.counterpart.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [rows, search, kind, tenantId]);

  const pending = openNextSteps(visible);

  const create = () => {
    if (!draft.summary.trim() || !draft.counterpart.trim()) {
      toast.error({ message: '기록하지 못했습니다.', detail: '무엇을 했는지와 상대는 반드시 적어야 합니다.' });
      return;
    }

    const tenant = findTenant(draft.tenantId);
    const record: ActivityRecord = {
      id: `AC-${5013 + rows.length}`,
      kind: draft.kind,
      tenantId: draft.tenantId,
      target: tenant?.name ?? draft.tenantId,
      // 시각은 서버에서 정한 기준일을 쓴다 — 분 단위까지는 사람이 적는 값이 아니다.
      at: `${todayStamp()} 00:00`,
      staff: draft.staff,
      counterpart: draft.counterpart.trim(),
      summary: draft.summary.trim(),
      nextStep: draft.nextStep.trim(),
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '활동을 기록했습니다.', detail: `${record.target} · ${record.kind}` });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '활동', value: `${visible.length}건` },
          {
            label: '다음에 할 것',
            value: `${pending.length}건`,
            tone: pending.length > 0 ? 'text-brand-700 dark:text-brand-300' : '',
            hint: '적어 놓고 하지 않으면 적은 뜻이 없습니다.',
          },
          {
            label: '기록이 없는 고객사',
            value: `${TENANTS.filter((tenant) => !rows.some((row) => row.tenantId === tenant.id)).length}곳`,
            hint: '한 번도 접점이 남지 않은 곳입니다.',
          },
        ]}
      />

      <InternalToolbar
        searchId="activity-search"
        searchLabel="활동 검색"
        searchHint="상대, 내용, 담당으로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="활동 종류" options={ACTIVITY_KINDS} value={kind} onChange={setKind} />}
        action={{ label: '활동 기록', onClick: () => setCreating(true) }}
      />

      <div className="flex min-w-0 flex-col gap-2 sm:max-w-80">
        <span className="text-xs text-ink-faint">고객사</span>
        <Dropdown
          id="activity-tenant"
          label="고객사 전체"
          options={[
            { value: 'all', label: '전체' },
            ...TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id })),
          ]}
          value={tenantId}
          onChange={setTenantId}
        />
      </div>

      <InternalPanel
        title="활동 기록"
        description="최신순입니다. 아직 고객사가 아닌 파이프라인 건의 활동도 함께 쌓입니다."
      >
        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 활동이 없습니다.</InternalEmpty>
        ) : (
          <ol className="flex flex-col">
            {visible.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-2 border-b border-border px-6 py-5 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ACTIVITY_TONE[activity.kind]}`}
                  >
                    {activity.kind}
                  </span>
                  {activity.tenantId ? (
                    <a
                      href={`/tenants/${activity.tenantId}`}
                      className="truncate text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
                    >
                      {activity.target}
                    </a>
                  ) : (
                    <span className="truncate text-sm font-medium">{activity.target}</span>
                  )}
                  {/* 아직 고객사가 아닌 건임을 밝힌다 — 링크가 없는 이유가 화면에 있어야 한다. */}
                  {!activity.tenantId && (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-faint">
                      파이프라인
                    </span>
                  )}
                  <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                    {activity.at}
                  </span>
                </div>

                <p className="text-sm leading-relaxed">{activity.summary}</p>

                <p className="font-mono text-xs text-ink-faint">
                  {activity.staff} → {activity.counterpart}
                </p>

                {/* 다음에 할 것이 없으면 줄 자체를 그리지 않는다 — 빈 줄은 정하지 않은 것과 구분되지 않는다. */}
                {activity.nextStep && (
                  <p className="rounded-lg bg-surface px-4 py-2 text-sm leading-relaxed text-ink-muted">
                    다음: {activity.nextStep}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </InternalPanel>

      <InternalModal
        open={creating}
        title="활동 기록"
        description="무엇을 했는지와 상대만 있으면 남길 수 있습니다. 다음에 할 것은 정해졌을 때만 적습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="기록"
      >
        <InternalField label="종류">
          <Dropdown
            id="activity-new-kind"
            label="종류 선택"
            options={ACTIVITY_KINDS.map((item) => ({ value: item, label: item }))}
            value={draft.kind}
            onChange={(next) => setDraft((previous) => ({ ...previous, kind: next as ActivityKind }))}
          />
        </InternalField>

        <InternalField label="고객사">
          <Dropdown
            id="activity-new-tenant"
            label="고객사 선택"
            options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id }))}
            value={draft.tenantId}
            onChange={(next) => setDraft((previous) => ({ ...previous, tenantId: next }))}
          />
        </InternalField>

        <InternalField label="우리 쪽 사람">
          <Dropdown
            id="activity-new-staff"
            label="담당 선택"
            options={STAFF.map((staff) => ({ value: staff.name, label: staff.name, hint: staff.team }))}
            value={draft.staff}
            onChange={(next) => setDraft((previous) => ({ ...previous, staff: next }))}
          />
        </InternalField>

        <InternalField label="상대" htmlFor="activity-new-counterpart" hint="고객사 담당자 목록의 이름과 같게 적습니다.">
          <HintInput
            id="activity-new-counterpart"
            type="text"
            hint="예: 김서연"
            value={draft.counterpart}
            onChange={(event) => setDraft((previous) => ({ ...previous, counterpart: event.target.value }))}
            invalid={!draft.counterpart.trim()}
          />
        </InternalField>

        <InternalField label="무엇을 했나" htmlFor="activity-new-summary">
          <HintInput
            id="activity-new-summary"
            type="text"
            hint="한 문장으로"
            value={draft.summary}
            onChange={(event) => setDraft((previous) => ({ ...previous, summary: event.target.value }))}
            invalid={!draft.summary.trim()}
          />
        </InternalField>

        <InternalField label="다음에 할 것" htmlFor="activity-new-next" hint="정해진 것이 없으면 비웁니다.">
          <HintInput
            id="activity-new-next"
            type="text"
            hint="예: 견적서를 다시 보낸다"
            value={draft.nextStep}
            onChange={(event) => setDraft((previous) => ({ ...previous, nextStep: event.target.value }))}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
