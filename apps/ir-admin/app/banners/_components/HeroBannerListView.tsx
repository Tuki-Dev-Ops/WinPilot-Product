'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { SITE_BANNERS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-5' },
  { label: '기간', span: 'lg:col-span-5' },
  { label: '상태', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * 배너 > 메인 비주얼.
 *
 * **기간을 반드시 적는다.** 끝을 비워 두면 행사가 끝난 뒤에도 계속 서 있고, 그 사실은 대개
 * 밖에서 먼저 발견된다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function HeroBannerListView() {
  return (
    <>
      <PageHeading title="메인 비주얼" description="첫 화면 위에 기간을 갖고 서는 배너입니다." />

      <IrRecordTable
        title="배너"
        description="기간이 지나면 저절로 내려갑니다."
        columns={COLUMNS}
        rows={SITE_BANNERS.filter((one) => one.slot === '메인 비주얼')}
        labelOf={(one) => one.title}
        empty="등록된 배너가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="range" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {`${one.startAt} ~ ${one.endAt}`}
          </span>,
          <span key="state" className="flex min-w-0 flex-1 justify-end">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
