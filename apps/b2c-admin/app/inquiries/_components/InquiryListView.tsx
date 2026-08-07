'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { ALL_VALUE, Badge, Checkbox, ListToolbar, PageHeading, RowActions, RowIconButton, RowSelectCell, RowTextButton, useToast, type ListFilterField } from '@winpilot/ui';
import { INQUIRIES, INQUIRY_CATEGORIES, INQUIRY_PATHS, INQUIRY_STATE_TONE, pathLabel, type InquiryRecord, type InquiryState } from '@/lib/data/inquiries';
import { InquiryDetailModal, type InquiryAnswerInput } from './InquiryDetailModal';

const TAB_STATE: Record<string, InquiryState | null> = {
  all: null,
  received: '접수',
  working: '처리중',
  done: '답변완료',
  hold: '보류',
};
const TAB_LABEL: Record<string, string> = {
  all: '전체',
  received: '접수',
  working: '처리중',
  done: '답변완료',
  hold: '보류',
};



function stamp(): string {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * 문의 목록.
 *
 * **Path 열이 이 화면의 핵심**이다. 고객 화면의 문의 폼은 한 곳이 아니라 회사 소개·상품 상세·
 * 포트폴리오마다 놓이고, 어디서 온 문의인지에 따라 답변의 맥락이 달라진다.
 *
 * **프론트엔드 전용** — 답변은 이 화면의 로컬 상태에만 반영된다.
 */
export function InquiryListView() {
  const toast = useToast();
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(INQUIRIES);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const detail = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === detailId) ?? null,
    [inquiries, detailId],
  );

  const filterFields = useMemo<ListFilterField[]>(
    () => [
      {
        id: 'path',
        label: '접수 경로',
        options: INQUIRY_PATHS.map((item) => ({ value: item.path, label: `${item.label} (${item.path})` })),
      },
      {
        id: 'category',
        label: '문의 유형',
        options: INQUIRY_CATEGORIES.map((category) => ({ value: category, label: category })),
      },
      {
        id: 'answered',
        label: '답변 여부',
        options: [
          { value: 'yes', label: '답변함' },
          { value: 'no', label: '미답변' },
        ],
      },
    ],
    [],
  );

  const matchesFilters = (inquiry: InquiryRecord) => {
    const path = filters.path ?? ALL_VALUE;
    if (path !== ALL_VALUE && inquiry.path !== path) return false;

    const category = filters.category ?? ALL_VALUE;
    if (category !== ALL_VALUE && inquiry.category !== category) return false;

    const answered = filters.answered ?? ALL_VALUE;
    if (answered !== ALL_VALUE && Boolean(inquiry.answer.trim()) !== (answered === 'yes')) return false;

    return true;
  };

  const tabs = useMemo(
    () =>
      Object.keys(TAB_STATE).map((id) => {
        const state = TAB_STATE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: state ? inquiries.filter((inquiry) => inquiry.state === state).length : inquiries.length,
        };
      }),
    [inquiries],
  );

  const visible = useMemo(() => {
    const state = TAB_STATE[activeTabId];
    const keyword = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if (state && inquiry.state !== state) return false;
      if (!matchesFilters(inquiry)) return false;
      if (!keyword) return true;
      return (
        inquiry.title.toLowerCase().includes(keyword) ||
        inquiry.message.toLowerCase().includes(keyword) ||
        inquiry.name.toLowerCase().includes(keyword) ||
        inquiry.email.toLowerCase().includes(keyword) ||
        inquiry.path.toLowerCase().includes(keyword) ||
        inquiry.id.toLowerCase().includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiries, activeTabId, search, filters]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 항목이 함께 지워지면 안 된다.
  const visibleIds = visible.map((inquiry) => inquiry.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

  const saveAnswer = (input: InquiryAnswerInput) => {
    if (!detail) return;
    const targetId = detail.id;
    const answered = input.state === '답변완료';

    setInquiries((previous) =>
      previous.map((inquiry) =>
        inquiry.id === targetId
          ? {
              ...inquiry,
              answer: input.answer,
              state: input.state,
              answeredAt: answered ? stamp() : inquiry.answeredAt,
              answeredBy: answered ? '한지원' : inquiry.answeredBy,
            }
          : inquiry,
      ),
    );
    setDetailId(null);
    toast.success({
      message: answered ? '답변을 등록했습니다.' : '문의를 저장했습니다.',
      detail: `${targetId} · ${input.state}`,
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targets = new Set(pendingDelete);
    const titles = inquiries.filter((inquiry) => targets.has(inquiry.id)).map((inquiry) => inquiry.title);
    setInquiries((previous) => previous.filter((inquiry) => !targets.has(inquiry.id)));
    setSelectedIds((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `문의 ${targets.size}건을 삭제했습니다.`,
      detail: titles.length > 2 ? `${titles.slice(0, 2).join(', ')} 외 ${titles.length - 2}건` : titles.join(', '),
    });
  };

  return (
    <>
      <PageHeading title="목록" description="답변이 필요한 문의를 먼저 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="inquiry-search"
        searchLabel="문의 검색"
        searchHint="제목, 내용, 이름, 이메일, 경로로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="미답변만 보기"
        onAction={() => {
          setFilters((previous) => ({ ...previous, answered: 'no' }));
          setActiveTabId('all');
          toast.info('미답변 문의만 보여줍니다.');
        }}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={(id, value) => setFilters((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilters({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      <AdminBulkBar
        count={selectedVisible.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setPendingDelete(selectedVisible)}
      />

      <section
        data-ssot-cid="b2c-admin/inquiry.list#AdminInquiryListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="flex items-center gap-3 lg:col-span-1">
            <Checkbox
              checked={allChecked}
              indeterminate={selectedVisible.length > 0}
              onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
              label="전체 선택"
            />
            <span className="w-6 text-center">순번</span>
          </span>
          <span className="lg:col-span-2">Path</span>
          <span className="lg:col-span-4">제목 · 문의자</span>
          <span className="lg:col-span-1">유형</span>
          <span className="lg:col-span-1">접수일</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
          <span className="lg:col-span-2 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 문의가 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((inquiry, index) => (
              <div
                key={inquiry.id}
                onClick={() => setDetailId(inquiry.id)}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(inquiry.id)}
                  onChange={(checked) =>
                    setSelectedIds((previous) =>
                      checked ? [...previous, inquiry.id] : previous.filter((id) => id !== inquiry.id),
                    )
                  }
                  label={`${inquiry.title} 선택`}
                  index={index}
                />

                {/* Path — 어느 화면의 문의 폼에서 왔는지. 경로만으로는 뜻이 안 잡혀 이름을 함께 둔다. */}
                <div className="min-w-0 lg:col-span-2">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">Path</span>
                  <p className="min-w-0 truncate text-sm">{pathLabel(inquiry.path)}</p>
                  <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{inquiry.path}</p>
                </div>

                <div className="min-w-0 lg:col-span-4">
                  <p className="min-w-0 truncate text-sm font-medium">
                    {inquiry.title}
                    {!inquiry.answer.trim() && (
                      <span className="ml-1.5 text-xs font-normal text-signal-danger">미답변</span>
                    )}
                  </p>
                  <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                    {inquiry.id} · {inquiry.name} · {inquiry.email}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">유형</span>
                  <span className="min-w-0 truncate text-sm text-ink-muted">{inquiry.category}</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">접수일</span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">
                    {inquiry.createdAt.slice(0, 10)}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <Badge tone={INQUIRY_STATE_TONE[inquiry.state]}>
                    {inquiry.state}
                  </Badge>
                </div>

                <div className="lg:col-span-2">
                  <RowActions>
                    {/*
                      답변은 글자로 남긴다. 말풍선이든 화살표든 그림 하나로 옮기면 댓글·전달로도
                      읽혀서, 아이콘을 읽는 데 드는 시간이 글자를 읽는 시간보다 길어진다.
                    */}
                    <RowTextButton onClick={() => setDetailId(inquiry.id)}>답변</RowTextButton>
                    <RowIconButton
                      icon="delete"
                      tone="danger"
                      label={`${inquiry.title} 삭제`}
                      onClick={() => setPendingDelete([inquiry.id])}
                    />
                  </RowActions>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      <InquiryDetailModal
        open={detail !== null}
        inquiry={detail}
        onClose={() => setDetailId(null)}
        onSubmit={saveAnswer}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="문의 삭제"
        description={
          pendingDelete && pendingDelete.length > 1
            ? `선택한 문의 ${pendingDelete.length}건을 삭제합니다. 되돌릴 수 없습니다.`
            : '이 문의를 삭제합니다. 되돌릴 수 없습니다.'
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
