'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_VALUE,
  Badge,
  ListToolbar,
  PageHeading,
  RecordTable,
  type ListFilterField,
  type RecordColumn,
} from '@winpilot/ui';
import { FRANCHISE_INQUIRIES, STORE_REGIONS } from '@winpilot/store';

/**
 * `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다(`RecordTable` 머리말).
 */
const COLUMNS: RecordColumn[] = [
  { label: '받은 날', span: 'lg:col-span-1' },
  { label: '신청자', span: 'lg:col-span-2' },
  { label: '지역', span: 'lg:col-span-1 lg:text-center' },
  { label: '예산', span: 'lg:col-span-2' },
  { label: '하고 싶은 말', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 상태별 표 색.
 *
 * `접수` 만 노란색(`wait`)이다 — **아직 아무도 손대지 않은 것**이 그것뿐이기 때문이다. 상담
 * 중인 건까지 노랗게 두면 밀린 것과 진행 중인 것이 한 색으로 보이고, 그때 색은 뜻을 잃는다.
 *
 * `보류` 는 회색이되 `완료` 와 갈린다 — 끝난 것이 아니라 멈춰 둔 것이라 언젠가 다시 열어야 한다.
 */
export const INQUIRY_STATES = ['접수', '상담중', '완료', '보류'] as const;

export const INQUIRY_TONE = { 접수: 'wait', 상담중: 'brand', 완료: 'ok', 보류: 'neutral' } as const;

const FILTERS: ListFilterField[] = [
  {
    id: 'state',
    label: '상태',
    options: INQUIRY_STATES.map((one) => ({ value: one, label: one })),
  },
  { id: 'region', label: '지역', options: STORE_REGIONS.map((one) => ({ value: one, label: one })) },
];

/**
 * 창업 문의 > 목록.
 *
 * ## 지우는 자리를 두지 않는다
 * `onDelete` 를 넘기지 않는다. 이 값은 우리가 만든 것이 아니라 **손님이 남긴 것**이라, 잘못
 * 들어온 것처럼 보여도 지우면 그 사람이 언제 무엇을 물었는지가 사라진다. 나중에 "연락 못
 * 받았다" 는 말에 댈 근거가 없어진다. 처리가 끝난 것은 상태로 닫는다.
 *
 * 체크박스는 그대로 선다. 일괄로 할 일이 없는 화면에서도 표의 맨 왼쪽이 같은 자리여야 눈이
 * 헤매지 않는다(`RecordTable` 머리말).
 *
 * ## 처음에 `접수` 만 보여 주지 않는다
 * 밀린 것만 걸어 두면 상담 중인 건이 화면에서 사라지고, 그 건은 **아무도 안 보는 채로** 남는다.
 * 밀린 것을 세는 일은 대시보드가 한다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function InquiryListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<string>(ALL_VALUE);
  const [region, setRegion] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = FRANCHISE_INQUIRIES.filter((one) => {
    if (state !== ALL_VALUE && one.state !== state) return false;
    if (region !== ALL_VALUE && one.region !== region) return false;
    if (!word) return true;
    return [one.name, one.phone, one.message].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="창업 문의" description="사이트에서 하루 안에 연락드린다고 안내하고 있습니다." />

      <ListToolbar
        searchId="inquiry-search"
        searchLabel="문의 검색"
        searchHint="신청자 · 연락처 · 내용"
        searchValue={keyword}
        onSearchChange={setKeyword}
        filters={FILTERS}
        filterValues={{ state, region }}
        onFilterChange={(id, value) => {
          if (id === 'state') setState(value);
          if (id === 'region') setRegion(value);
        }}
        onFilterReset={() => {
          setState(ALL_VALUE);
          setRegion(ALL_VALUE);
        }}
      />

      <RecordTable
        title="창업 문의"
        description="밖에서 들어온 기록이라 지우는 자리를 두지 않습니다. 끝난 건은 상태로 닫습니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/inquiries/${one.id}`)}
        labelOf={(one) => `${one.name} (${one.id})`}
        empty="조건에 맞는 문의가 없습니다."
        render={(one) => [
          <span key="date" className="min-w-0 font-mono text-xs tabular-nums text-ink-muted">
            {one.receivedOn}
          </span>,
          <span key="who" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.name}</span>
            <span className="block min-w-0 truncate font-mono text-xs tabular-nums text-ink-faint">
              {one.phone}
            </span>
          </span>,
          <span key="region" className="flex min-w-0 justify-center text-sm">
            {one.region}
          </span>,
          <span key="budget" className="min-w-0 truncate text-sm text-ink-muted">
            {one.budget}
          </span>,
          <span key="message" className="min-w-0 truncate text-xs text-ink-muted">
            {one.message}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={INQUIRY_TONE[one.state]}>{one.state}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
