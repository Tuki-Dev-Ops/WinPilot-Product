'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, ListToolbar, PageHeading } from '@winpilot/ui';
import { SERVICE_DETAILS } from '@winpilot/store';
import { IrRecordTable, type IrColumn } from '@/app/_components/IrRecordTable';

/**
 * `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다(`IrRecordTable` 머리말).
 *
 * 제품 목록이 `상태` 를 두는 자리에 여기서는 `절차` 를 둔다. 서비스에는 켜고 끄는 값이 없고,
 * 대신 이 갈래에서 자주 손대는 것이 **몇 단계로 파는가**다.
 */
const COLUMNS: IrColumn[] = [
  { label: '서비스', span: 'lg:col-span-2' },
  { label: '한 줄', span: 'lg:col-span-3' },
  { label: '기능', span: 'lg:col-span-1 lg:text-center' },
  { label: '구성', span: 'lg:col-span-1 lg:text-center' },
  { label: '업종', span: 'lg:col-span-1 lg:text-center' },
  { label: '절차', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 서비스 > 목록.
 *
 * ## 제품 목록과 무엇이 다른가
 * 값의 모양은 같다(`Offering`). 다른 것은 **여기 있는 둘은 사람이 현장에 가서 하는 일**이라는
 * 점이다 — 계약하면 그날부터 쓰는 제품과 달리, 파는 단위가 화면이 아니라 절차다. 그래서 이
 * 목록은 이름과 기능이 아니라 **상세 화면이 채워졌는지**를 보여 준다. 구성 층과 절차가 비어
 * 있으면 그 화면은 문단 둘로 끝나고, 검토하러 온 사람은 거기서 문의 대신 창을 닫는다.
 *
 * ## 거르개를 두지 않는다
 * 제품 목록에는 `상태`(노출 · 숨김) 거르개가 있다. 서비스에는 그 값이 없다 — 내리는 것이
 * 아니라 **안 파는 것**이라 켜고 끄는 자리를 두지 않았다(store 의 `SERVICE_DETAILS` 머리말).
 * 걸 것이 하나도 없는 거르개를 세워 두면 눌러 본 사람이 목록이 고장 났다고 여긴다.
 *
 * ## 지우는 자리도 없다
 * 상세 화면 주소(`/solutions/consulting`)가 코드로 짜여 있어, 목록에서 한 줄을 지워도 그
 * 화면은 그대로 열린다. **지웠는데 사이트에 남아 있는 것**이 가장 나쁜 상태다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function ServiceListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const word = keyword.trim().toLowerCase();
  const shown = SERVICE_DETAILS.filter((one) => {
    if (!word) return true;
    return [one.title, one.tagline, one.problem].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="서비스" description="사람이 붙어서 하는 일 둘입니다." />

      <ListToolbar
        searchId="service-search"
        searchLabel="서비스명 검색"
        searchHint="서비스명 · 한 줄 소개 · 문제"
        searchValue={keyword}
        onSearchChange={setKeyword}
      />

      <IrRecordTable
        title="서비스"
        description="상세 화면의 문제 · 기능 · 구성 · 업종 · 절차가 여기서 옵니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/services/${one.id}`)}
        labelOf={(one) => one.title}
        empty="등록된 서비스가 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.href}</span>
          </span>,
          <span key="tag" className="min-w-0 truncate text-sm">
            {one.tagline}
          </span>,
          <span key="feat" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.features.length}개</Badge>
          </span>,
          <span key="layers" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.layers.length}층</Badge>
          </span>,
          <span key="ind" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.industries.length}개</Badge>
          </span>,
          <span key="steps" className="flex min-w-0 justify-center">
            <Badge tone="neutral">{one.steps.length}단계</Badge>
          </span>,
        ]}
      />
    </>
  );
}
