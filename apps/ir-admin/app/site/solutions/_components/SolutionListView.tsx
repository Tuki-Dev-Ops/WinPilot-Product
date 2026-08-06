'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { SOLUTIONS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '솔루션', span: 'lg:col-span-2' },
  { label: '한 줄', span: 'lg:col-span-3' },
  { label: '푸는 방법', span: 'lg:col-span-4' },
  { label: '성과', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 홈페이지 > 솔루션.
 *
 * ## 서비스와 무엇이 다른가
 * 서비스(여섯)는 **무엇을 하는가**를 그림 하나로 잇는 목록이고, 솔루션(넷)은 그중 파는 물건만
 * 골라 **어떤 문제를 어떻게 푸는가**를 문장으로 적는 목록이다. 홈에서도 칸이 다르다 — 앞은
 * 회전 무대, 뒤는 사진 카드다.
 *
 * ## 사진은 여기서 고치지 않는다
 * 카드 사진은 파일(`ir-client-a/public/solutions/{id}.jpg`)이라 올리는 자리가 아직 없다.
 * 주소만 받는 칸을 두면 **올릴 수는 없는데 적을 수는 있는** 값이 생긴다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 의 `SOLUTIONS` 다.
 */
export function SolutionListView() {
  return (
    <>
      <PageHeading title="솔루션" description="홈 화면의 사진 카드와 솔루션 상세가 이 값을 읽습니다." />

      <IrRecordTable
        title="솔루션"
        description="한 줄과 푸는 방법은 홈 카드에 그대로 실립니다."
        columns={COLUMNS}
        rows={SOLUTIONS}
        labelOf={(one) => one.name}
        empty="등록된 솔루션이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">Cloud {one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.href}</span>
          </span>,
          <span key="tagline" className="min-w-0 truncate text-sm">
            {one.tagline}
          </span>,
          <span key="approach" className="min-w-0 truncate text-xs text-ink-muted">
            {one.approach}
          </span>,
          <span key="outcomes" className="flex min-w-0 flex-1 justify-end">
            <Badge tone="neutral">{one.outcomes.length}개</Badge>
          </span>,
        ]}
      />
    </>
  );
}
