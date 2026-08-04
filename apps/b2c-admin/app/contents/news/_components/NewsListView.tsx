'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { useToast } from '@winpilot/ui';
import { NEWS, type NewsRecord } from '@/lib/data/contents';

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9.5 L9.5 6.5" strokeLinecap="round" />
      <path d="M7.25 4.75 L9 3 a2.5 2.5 0 0 1 3.5 3.5 L10.75 8.25" strokeLinecap="round" />
      <path d="M8.75 11.25 L7 13 a2.5 2.5 0 0 1 -3.5 -3.5 L5.25 7.75" strokeLinecap="round" />
    </svg>
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
        <p className="truncate text-sm font-medium">{news.title}</p>
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
          <span className="truncate">{news.url}</span>
        </a>
      </div>
    ),
  },
  {
    id: 'press',
    label: '언론사',
    span: 2,
    render: (news) => <span className="truncate text-sm text-ink-muted">{news.press}</span>,
  },
  {
    id: 'publishedAt',
    label: '발행일',
    span: 2,
    render: (news) => <span className="font-mono text-xs tabular-nums text-ink-muted">{news.publishedAt}</span>,
  },
  {
    id: 'visible',
    label: '노출',
    span: 1,
    align: 'center',
    render: (news) => (
      <span
        className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          news.visible ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
        }`}
      >
        {news.visible ? '노출' : '숨김'}
      </span>
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
