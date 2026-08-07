'use client';

import { useRouter } from 'next/navigation';
import { Badge, PageHeading } from '@winpilot/ui';
import { SITE_INQUIRIES } from '@winpilot/store';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '문의', span: 'lg:col-span-5' },
  { label: '보낸 곳', span: 'lg:col-span-3' },
  { label: '받은 때', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-2 lg:text-right' },
];

/** 상태마다 다른 톤. 색만으로 알리지 않도록 글자도 함께 바뀐다. */
const STATE_TONE = { 접수: 'wait', 처리중: 'brand', 답변완료: 'ok', 보류: 'neutral' } as const;

/**
 * 문의 > 목록.
 *
 * ## 상태를 오른쪽 끝에 둔다
 * 훑을 때 찾는 것은 **아직 답하지 않은 것**이다. 상태가 가운데 있으면 줄마다 눈이 멈추는
 * 자리가 달라져, 끝까지 읽어야 몇 건이 남았는지 안다. 한 세로선 위에 세워 두면 그 줄만
 * 따라 내려가면 된다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function InquiryListView() {
  const router = useRouter();
  const waiting = SITE_INQUIRIES.filter((one) => one.state !== '답변완료').length;

  return (
    <>
      <PageHeading title="문의" description={`아직 답하지 않은 것이 ${waiting}건입니다.`} />

      <IrRecordTable
        title="문의"
        description="사이트의 문의 양식으로 들어온 것입니다."
        columns={COLUMNS}
        rows={SITE_INQUIRIES}
        onOpen={(one) => router.push(`/inquiries/${one.id}`)}
        openLabel="답변"
        labelOf={(one) => one.message}
        empty="들어온 문의가 없습니다."
        render={(one) => [
          <span key="body" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.message}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">
              {one.kind}
              {one.attachment && ` · ${one.attachment}`}
            </span>
          </span>,
          <span key="from" className="min-w-0">
            <span className="block min-w-0 truncate text-sm">{one.company}</span>
            <span className="block min-w-0 truncate text-xs text-ink-faint">
              {one.region} · {one.name}
            </span>
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.receivedAt}
          </span>,
          <span key="state" className="flex min-w-0 flex-1 justify-end">
            <Badge tone={STATE_TONE[one.state]}>{one.state}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
