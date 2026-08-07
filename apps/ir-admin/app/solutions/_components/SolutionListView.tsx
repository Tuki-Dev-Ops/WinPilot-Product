'use client';

import { useRouter } from 'next/navigation';
import { Badge, PageHeading } from '@winpilot/ui';
import { SOLUTIONS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '솔루션', span: 'lg:col-span-2' },
  { label: '문제', span: 'lg:col-span-5' },
  { label: '구성', span: 'lg:col-span-2 lg:text-center' },
  { label: '업종', span: 'lg:col-span-2 lg:text-center' },
  { label: '절차', span: 'lg:col-span-1 lg:text-right' },
];

/**
 * 솔루션 > 목록.
 *
 * 제품 목록과 같은 값을 보되 **다른 칸**을 보여 준다. 여기서 확인할 것은 상세 화면이 채워졌는지다 —
 * 구성 층과 절차가 비어 있으면 그 화면은 문단 둘로 끝난다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function SolutionListView() {
  const router = useRouter();
  return (
    <>
      <PageHeading title="솔루션" description="어떤 문제를 어떻게 푸는지를 관리하세요." />

      <IrRecordTable
        title="솔루션"
        description="상세 화면의 문제 · 기능 · 구성 · 업종 · 절차가 여기서 옵니다."
        columns={COLUMNS}
        rows={SOLUTIONS}
        onOpen={(one) => router.push(`/solutions/${one.id}`)}
        openLabel="수정"
        labelOf={(one) => one.name}
        empty="등록된 솔루션이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0 truncate text-sm font-medium">
            Cloud {one.name}
          </span>,
          <span key="problem" className="min-w-0 truncate text-xs text-ink-muted">
            {one.problem}
          </span>,
          <span key="layers" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.layers.length}층</Badge>
          </span>,
          <span key="ind" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.industries.length}개</Badge>
          </span>,
          <span key="steps" className="min-w-0 flex-1 truncate text-right font-mono text-xs tabular-nums text-ink-muted">
            {`${one.steps.length}단계`}
          </span>,
        ]}
      />
    </>
  );
}
