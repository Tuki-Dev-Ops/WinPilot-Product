'use client';

import { useState } from 'react';
import { Dropdown, Panel } from '@winpilot/ui';
import { FAQ_TOPICS, type FaqTopic, type FnbFaq } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbTextArea,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';

/** 분류는 값이 곧 이름이지만 `Dropdown` 을 쓴다 — 다섯이라 펼쳐 보고 고르는 편이 낫다. */
const TOPIC_OPTIONS = FAQ_TOPICS.map((one) => ({ value: one, label: one }));

/**
 * 자주 묻는 것 하나 — **창업과 고객센터가 이 한 벌을 쓴다.**
 *
 * 갈래(`audience`)는 고르는 칸이 아니라 **화면이 정해서 넘기는 값**이다. 창업 화면에서 만든
 * 글이 손님 목록에 서면 안 되고, 고를 수 있게 두면 잘못 고른다. 그래서 읽기 전용으로 보여만 준다.
 *
 * ## 물음을 물음표로 끝나게 두지 않는다
 * 막지 않는다. 다만 물음표가 없으면 알린다 — 목록에서 물음과 답이 나란히 서는데, 물음이
 * 문장으로 끝나면 **어느 쪽이 물음인지**가 한눈에 안 갈린다.
 *
 * ## 답을 길게 받는다
 * 사이트에서 접혀 있다가 펴진다(`FoldList`). 카드처럼 높이가 정해진 자리가 아니라 길이를
 * 재지 않는다 — 대신 짧은 답이 더 잘 읽힌다는 것만 안내로 적는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function FaqForm({ faq, mode = 'edit' }: { faq: FnbFaq; mode?: 'edit' | 'create' }) {
  const [topic, setTopic] = useState<string>(faq.topic);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [visible, setVisible] = useState(faq.visible);
  const [tried, setTried] = useState(false);

  const noMark = question.trim() !== '' && !question.trim().endsWith('?');

  const broken = [...(question.trim() ? [] : ['질문']), ...(answer.trim() ? [] : ['답'])];

  return (
    <FnbRecordForm
      resource={faq.audience === '창업' ? '창업 FAQ' : '고객센터 FAQ'}
      mode={mode}
      detail={`${topic} · ${question.trim()}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="어느 갈래의 물음인가" description="사이트에서 이 분류의 기둥 아래에 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="글 번호" value={faq.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="글 번호" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbReadonly
            label="누가 묻나"
            value={faq.audience}
            note={faq.audience === '창업' ? '창업 FAQ 화면에서 만든 글입니다' : '고객센터 FAQ 화면에서 만든 글입니다'}
          />

          <FnbField label="분류" htmlFor="faq-topic" hint="창업 문의 화면의 왼쪽 기둥이 이 값으로 나뉩니다.">
            <Dropdown
              id="faq-topic"
              label="분류를 고르세요"
              value={topic}
              onChange={(next) => setTopic(next as FaqTopic)}
              options={TOPIC_OPTIONS}
            />
          </FnbField>

          <FnbField label="공개" hint="끄면 사이트에서 빠집니다. 지우는 것과 달리 되돌릴 수 있습니다.">
            <FnbToggle
              id="faq-visible"
              checked={visible}
              onChange={setVisible}
              label="사이트에 걸기"
              description="끄면 FAQ 목록에서 빠집니다."
            />
          </FnbField>
        </div>
      </Panel>

      <Panel title="묻고 답하기" description="사이트에서는 물음만 보이다가 눌러야 답이 펴집니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField
            label="질문"
            htmlFor="faq-question"
            required
            hint={
              noMark
                ? '물음표로 끝나지 않습니다 — 목록에서 답과 갈리지 않을 수 있습니다. 그대로 저장하셔도 됩니다.'
                : '손님이 실제로 쓰는 말로 적으세요. 회사가 부르는 이름은 검색에 걸리지 않습니다.'
            }
            {...(tried && !question.trim() ? { error: '질문을 적어 주세요.' } : {})}
          >
            <FnbTextInput
              id="faq-question"
              value={question}
              onChange={setQuestion}
              invalid={tried && !question.trim()}
            />
          </FnbField>

          <FnbField
            label="답"
            htmlFor="faq-answer"
            required
            hint="두세 줄이면 충분합니다. 길어지면 읽지 않고 전화합니다."
            {...(tried && !answer.trim() ? { error: '답을 적어 주세요.' } : {})}
          >
            <FnbTextArea id="faq-answer" value={answer} onChange={setAnswer} rows={5} invalid={tried && !answer.trim()} />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
