'use client';

import { useMemo, useState } from 'react';
import { Dropdown } from '@winpilot/ui';
import {
  InternalEmpty,
  InternalPanel,
  InternalSummary,
  InternalTableFoot,
  InternalTableHead,
} from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  INQUIRIES,
  INQUIRY_CATEGORIES,
  INQUIRY_STATES,
  INQUIRY_TONE,
  openInquiries,
  type InquiryRecord,
} from '@/lib/data/inquiries';
import { TENANTS, findTenant } from '@/lib/data/tenants';

const COLUMNS = [
  { label: '고객사 · 보낸 사람', span: 'lg:col-span-3' },
  { label: '문의', span: 'lg:col-span-5' },
  { label: '접수일', span: 'lg:col-span-2' },
  { label: '담당', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 고객사 문의 목록.
 *
 * 목록을 여는 순서가 곧 손대는 순서다 — **급한 것이 위**로 오고, 그다음이 오래된 것이다.
 * 접수일 최신순으로만 두면 어제 들어온 장애가 지난주 기능 요청 아래에 깔린다.
 *
 * 답변을 목록 안에서 펼쳐 읽는다. 화면을 따로 두면 답을 쓰는 동안 목록을 잃고, 돌아왔을 때
 * 어디까지 봤는지 다시 찾아야 한다.
 */
export function InquiryListView() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('all');
  const [tenantId, setTenantId] = useState('all');
  const [opened, setOpened] = useState<string | null>(null);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return INQUIRIES.filter((inquiry) => {
      if (state !== 'all' && inquiry.state !== state) return false;
      if (tenantId !== 'all' && inquiry.tenantId !== tenantId) return false;
      if (!keyword) return true;
      return (
        inquiry.title.toLowerCase().includes(keyword) ||
        inquiry.body.toLowerCase().includes(keyword) ||
        inquiry.sender.toLowerCase().includes(keyword) ||
        inquiry.id.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => {
      // 급한 것이 먼저. 같으면 오래된 것이 먼저 — 오래 기다린 쪽이 더 급하다.
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return a.receivedAt.localeCompare(b.receivedAt);
    });
  }, [search, state, tenantId]);

  const open = openInquiries(visible);
  const urgent = open.filter((inquiry) => inquiry.urgent);

  return (
    <>
      <InternalSummary
        cards={[
          { label: '전체', value: `${visible.length}건` },
          {
            label: '답하지 않음',
            value: `${open.length}건`,
            tone: open.length > 0 ? 'text-brand-700 dark:text-brand-300' : '',
          },
          {
            label: '급함',
            value: `${urgent.length}건`,
            tone: urgent.length > 0 ? 'text-signal-danger' : '',
            hint: '장애처럼 시간이 곧 손해인 문의입니다.',
          },
        ]}
      />

      {/*
        등록 단추를 두지 않는다. 문의는 **고객사가 보내는 것**이라 우리가 만들 자리가 아니다 —
        누를 수 없는 단추를 그려 두면 왜 안 되는지를 찾게 된다.
      */}
      <InternalToolbar
        searchId="inquiry-search"
        searchLabel="문의 검색"
        searchHint="제목, 내용, 보낸 사람, 번호로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="처리 상태" options={INQUIRY_STATES} value={state} onChange={setState} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-ink-faint">고객사</span>
          <Dropdown
            id="inquiry-tenant"
            label="고객사 전체"
            options={[
              { value: 'all', label: '전체' },
              ...TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id })),
            ]}
            value={tenantId}
            onChange={setTenantId}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-ink-faint">분류</span>
          {/*
            분류는 기준 값(설정 · 기준 값)의 `문의 분류` 목록과 같다. 여기서 새로 적지 않는다 —
            적어 두면 기준 값을 고쳤을 때 이 화면만 옛 목록으로 남는다.
          */}
          <p className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg bg-surface px-3 py-2">
            {INQUIRY_CATEGORIES.map((category) => (
              <span key={category} className="shrink-0 whitespace-nowrap text-xs text-ink-muted">
                {category}
              </span>
            ))}
          </p>
        </div>
      </div>

      <InternalPanel
        title="문의 목록"
        description="고객사가 우리에게 보낸 문의입니다. 상태 이름은 B2C Admin 의 문의와 글자까지 같습니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 문의가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((inquiry: InquiryRecord) => {
              const isOpen = opened === inquiry.id;
              return (
                <div key={inquiry.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpened(isOpen ? null : inquiry.id)}
                    className="grid w-full grid-cols-1 gap-x-4 gap-y-2 px-5 py-4 text-left transition-colors duration-100 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                  >
                    <div className="min-w-0 lg:col-span-3">
                      <p className="truncate text-sm font-medium">
                        {findTenant(inquiry.tenantId)?.name ?? inquiry.tenantId}
                      </p>
                      <p className="truncate font-mono text-xs text-ink-faint">
                        {inquiry.id} · {inquiry.sender}
                      </p>
                    </div>

                    <div className="min-w-0 lg:col-span-5">
                      <p className="truncate text-sm">
                        {inquiry.urgent && (
                          <span className="mr-1.5 shrink-0 whitespace-nowrap rounded-full bg-signal-danger/12 px-2 py-0.5 text-[10px] font-medium text-signal-danger">
                            급함
                          </span>
                        )}
                        {inquiry.title}
                      </p>
                      <p className="truncate text-xs text-ink-faint">{inquiry.category}</p>
                    </div>

                    <div className="flex items-baseline gap-2 lg:col-span-2">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">접수일</span>
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{inquiry.receivedAt}</span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">담당</span>
                      <span className={`text-xs ${inquiry.assignee ? 'text-ink-muted' : 'text-ink-faint'}`}>
                        {inquiry.assignee || '없음'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${INQUIRY_TONE[inquiry.state]}`}
                      >
                        {inquiry.state}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-4 border-t border-border bg-surface px-5 py-5">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-widest text-ink-faint">문의 내용</p>
                        <p className="text-sm leading-relaxed">{inquiry.body}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-widest text-ink-faint">답변</p>
                        {/* 답이 없을 때 자리를 비우지 않는다 — 빈 자리는 답을 못 찾은 것으로도 읽힌다. */}
                        <p className={`text-sm leading-relaxed ${inquiry.answer ? '' : 'text-ink-faint'}`}>
                          {inquiry.answer || '아직 답하지 않았습니다.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p>
            답하지 않음 <span className="font-medium tabular-nums text-ink">{open.length}</span>건
          </p>
        </InternalTableFoot>
      </InternalPanel>
    </>
  );
}
