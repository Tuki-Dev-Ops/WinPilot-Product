'use client';

import { PageHeading } from '@winpilot/ui';
import { MEDIA_CLIPS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-6' },
  { label: '갈래', span: 'lg:col-span-3' },
  { label: '썸네일', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 콘텐츠 > 뉴스.
 *
 * ## 제목에 검증되는 사실을 적지 않는다
 * 여기 적은 것이 그대로 회사 홈페이지에 실리고, 그 홈페이지는 IR 자료로도 읽힌다. 수상·수출
 * 실적처럼 **확인되는 숫자**를 제목으로 적으면 그것이 허위 기재가 될 수 있다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 이고 투자자 화면이 같은 것을 읽는다.
 */
export function NewsListView() {
  return (
    <>
      <PageHeading title="뉴스" description="방송·행사·제품 소개로 남은 것들입니다." />

      <IrRecordTable
        title="뉴스"
        description="목록의 차례대로 사이트에 섭니다."
        columns={COLUMNS}
        rows={MEDIA_CLIPS}
        labelOf={(one) => one.title}
        empty="등록된 뉴스가 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="channel" className="min-w-0 truncate text-xs text-ink-muted">
            {one.channel}
          </span>,
          <span key="seed" className="min-w-0 flex-1 truncate text-right font-mono text-xs tabular-nums text-ink-muted">
            {`무늬 ${one.seed}`}
          </span>,
        ]}
      />
    </>
  );
}
