'use client';

import { useState } from 'react';
import { FAQ_GROUPS, SITE_FAQS, type SiteFaq } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrSelect,
  IrTextArea,
  IrTextInput,
  IrToggle,
  type FormMode,
} from '@/app/_components/IrRecordForm';

const LIST = '/contents/faqs';

/**
 * FAQ 등록 · 수정.
 *
 * ## 비슷한 물음을 옆에 띄운다
 * FAQ 가 늘어나는 방식은 늘 같다 — 문의가 들어올 때마다 하나씩 더하다 보면 **말만 다른 같은 답**이
 * 쌓인다. 쌓인 뒤에 정리하려면 스무 줄을 서로 견줘야 하는데, 그 일을 하는 사람은 없다.
 *
 * 그래서 적는 동안 같은 갈래의 물음을 옆에 세워 둔다. 막지는 않는다 — 정말 다른 물음인지는
 * 사람만 알고, 막으면 비슷해 보이는 새 물음을 적을 방법이 사라진다.
 *
 * ## 답을 길게 받는다
 * 글상자를 열두 줄로 연다. 짧게 열어 두면 짧게 적게 되고, 짧은 답은 **다시 문의로 돌아온다** —
 * FAQ 가 하는 일이 그 되돌아옴을 줄이는 것이다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function FaqForm({
  mode,
  code,
  initial,
}: {
  mode: FormMode;
  code: string;
  initial?: SiteFaq;
}) {
  const [group, setGroup] = useState<string>(initial?.group ?? FAQ_GROUPS[0] ?? '도입');
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [tried, setTried] = useState(false);

  const broken = [...(question.trim() ? [] : ['물음']), ...(answer.trim() ? [] : ['답'])];

  /** 같은 갈래의 다른 물음. 자기 자신은 뺀다 — 수정 화면에서 자기가 자기 이웃으로 뜨면 헷갈린다. */
  const neighbors = SITE_FAQS.filter((one) => one.group === group && one.id !== initial?.id);

  return (
    <IrRecordForm
      mode={mode}
      resource="FAQ"
      listHref={LIST}
      detail={`${code} · ${question.trim() || '(물음 없음)'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="물음과 답" description="사이트 FAQ 화면에 이대로 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrReadonly label="FAQ 코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />

          <IrField label="갈래" htmlFor="faq-group" required hint="사이트 FAQ 화면 왼쪽 줄이 됩니다.">
            <IrSelect id="faq-group" value={group} onChange={setGroup} options={FAQ_GROUPS} />
          </IrField>
        

          <IrField
            label="물음"
            htmlFor="faq-question"
            required
            {...(tried && !question.trim()
              ? { error: '물음을 입력해 주세요.' }
              : { hint: '묻는 사람의 말로 적으세요 — 우리 용어로 적으면 검색에 걸리지 않습니다.' })}
          >
            <IrTextInput
              id="faq-question"
              value={question}
              onChange={setQuestion}
              placeholder="예: 도입까지 얼마나 걸리나요?"
              invalid={tried && !question.trim()}
            />
          </IrField>

          <IrField
            label="답"
            htmlFor="faq-answer"
            required
            {...(tried && !answer.trim()
              ? { error: '답을 입력해 주세요.' }
              : { hint: '짧은 답은 다시 문의로 돌아옵니다. 조건과 예외까지 적어 주세요.' })}
          >
            <IrTextArea
              id="faq-answer"
              rows={12}
              value={answer}
              onChange={setAnswer}
              placeholder="표준 구성은 계약 후 6~8주입니다. 기존 설비와 연동해야 하면 그만큼 늘어납니다."
              invalid={tried && !answer.trim()}
            />
          </IrField>

          <IrToggle
            id="faq-visible"
            label="사이트에 노출"
            description="끄면 사이트 FAQ 에서 사라집니다. 답을 고치는 동안 잠깐 내려 두는 자리입니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>

      <IrPanel
        title={`${group} 갈래의 다른 물음`}
        description="같은 답을 두 번 적고 있지는 않은지 확인하세요."
      >
        {neighbors.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">이 갈래에 다른 물음이 없습니다.</p>
        ) : (
          <ul className="flex flex-col">
            {neighbors.map((one) => (
              <li key={one.id} className="border-b border-border px-6 py-3.5 last:border-b-0">
                <p className="min-w-0 truncate text-sm">{one.question}</p>
                <p className="mt-1 min-w-0 truncate text-xs text-ink-faint">{one.answer}</p>
              </li>
            ))}
          </ul>
        )}
      </IrPanel>
    </IrRecordForm>
  );
}
