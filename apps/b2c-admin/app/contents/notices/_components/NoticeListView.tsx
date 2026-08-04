'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { useToast } from '@winpilot/ui';
import { NOTICES, type NoticeRecord } from '@/lib/data/contents';

const COLUMNS: Array<ContentColumn<NoticeRecord>> = [
  {
    id: 'title',
    label: '제목',
    span: 6,
    render: (notice) => (
      <div className="flex min-w-0 items-center gap-2">
        {notice.pinned && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            고정
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{notice.title}</p>
          <p className="font-mono text-xs text-ink-faint">{notice.id}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'createdAt',
    label: '등록일',
    span: 2,
    render: (notice) => <span className="font-mono text-xs tabular-nums text-ink-muted">{notice.createdAt}</span>,
  },
  {
    id: 'visible',
    label: '노출',
    span: 1,
    align: 'center',
    render: (notice) => (
      <span
        className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          notice.visible ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
        }`}
      >
        {notice.visible ? '노출' : '숨김'}
      </span>
    ),
  },
];

/** 공지사항 목록 — 행을 누르면 `/contents/notices/{공지코드}` 상세로 간다. */
export function NoticeListView() {
  const router = useRouter();
  const toast = useToast();
  const [notices, setNotices] = useState<NoticeRecord[]>(NOTICES);

  return (
    <ContentListView<NoticeRecord>
      entityLabel="공지사항"
      items={notices}
      onItemsChange={setNotices}
      idOf={(notice) => notice.id}
      labelOf={(notice) => notice.title}
      visibleOf={(notice) => notice.visible}
      searchIn={(notice) => `${notice.title} ${notice.id}`}
      columns={COLUMNS}
      searchId="notice-search"
      searchHint="제목, 공지 코드로 검색"
      actionLabel="공지 등록"
      onAction={() => {
        toast.info('공지 등록 화면으로 이동합니다.');
        router.push('/contents/notices/new');
      }}
      onOpen={(notice) => router.push(`/contents/notices/${notice.id}`)}
      filters={[
        {
          id: 'pinned',
          label: '상단 고정',
          options: [
            { value: 'yes', label: '고정' },
            { value: 'no', label: '고정 안 함' },
          ],
        },
      ]}
      matchesFilters={(notice, values) => {
        const pinned = values.pinned ?? ALL_VALUE;
        if (pinned !== ALL_VALUE && notice.pinned !== (pinned === 'yes')) return false;
        return true;
      }}
    />
  );
}
