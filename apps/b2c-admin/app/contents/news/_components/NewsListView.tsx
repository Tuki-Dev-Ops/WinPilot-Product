'use client';

import { Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { NEWS, type NewsRecord } from '@/lib/data/contents';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';

function LinkIcon() {
  return (
    <Link aria-hidden className="size-3" strokeWidth={1.5} />
  );
}

const COLUMNS: Array<ContentColumn<NewsRecord>> = [
  {
    id: 'title',
    label: '제목 · 원문',
    // 4 + 2 + 2 + 1 = 9 — CONTENT_COLUMN_BUDGET 을 넘으면 관리 열이 다음 줄로 밀린다.
    span: 4,
    render: (news) => (
      <div className="min-w-0">
        <p className="block min-w-0 truncate text-sm font-medium">{news.title}</p>
        {/*
          원문 링크는 새 창으로 연다. 어드민 작업 중에 목록을 잃지 않기 위해서다.
          rel="noreferrer" 는 새 창이 이 화면을 조작하지 못하게 막는다.
        */}
        <a
          href={news.url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-1 text-xs text-brand-700 underline underline-offset-2 dark:text-brand-300"
        >
          <span className="shrink-0">
            <LinkIcon />
          </span>
          <span className="block min-w-0 truncate">{news.url}</span>
        </a>
      </div>
    ),
  },
  {
    id: 'press',
    label: '언론사',
    span: 2,
    render: (news) => <span className="block min-w-0 truncate text-sm text-ink-muted">{news.press}</span>,
  },
  {
    id: 'publishedAt',
    label: '발행일',
    span: 2,
    render: (news) => <span className="font-mono text-xs tabular-nums text-ink-muted">{news.publishedAt}</span>,
  },
  {
    id: 'visible',
    label: '상태',
    span: 1,
    align: 'center',
    render: (news) => (
      <AdminVisibilityBadge visible={news.visible} />
    ),
  },
];

/** 뉴스 목록 — 행을 누르면 `/contents/news/{뉴스코드}` 상세로 간다. */
export function NewsListView() {
  const router = useRouter();
  const toast = useToast();
  const [news, setNews] = useState<NewsRecord[]>(NEWS);

  return (
    <ContentListView<NewsRecord>
      title="뉴스"
      description="언론에 나간 소식을 모아 고객 화면에 노출하세요."
      entityLabel="뉴스"
      items={news}
      onItemsChange={setNews}
      idOf={(item) => item.id}
      labelOf={(item) => item.title}
      visibleOf={(item) => item.visible}
      searchIn={(item) => `${item.title} ${item.press} ${item.id} ${item.url}`}
      columns={COLUMNS}
      searchId="news-search"
      searchHint="제목, 언론사, 링크로 검색"
      actionLabel="뉴스 등록"
      onAction={() => {
        toast.info('뉴스 등록 화면으로 이동합니다.');
        router.push('/contents/news/new');
      }}
      onOpen={(item) => router.push(`/contents/news/${item.id}`)}
      filters={[
        {
          id: 'press',
          label: '언론사',
          options: [...new Set(news.map((item) => item.press))].map((press) => ({ value: press, label: press })),
        },
      ]}
      matchesFilters={(item, values) => {
        const press = values.press ?? ALL_VALUE;
        if (press !== ALL_VALUE && item.press !== press) return false;
        return true;
      }}
    />
  );
}
