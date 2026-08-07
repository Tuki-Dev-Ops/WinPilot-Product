'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  ListToolbar,
  RowActions,
  RowIconButton,
  RowSelectCell,
  SelectAllCell,
  useToast,
  type ListFilterField,
  type ListToolbarTab,
} from '@winpilot/ui';
import { ALL_VALUE, RowActionGroup } from '@winpilot/ui';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_REQUESTS,
  nextRequestId,
  openRequests,
  requestsOf,
  type SupportRequest,
} from '@winpilot/store';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { SupportDetailModal } from './SupportDetailModal';
import { SupportFormModal, type SupportFormInput } from './SupportFormModal';
import { SUPPORT_TONE } from './support-tone';

/**
 * 이 콘솔을 쓰는 고객사.
 *
 * 로그인이 붙기 전까지는 시드로 정해 둔다. `@winpilot/store` 의 문의는 고객사 코드를 달고
 * 있고 이 화면은 **자기 것만** 보여야 하는데, 코드가 없으면 필터를 걸 수가 없다 —
 * 다른 고객사의 제목만 보여도 그쪽이 무엇을 만들고 있는지가 드러난다.
 */
const TENANT_ID = 'T-101';
const SENDER = '김서연';
const TODAY = '2026-08-05';

/**
 * 고객 지원 — **우리(스페이스플래닝)에게 보내는 문의**.
 *
 * ## 위쪽 갈래의 `문의` 와 다른 것이다
 * 그쪽은 **고객이 이 고객사에게** 보낸 것이고, 여기는 **이 고객사가 우리에게** 보내는 것이다.
 * 받는 쪽도 답하는 쪽도 달라 메뉴를 갈랐다 — 한 목록에 섞으면 운영자가 자기가 답할 것과
 * 우리가 답할 것을 같은 자리에서 보게 된다.
 *
 * ## 왜 이 화면이 필요한가
 * 설정의 OAuth · PG 는 이 콘솔에서 아예 만질 수 없다(사내 어드민으로 옮겼다). 그러면
 * **막힌 사람이 갈 곳이 화면에 있어야 한다.** 없으면 메일 주소를 찾아 나가게 되고, 그렇게
 * 들어온 문의는 어느 목록에도 쌓이지 않아 언제 답했는지조차 남지 않는다.
 *
 * ## 목록의 원본은 사내 콘솔과 같다
 * `@winpilot/store` 의 `SUPPORT_REQUESTS` 하나다. 여기서 올린 것이 사내 어드민
 * (`/inquiries`)에 그대로 서고, 거기서 쓴 답이 여기 상세 창에 그대로 뜬다.
 *
 * **프론트엔드 전용** — 보낸 문의는 이 화면에만 반영된다.
 */
export function SupportListView() {
  const toast = useToast();
  const [rows, setRows] = useState<SupportRequest[]>(SUPPORT_REQUESTS);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  /** 내 고객사의 것만. 최신순은 `requestsOf` 가 이미 맞춰 준다. */
  const mine = useMemo(() => requestsOf(TENANT_ID, rows), [rows]);

  /*
    탭을 상태 넷으로 그대로 펼치지 않고 **답변 대기**(접수+처리중)로 묶는다. 고객사가 여기서
    묻는 것은 언제나 "답이 왔나 안 왔나" 하나이고, 접수와 처리중은 둘 다 아직 안 온 것이다.
  */
  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: mine.length },
    { id: 'open', label: '답변 대기', count: openRequests(mine).length },
    { id: '답변완료', label: '답변완료', count: mine.filter((one) => one.state === '답변완료').length },
    { id: '보류', label: '보류', count: mine.filter((one) => one.state === '보류').length },
  ];

  const filters: ListFilterField[] = [
    { id: 'category', label: '분류', options: SUPPORT_CATEGORIES.map((one) => ({ value: one, label: one })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const category = filterValues.category ?? ALL_VALUE;
    return mine.filter((request) => {
      if (tab === 'open' && request.state !== '접수' && request.state !== '처리중') return false;
      if (tab !== 'all' && tab !== 'open' && request.state !== tab) return false;
      if (category !== ALL_VALUE && request.category !== category) return false;
      if (!keyword) return true;
      return (
        request.title.toLowerCase().includes(keyword) ||
        request.body.toLowerCase().includes(keyword) ||
        request.id.toLowerCase().includes(keyword)
      );
    });
  }, [mine, search, tab, filterValues]);

  /*
    고른 줄. **일괄로 할 일이 아직 없어 선택 줄(일괄 작업 막대)은 그리지 않는다** — 보낸 문의는
    지우지 못하기 때문이다. 그래도 칸은 둔다: 표마다 맨 왼쪽이 같은 자리여야 눈이 헤매지 않는다.
  */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((one) => one.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const opening = mine.find((request) => request.id === openId) ?? null;
  const waiting = openRequests(mine);

  const send = (input: SupportFormInput) => {
    /*
      올린 문의는 언제나 **접수**로 시작한다. 담당은 비워 둔다 — 누가 맡을지는 우리 쪽에서
      정하는 일이고, 여기서 정해 보내면 그 사람이 없을 때 아무도 못 받은 채로 남는다.
    */
    const request: SupportRequest = {
      id: nextRequestId(rows),
      tenantId: TENANT_ID,
      category: input.category,
      title: input.title,
      body: input.body,
      sender: SENDER,
      receivedAt: TODAY,
      state: '접수',
      assignee: '',
      answer: '',
      urgent: input.urgent,
    };

    setRows((previous) => [...previous, request]);
    setWriting(false);
    toast.success({
      message: '문의를 보냈습니다.',
      detail: `${request.id} · ${request.category}${request.urgent ? ' · 급함' : ''}`,
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-160 text-sm leading-relaxed text-ink-muted">
          스페이스플래닝 담당자에게 보내는 문의입니다. 결제·로그인 연동처럼 이 콘솔에서 직접 바꿀 수
          없는 값은 여기로 알려 주세요.
        </p>
      </div>

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="support-search"
        searchLabel="문의 검색"
        searchHint="제목, 내용, 문의 번호로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="문의하기"
        onAction={() => setWriting(true)}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <section
        data-ssot-cid="b2c-admin/support.list#AdminSupportListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden items-center gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12">
          <SelectAllCell
            checked={allChecked}
            indeterminate={selectedVisible.length > 0}
            onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
          />
          <span className="lg:col-span-1">번호</span>
          <span className="lg:col-span-5">제목</span>
          <span className="lg:col-span-1 lg:text-center">분류</span>
          <span className="lg:col-span-2">보낸 날</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
          <span className="lg:col-span-1 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">
            {mine.length === 0 ? '아직 보낸 문의가 없습니다.' : '조건에 맞는 문의가 없습니다.'}
          </p>
        ) : (
          <div className="flex flex-col">
            {visible.map((request, index) => (
              <div
                key={request.id}
                role="button"
                tabIndex={0}
                onClick={() => setOpenId(request.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setOpenId(request.id);
                  }
                }}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(request.id)}
                  onChange={(checked) =>
                    setSelectedIds((previous) =>
                      checked ? [...previous, request.id] : previous.filter((one) => one !== request.id),
                    )
                  }
                  label={`${request.title} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-1">
                  <p className="min-w-0 truncate font-mono text-xs text-ink-muted">{request.id}</p>
                </div>

                <div className="min-w-0 lg:col-span-5">
                  <p className="min-w-0 truncate text-sm font-medium">
                    {/* 급한 문의는 목록에서 먼저 눈에 들어와야 한다 — 답이 늦은 것을 찾는 자리다. */}
                    {request.urgent && (
                      <span className="mr-1.5 shrink-0 whitespace-nowrap rounded-full bg-signal-danger/12 px-2 py-0.5 text-3xs font-medium text-signal-danger">
                        급함
                      </span>
                    )}
                    {request.title}
                  </p>
                  <p className="min-w-0 truncate text-xs text-ink-faint">
                    {request.answer ? request.answer : '아직 답변 전입니다.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">분류</span>
                  <span className="min-w-0 truncate text-xs text-ink-muted">{request.category}</span>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">보낸 날</span>
                  <span className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
                    {request.receivedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <Badge tone={SUPPORT_TONE[request.state]}>{request.state}</Badge>
                </div>

                <div className="lg:col-span-1">
                  <RowActionGroup
                    label={`${request.title} 상세`}
                    onView={() => setOpenId(request.id)}
                    onEdit={() => setOpenId(request.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      {waiting.length > 0 && (
        <p className="text-sm leading-relaxed text-ink-muted">
          답변을 기다리는 문의가 <span className="font-medium text-ink">{waiting.length}</span>건 있습니다. 급한
          장애는 문의를 올린 뒤 담당자에게 전화로도 알려 주세요.
        </p>
      )}

      <SupportFormModal open={writing} onClose={() => setWriting(false)} onSubmit={send} />

      <SupportDetailModal open={opening !== null} request={opening} onClose={() => setOpenId(null)} />
    </>
  );
}
