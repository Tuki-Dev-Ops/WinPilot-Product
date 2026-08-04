'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { useToast } from '@winpilot/ui';
import { BANNERS, periodText, SCHEDULE_TONE, scheduleState, type BannerRecord } from '@/lib/data/banners';

function columns(today: string): Array<ContentColumn<BannerRecord>> {
  return [
    {
      id: 'order',
      label: '순서',
      span: 1,
      align: 'center',
      render: (banner) => <span className="font-mono text-sm tabular-nums text-ink-muted">{banner.order}</span>,
    },
    {
      id: 'title',
      label: '제목 · 링크',
      // 1 + 4 + 2 + 2 = 9 — CONTENT_COLUMN_BUDGET 을 넘으면 관리 열이 다음 줄로 밀린다.
      span: 4,
      render: (banner) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* 목록 썸네일 — 업로드된 이미지는 브라우저 메모리에만 있어 목록에서는 자리표시자로 둔다. */}
          <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-surface text-[10px] text-ink-faint">
            이미지
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{banner.title}</p>
            <p className="truncate font-mono text-xs text-ink-faint">
              {banner.id}
              {banner.linkUrl && ` · ${banner.linkUrl}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'period',
      label: '노출 기간',
      span: 2,
      render: (banner) => <span className="text-xs tabular-nums text-ink-muted">{periodText(banner)}</span>,
    },
    {
      id: 'state',
      label: '상태',
      span: 2,
      align: 'center',
      render: (banner) => {
        const state = scheduleState(banner, today);
        return (
          <span
            className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SCHEDULE_TONE[state]}`}
          >
            {state}
          </span>
        );
      },
    },
  ];
}

/**
 * 메인 비주얼 목록 — 행을 누르면 `/banners/{배너코드}` 상세로 간다.
 *
 * 상태는 노출 스위치만이 아니라 **기간까지 반영**한다. 켜 두었어도 기간이 지났으면
 * 고객 화면에 안 나오는데, 목록이 '노출' 이라고만 하면 왜 안 보이는지 알 수 없다.
 */
export function BannerListView({ today }: { today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [banners, setBanners] = useState<BannerRecord[]>(BANNERS);

  return (
    <ContentListView<BannerRecord>
      entityLabel="배너"
      items={[...banners].sort((a, b) => a.order - b.order)}
      onItemsChange={setBanners}
      idOf={(banner) => banner.id}
      labelOf={(banner) => banner.title}
      visibleOf={(banner) => banner.visible}
      searchIn={(banner) => `${banner.title} ${banner.id} ${banner.linkUrl}`}
      columns={columns(today)}
      searchId="banner-search"
      searchHint="제목, 배너 코드, 링크로 검색"
      actionLabel="배너 등록"
      onAction={() => {
        toast.info('배너 등록 화면으로 이동합니다.');
        router.push('/banners/new');
      }}
      onOpen={(banner) => router.push(`/banners/${banner.id}`)}
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
          id: 'link',
          label: '링크',
          options: [
            { value: 'yes', label: '있음' },
            { value: 'no', label: '없음' },
          ],
        },
      ]}
      matchesFilters={(banner, values) => {
        const state = values.state ?? ALL_VALUE;
        if (state !== ALL_VALUE && scheduleState(banner, today) !== state) return false;

        const link = values.link ?? ALL_VALUE;
        if (link !== ALL_VALUE && Boolean(banner.linkUrl.trim()) !== (link === 'yes')) return false;

        return true;
      }}
    />
  );
}
