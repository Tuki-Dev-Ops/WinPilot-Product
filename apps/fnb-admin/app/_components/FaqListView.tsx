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
import { FAQ_TOPICS, FNB_FAQS, type FnbFaq } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '분류', span: 'lg:col-span-1 lg:text-center' },
  { label: '질문', span: 'lg:col-span-3' },
  { label: '답', span: 'lg:col-span-4' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

const FILTERS: ListFilterField[] = [
  { id: 'topic', label: '분류', options: FAQ_TOPICS.map((one) => ({ value: one, label: one })) },
  {
    id: 'state',
    label: '상태',
    options: [
      { value: '공개', label: '공개' },
      { value: '숨김', label: '숨김' },
    ],
  },
];

/**
 * 자주 묻는 것 — **창업과 고객센터가 이 한 벌을 갈래만 달리해서 쓴다.**
 *
 * ## 왜 두 화면인가
 * 한 화면에 두고 `누가 묻나` 거르개로 나눌 수도 있었다. 그런데 **답하는 사람이 다르다** —
 * 창업 물음은 가맹 담당이 답하고 손님 물음은 매장 담당이 답한다. 한 목록에 섞이면 들어올 때마다
 * 거르개를 자기 것으로 맞춰야 하고, 한 번 잊으면 남의 물음을 고친다.
 *
 * ## 왜 한 벌인가
 * 두 화면의 표가 똑같다. 화면마다 그리면 열 폭 · 거르개 · 지울 때 나오는 말이 두 벌이 되고,
 * 그러다 한쪽에만 분류 열이 빠진다 — 두 화면을 나란히 열어 놓기 전에는 안 드러난다.
 *
 * 갈리는 것은 `audience` 하나이므로 그것만 받는다. 제목과 설명도 함께 받는데, 같은 표라도
 * **무엇을 하는 자리인지는 다르게 적혀야** 하기 때문이다.
 *
 * ## 분류가 첫 칸이다
 * 사이트의 창업 문의 화면이 이것으로 왼쪽 기둥을 세운다(`FranchiseFaqBoard`). 여기서 분류가
 * 안 보이면 **어느 기둥에 붙을지 모르는 채로** 글을 쓰게 되고, 그러면 한 분류에만 열이 쌓인다.
 *
 * ## 답을 넓게 세운다
 * 질문보다 답이 넓다. 질문은 대개 한 줄이라 잘리지 않지만, **답이 옛말인지**를 확인하는 것이
 * 이 화면에서 하는 일이기 때문이다 — 가격이 오르면 창업 비용을 적은 답도 함께 고쳐야 한다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function FaqListView({
  audience,
  title,
  description,
  basePath,
}: {
  audience: FnbFaq['audience'];
  title: string;
  description: string;
  /**
   * 이 갈래의 목록 주소 — 상세와 등록이 그 아래에 있다.
   *
   * 갈래에서 주소를 계산할 수도 있었다(`창업` 이면 `/franchise/faqs`). 그러면 이 조각이
   * **콘솔의 주소 구조를 알게 되고**, 갈래가 하나 늘 때 여기 조건문이 하나 는다.
   */
  basePath: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = FNB_FAQS.filter((one) => {
    if (one.audience !== audience) return false;
    if (topic !== ALL_VALUE && one.topic !== topic) return false;
    if (state !== ALL_VALUE && (one.visible ? '공개' : '숨김') !== state) return false;
    if (!word) return true;
    return [one.question, one.answer].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title={title} description={description} />

      <ListToolbar
        searchId="faq-search"
        searchLabel="질문 검색"
        searchHint="질문 · 답"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="질문 등록"
        onAction={() => router.push(`${basePath}/new`)}
        filters={FILTERS}
        filterValues={{ topic, state }}
        onFilterChange={(id, value) => {
          if (id === 'topic') setTopic(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setTopic(ALL_VALUE);
          setState(ALL_VALUE);
        }}
      />

      <RecordTable
        title="자주 묻는 질문"
        description="숨김으로 두면 사이트에서 빠집니다. 지우는 것과 달리 되돌릴 수 있습니다."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`${basePath}/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="사이트에서 사라집니다. 당분간 안 쓰는 것이라면 지우지 말고 숨김으로 두세요."
        labelOf={(one) => one.question}
        empty="조건에 맞는 질문이 없습니다."
        render={(one) => [
          <span key="topic" className="flex min-w-0 justify-center">
            <span className="truncate text-xs text-ink-muted">{one.topic}</span>
          </span>,
          <span key="q" className="min-w-0 truncate text-sm font-medium">
            {one.question}
          </span>,
          <span key="a" className="min-w-0 truncate text-xs text-ink-muted">
            {one.answer}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.visible ? 'ok' : 'neutral'}>{one.visible ? '공개' : '숨김'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
