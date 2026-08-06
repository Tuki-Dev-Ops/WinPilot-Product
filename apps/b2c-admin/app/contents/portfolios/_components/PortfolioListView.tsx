'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { PORTFOLIOS, type PortfolioRecord } from '@/lib/data/contents';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';

const COLUMNS: Array<ContentColumn<PortfolioRecord>> = [
  {
    id: 'title',
    label: '제목',
    // 4 + 2 + 2 + 1 = 9 — CONTENT_COLUMN_BUDGET 을 넘으면 관리 열이 다음 줄로 밀린다.
    span: 4,
    render: (portfolio) => (
      <div className="flex min-w-0 items-center gap-3">
        {/* 목록 썸네일 — 업로드된 이미지는 브라우저 메모리에만 있어 목록에서는 자리표시자로 둔다. */}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-3xs text-ink-faint">
          이미지
        </span>
        <div className="min-w-0">
          <p className="block min-w-0 truncate text-sm font-medium">{portfolio.title}</p>
          <p className="font-mono text-xs text-ink-faint">{portfolio.id}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'client',
    label: '고객사',
    span: 2,
    render: (portfolio) => <span className="block min-w-0 truncate text-sm text-ink-muted">{portfolio.client}</span>,
  },
  {
    id: 'period',
    label: '기간',
    span: 2,
    render: (portfolio) => <span className="text-xs tabular-nums text-ink-muted">{portfolio.period}</span>,
  },
  {
    id: 'visible',
    label: '상태',
    span: 1,
    align: 'center',
    render: (portfolio) => (
      <AdminVisibilityBadge visible={portfolio.visible} />
    ),
  },
];

/** 포트폴리오 목록 — 행을 누르면 `/contents/portfolios/{코드}` 상세로 간다. */
export function PortfolioListView() {
  const router = useRouter();
  const toast = useToast();
  const [portfolios, setPortfolios] = useState<PortfolioRecord[]>(PORTFOLIOS);

  return (
    <ContentListView<PortfolioRecord>
      title="포트폴리오"
      description="고객에게 보여 줄 작업 사례를 관리하세요."
      entityLabel="포트폴리오"
      items={portfolios}
      onItemsChange={setPortfolios}
      idOf={(item) => item.id}
      labelOf={(item) => item.title}
      visibleOf={(item) => item.visible}
      searchIn={(item) => `${item.title} ${item.client} ${item.id}`}
      columns={COLUMNS}
      searchId="portfolio-search"
      searchHint="제목, 고객사, 코드로 검색"
      actionLabel="포트폴리오 등록"
      onAction={() => {
        toast.info('포트폴리오 등록 화면으로 이동합니다.');
        router.push('/contents/portfolios/new');
      }}
      onOpen={(item) => router.push(`/contents/portfolios/${item.id}`)}
      filters={[
        {
          id: 'client',
          label: '고객사',
          options: [...new Set(portfolios.map((item) => item.client))].map((client) => ({
            value: client,
            label: client,
          })),
        },
      ]}
      matchesFilters={(item, values) => {
        const client = values.client ?? ALL_VALUE;
        if (client !== ALL_VALUE && item.client !== client) return false;
        return true;
      }}
    />
  );
}
