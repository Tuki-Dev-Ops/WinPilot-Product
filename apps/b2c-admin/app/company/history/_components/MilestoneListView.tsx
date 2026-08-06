'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { milestoneDate, MILESTONES, nextMilestoneId, sortMilestones, type MilestoneRecord } from '@/lib/data/company';
import type { MilestoneFormInput } from '@/lib/validation/company-record';
import { MilestoneFormModal, type MilestoneFormMode } from './MilestoneFormModal';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';

const COLUMNS: Array<ContentColumn<MilestoneRecord>> = [
  {
    id: 'date',
    label: '시점',
    // 2 + 5 + 2 = 9 — CONTENT_COLUMN_BUDGET 을 넘으면 관리 열이 다음 줄로 밀린다.
    span: 2,
    render: (item) => (
      <span className="font-mono text-sm tabular-nums text-ink-muted">{milestoneDate(item)}</span>
    ),
  },
  {
    id: 'title',
    label: '내용',
    span: 5,
    render: (item) => (
      <div className="min-w-0">
        <p className="min-w-0 truncate text-sm font-medium">{item.title}</p>
        {item.description && <p className="min-w-0 truncate text-xs text-ink-faint">{item.description}</p>}
      </div>
    ),
  },
  {
    id: 'visible',
    label: '상태',
    span: 2,
    align: 'center',
    render: (item) => (
      <AdminVisibilityBadge visible={item.visible} />
    ),
  },
];

type FormTarget = { mode: MilestoneFormMode; record: MilestoneRecord | null };

/**
 * 연혁 목록.
 *
 * 연혁은 한 줄이 짧아 상세 화면을 따로 두지 않고 **모달에서 바로 고친다**.
 * 목록은 항상 최근 순으로 보여준다 — 연혁을 옛날 것부터 읽는 사람은 없다.
 */
export function MilestoneListView() {
  const toast = useToast();
  const [milestones, setMilestones] = useState<MilestoneRecord[]>(MILESTONES);
  const [form, setForm] = useState<FormTarget | null>(null);

  const ordered = useMemo(() => sortMilestones(milestones), [milestones]);
  const years = useMemo(() => [...new Set(milestones.map((item) => item.year))].sort().reverse(), [milestones]);

  const submit = (input: MilestoneFormInput) => {
    if (!form) return;
    const next = {
      year: input.year.trim(),
      month: input.month.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      visible: input.visible,
    };

    if (form.mode === 'create') {
      const id = nextMilestoneId(milestones);
      setMilestones((previous) => [...previous, { id, ...next }]);
      toast.success({ message: '연혁을 추가했습니다.', detail: `${milestoneDate(next)} · ${next.title}` });
    } else if (form.record) {
      const targetId = form.record.id;
      setMilestones((previous) => previous.map((item) => (item.id === targetId ? { ...item, ...next } : item)));
      toast.success({ message: '연혁을 저장했습니다.', detail: `${milestoneDate(next)} · ${next.title}` });
    }
    setForm(null);
  };

  return (
    <>
      <ContentListView<MilestoneRecord>
      title="연혁"
      description="회사 소개에 나가는 연혁을 관리하세요."
        entityLabel="연혁"
        items={ordered}
        onItemsChange={setMilestones}
        idOf={(item) => item.id}
        labelOf={(item) => `${milestoneDate(item)} ${item.title}`}
        visibleOf={(item) => item.visible}
        searchIn={(item) => `${item.year} ${item.month} ${item.title} ${item.description}`}
        columns={COLUMNS}
        searchId="milestone-search"
        searchHint="연도, 내용으로 검색"
        actionLabel="연혁 추가"
        onAction={() => setForm({ mode: 'create', record: null })}
        onOpen={(item) => setForm({ mode: 'edit', record: item })}
        filters={[
          {
            id: 'year',
            label: '연도',
            options: years.map((year) => ({ value: year, label: `${year}년` })),
          },
        ]}
        matchesFilters={(item, values) => {
          const year = values.year ?? ALL_VALUE;
          if (year !== ALL_VALUE && item.year !== year) return false;
          return true;
        }}
      />

      <MilestoneFormModal
        open={form !== null}
        mode={form?.mode ?? 'create'}
        {...(form?.record
          ? {
              initial: {
                year: form.record.year,
                month: form.record.month,
                title: form.record.title,
                description: form.record.description,
                visible: form.record.visible,
              },
            }
          : {})}
        onClose={() => setForm(null)}
        onSubmit={submit}
      />
    </>
  );
}
