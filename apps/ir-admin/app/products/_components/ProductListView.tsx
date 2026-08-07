'use client';

import { useRouter } from 'next/navigation';
import { Badge, PageHeading } from '@winpilot/ui';
import { SOLUTIONS } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '제품', span: 'lg:col-span-2' },
  { label: '한 줄', span: 'lg:col-span-3' },
  { label: '기능', span: 'lg:col-span-2' },
  { label: '상세', span: 'lg:col-span-1' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 제품 > 목록.
 *
 * ## 솔루션 목록과 같은 값을 본다
 * 이 회사에서 **파는 것**은 넷뿐이고, 그것을 제품이라 부르든 솔루션이라 부르든 같은 물건이다.
 * 두 갈래로 나눈 것은 **보는 사람이 다르기 때문**이다 — 제품 갈래는 이름과 기능을, 솔루션
 * 갈래는 어떤 문제를 어떻게 푸는지를 본다. 값을 두 벌로 두면 그 둘이 어긋난다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function ProductListView() {
  const router = useRouter();
  return (
    <>
      <PageHeading title="제품" description="사이트의 클라우드 제품 넷입니다." />

      <IrRecordTable
        title="제품"
        description="한 줄과 푸는 방법이 제품 카드에 그대로 실립니다."
        columns={COLUMNS}
        rows={SOLUTIONS}
        onOpen={(one) => router.push(`/products/${one.id}`)}
        labelOf={(one) => one.name}
        empty="등록된 제품이 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">Cloud {one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="tag" className="min-w-0 truncate text-sm">
            {one.tagline}
          </span>,
          <span key="feat" className="min-w-0 truncate text-xs text-ink-muted">
            {one.features.map((f) => f.title).join(' · ')}
          </span>,
          <span key="href" className="flex min-w-0 justify-center font-mono text-xs text-ink-muted">
            {one.href}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'wait'}>{one.visible ? '노출' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
