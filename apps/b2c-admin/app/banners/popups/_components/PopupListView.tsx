'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { periodText, POPUP_POSITIONS, POPUPS, SCHEDULE_TONE, scheduleState, type PopupRecord } from '@/lib/data/banners';

function columns(today: string): Array<ContentColumn<PopupRecord>> {
  return [
    {
      id: 'title',
      label: '제목',
      // 4 + 1 + 2 + 2 = 9 — CONTENT_COLUMN_BUDGET 을 넘으면 관리 열이 다음 줄로 밀린다.
      span: 4,
      render: (popup) => (
        <div className="min-w-0">
          <p className="min-w-0 truncate text-sm font-medium">{popup.title}</p>
          <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
            {popup.id} · {popup.width}px{popup.todayClose && ' · 오늘 하루 보지 않기'}
          </p>
        </div>
      ),
    },
    {
      id: 'position',
      label: '위치',
      span: 1,
      render: (popup) => <span className="whitespace-nowrap text-xs text-ink-muted">{popup.position}</span>,
    },
    {
      id: 'period',
      label: '노출 기간',
      span: 2,
      render: (popup) => <span className="text-xs tabular-nums text-ink-muted">{periodText(popup)}</span>,
    },
    {
      id: 'state',
      label: '상태',
      span: 2,
      align: 'center',
      render: (popup) => {
        const state = scheduleState(popup, today);
        return (
          <Badge tone={SCHEDULE_TONE[state]}>
            {state}
          </Badge>
        );
      },
    },
  ];
}

/** 팝업 목록 — 행을 누르면 `/banners/popups/{팝업코드}` 상세로 간다. */
export function PopupListView({ today }: { today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [popups, setPopups] = useState<PopupRecord[]>(POPUPS);

  return (
    <ContentListView<PopupRecord>
      title="팝업"
      description="고객 화면에 뜨는 팝업과 노출 기간을 관리하세요."
      entityLabel="팝업"
      items={popups}
      onItemsChange={setPopups}
      idOf={(popup) => popup.id}
      labelOf={(popup) => popup.title}
      visibleOf={(popup) => popup.visible}
      searchIn={(popup) => `${popup.title} ${popup.id} ${popup.linkUrl}`}
      columns={columns(today)}
      searchId="popup-search"
      searchHint="제목, 팝업 코드, 링크로 검색"
      actionLabel="팝업 등록"
      onAction={() => {
        toast.info('팝업 등록 화면으로 이동합니다.');
        router.push('/banners/popups/new');
      }}
      onOpen={(popup) => router.push(`/banners/popups/${popup.id}`)}
      filters={[
        {
          id: 'state',
          label: '노출 상태',
          options: [
            { value: '노출 중', label: '노출 중' },
            { value: '예정', label: '예정' },
            { value: '종료', label: '종료' },
            { value: '숨김', label: '숨김' },
          ],
        },
        {
          id: 'position',
          label: '위치',
          options: POPUP_POSITIONS.map((position) => ({ value: position, label: position })),
        },
      ]}
      matchesFilters={(popup, values) => {
        const state = values.state ?? ALL_VALUE;
        if (state !== ALL_VALUE && scheduleState(popup, today) !== state) return false;

        const position = values.position ?? ALL_VALUE;
        if (position !== ALL_VALUE && popup.position !== position) return false;

        return true;
      }}
    />
  );
}
