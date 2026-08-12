'use client';

import { useState } from 'react';
import type { FaqTopic, FnbFaq } from '@winpilot/store';
import { AsidePicker } from '@/app/_components/AsidePicker';
import { FoldList } from '@/app/_components/FoldList';

/**
 * 가맹점 개설문의 — **왼쪽에 분류, 오른쪽에 접힌 물음들.**
 *
 * 물음을 접어 두는 것과 하나만 열리는 것은 `FoldList` 가 한다 — 공지사항 · 고객센터 FAQ 와 같은
 * 동작이라 한 번 배운 사람이 다시 배우지 않는다. 여기가 더 갖는 것은 **왼쪽 분류** 하나다.
 *
 * ## 분류를 왼쪽에 세운다
 * 여덟이 넘어가면서 한 줄로는 무엇이 있는지 보이지 않게 됐다. 위에 가로로 놓을 수도 있었지만,
 * 이 화면에는 이미 **위에 탭 셋**(절차 · 신청 · 문의)이 있다. 가로 줄이 둘이면 어느 것이
 * 화면을 바꾸고 어느 것이 목록만 거르는지 구분되지 않는다.
 *
 * 기둥 자체는 `AsidePicker` 가 갖는다 — 메뉴판 · 마케팅과 같은 것이다.
 */
export function FranchiseFaqBoard({ topics, faqs }: { topics: readonly FaqTopic[]; faqs: readonly FnbFaq[] }) {
  const [topic, setTopic] = useState<FaqTopic | ''>('');
  const shown = topic ? faqs.filter((one) => one.topic === topic) : faqs;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <AsidePicker
        title="무엇이 궁금하신가요"
        choices={[
          { id: '', label: '전체', count: faqs.length },
          ...topics.map((one) => ({
            id: one,
            label: one,
            count: faqs.filter((each) => each.topic === one).length,
          })),
        ]}
        picked={topic}
        onPick={(next) => setTopic(next as FaqTopic | '')}
      />

      {/*
        분류를 바꾸면 열려 있던 답이 닫힌다 — `key` 가 바뀌면서 여닫이가 처음 상태로 돌아간다.
        닫지 않으면 다른 분류의 답이 펴진 채 남아, 목록이 바뀐 것을 못 본다.
      */}
      <div className="min-w-0 flex-1">
        <FoldList
          key={topic}
          items={shown.map((one) => ({
            id: one.id,
            head: <span className="text-sm font-medium">{one.question}</span>,
            body: <p className="text-sm leading-loose text-ink-muted">{one.answer}</p>,
          }))}
        />
      </div>
    </div>
  );
}

