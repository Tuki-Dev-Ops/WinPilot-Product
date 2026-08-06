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
 * 홈페이지 > 미디어.
 *
 * ## 제목에 검증되는 사실을 적지 않는다
 * 여기 적은 것이 그대로 회사 홈페이지에 실리고, 그 홈페이지는 IR 자료로도 읽힌다. 수상·수출
 * 실적처럼 **확인되는 숫자**를 영상 제목으로 적으면 그것이 허위 기재가 될 수 있다 — 제목은
 * "무엇을 다뤘나" 까지로 둔다.
 *
 * ## 썸네일 칸이 숫자인 이유
 * 영상 파일과 미리보기 그림이 아직 없어, 홈에서는 갈래마다 다른 **무늬**를 깔고 재생 표시만
 * 얹는다. 그 무늬를 가르는 값이 이 숫자다. 그림이 들어오는 날 이 칸이 파일로 바뀐다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `MEDIA_CLIPS` 다.
 */
export function MediaListView() {
  return (
    <>
      <PageHeading title="미디어" description="홈 화면 맨 아래의 스마트팩토리 Replay 목록입니다." />

      <IrRecordTable
        title="영상"
        description="목록의 차례대로 홈 화면에서 왼쪽부터 섭니다."
        columns={COLUMNS}
        rows={MEDIA_CLIPS}
        labelOf={(one) => one.title}
        empty="등록된 영상이 없습니다."
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="channel" className="min-w-0 truncate text-xs text-ink-muted">
            {one.channel}
          </span>,
          <span key="seed" className="min-w-0 flex-1 truncate text-right font-mono text-xs tabular-nums text-ink-muted">
            무늬 {one.seed}
          </span>,
        ]}
      />
    </>
  );
}
