'use client';

import { useMemo, useState } from 'react';
import {
  InternalEmpty,
  InternalPanel,
  InternalSummary,
  InternalTableFoot,
  InternalTableHead,
} from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import { CHURNED, CHURN_REASONS, CHURN_TONE, monthsKept, type ChurnRecord } from '@/lib/data/churn';
import { formatAmount } from '@/lib/data/invoices';

const COLUMNS = [
  { label: '고객사 · 담당자', span: 'lg:col-span-3' },
  { label: '플랜', span: 'lg:col-span-1 lg:text-center' },
  { label: '계약 기간', span: 'lg:col-span-3' },
  { label: '사유', span: 'lg:col-span-2' },
  { label: '누적 매출', span: 'lg:col-span-2 lg:text-right' },
  { label: '재계약', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 이탈한 고객사 목록.
 *
 * 맨 위에 두는 것이 **재계약 가능**인 이유: 이 목록을 여는 사람은 대개 "다시 걸어 볼 곳이
 * 있나" 를 묻는다. 사유별 건수를 함께 보여 주는 것은 그다음 물음(무엇을 고쳐야 덜 떠나나)에
 * 답하기 위해서다.
 */
export function ChurnListView() {
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('all');

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return CHURNED.filter((record) => {
      if (reason !== 'all' && record.reason !== reason) return false;
      if (!keyword) return true;
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.manager.toLowerCase().includes(keyword) ||
        record.id.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => b.churnedAt.localeCompare(a.churnedAt));
  }, [search, reason]);

  const winBack = visible.filter((record) => record.winBack);
  const lifetime = visible.reduce((sum, record) => sum + record.lifetimeAmount, 0);

  return (
    <>
      <InternalSummary
        cards={[
          { label: '이탈 고객사', value: `${visible.length}곳` },
          {
            label: '재계약 가능',
            value: `${winBack.length}곳`,
            tone: winBack.length > 0 ? 'text-signal-ok' : '',
            hint: '다시 걸어 볼 곳입니다.',
          },
          { label: '누적 매출', value: `${formatAmount(lifetime)}원`, hint: '계약 기간 동안 받은 금액입니다.' },
        ]}
      />

      {/*
        등록 단추를 두지 않는다. 이탈은 운영자가 만드는 것이 아니라 **계약이 끝나서 생기는
        결과**다 — 누를 수 없는 단추를 그려 두면 왜 안 되는지를 찾게 된다.
      */}
      <InternalToolbar
        searchId="churn-search"
        searchLabel="이탈 고객사 검색"
        searchHint="고객사명, 담당자, 코드로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="이탈 사유" options={CHURN_REASONS} value={reason} onChange={setReason} />}
      />

      <InternalPanel
        title="이탈 목록"
        description="계약이 끝난 고객사입니다. 지우지 않는 이유는 왜 떠났는지가 다음 계약에서 쓰이기 때문입니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 이탈 고객사가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((record: ChurnRecord) => (
              <div
                key={record.id}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <div className="min-w-0 lg:col-span-3">
                  <p className="truncate text-sm font-medium">{record.name}</p>
                  <p className="truncate font-mono text-xs text-ink-faint">
                    {record.id} · {record.manager}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">플랜</span>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                    {record.plan}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">계약 기간</span>
                  <span className="min-w-0 font-mono text-xs tabular-nums text-ink-muted">
                    {record.contractedAt} ~ {record.churnedAt}
                    <span className="ml-1.5 text-ink-faint">{monthsKept(record)}개월</span>
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">사유</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${CHURN_TONE[record.reason]}`}
                  >
                    {record.reason}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">누적 매출</span>
                  <span className="text-sm tabular-nums">{formatAmount(record.lifetimeAmount)}원</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">재계약</span>
                  {/* 색만으로 알리지 않는다 — 가능·어려움을 글자로도 적는다. */}
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                      record.winBack ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
                    }`}
                  >
                    {record.winBack ? '가능' : '어려움'}
                  </span>
                </div>

                {record.memo && (
                  <p className="min-w-0 text-xs leading-relaxed text-ink-muted lg:col-span-12 lg:pt-1">
                    {record.memo}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>곳
          </p>
          <p>
            누적 매출 <span className="font-medium tabular-nums text-ink">{formatAmount(lifetime)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>
    </>
  );
}
