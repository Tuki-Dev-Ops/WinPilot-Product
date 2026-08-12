'use client';

import { useState } from 'react';
import { Panel } from '@winpilot/ui';
import type { FnbPopup } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbTextArea,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';
import { PeriodFields, dateBroken, periodBackwards } from '@/app/banners/_components/PeriodFields';

/**
 * 팝업 상세.
 *
 * ## `하루 감추기` 를 끄는 것이 이 화면에서 가장 무거운 결정이다
 * 끄면 그 팝업은 **올 때마다 뜬다.** 두 번째 방문부터는 읽을 것이 아니라 치워야 할 것이 되고,
 * 그 상태로 몇 달이 지나면 사람들은 팝업을 **읽지 않고 닫는 습관**을 갖는다 — 그러면 정작
 * 읽혀야 할 다음 팝업도 안 읽힌다.
 *
 * 그래서 켜고 끄는 자리 옆에 그 말을 그대로 적어 둔다. 막지는 않는다 — 휴점과 가격 조정처럼
 * 정말 매번 보여야 하는 것이 있다.
 *
 * ## 내용을 짧게 받는다
 * 팝업은 읽는 것을 막는 자리라, 길면 읽지 않고 닫는다. 글자 수를 세어 알리되 막지 않는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PopupForm({ popup, mode = 'edit' }: { popup: FnbPopup ; mode?: 'edit' | 'create' }) {
  const [title, setTitle] = useState(popup.title);
  const [body, setBody] = useState(popup.body);
  const [startAt, setStartAt] = useState(popup.startAt);
  const [endAt, setEndAt] = useState(popup.endAt);
  const [dismissible, setDismissible] = useState(popup.dismissible);
  const [visible, setVisible] = useState(popup.visible);
  const [tried, setTried] = useState(false);

  /* 두세 줄이 넘어가는 자리. 세어 알리되 막지 않는다. */
  const tooLong = body.trim().length > 120;

  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(body.trim() ? [] : ['내용']),
    ...(dateBroken(startAt) ? ['시작'] : []),
    ...(endAt.trim() !== '' && dateBroken(endAt) ? ['종료'] : []),
  ];

  return (
    <FnbRecordForm
      resource="팝업"
      mode={mode}
      detail={`${title.trim()} · ${startAt} ~ ${endAt || '상시'}${dismissible ? '' : ' · 매번 뜸'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="무슨 팝업인가" description="화면 가운데 떠서 닫아야 넘어갑니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="팝업 번호" value={popup.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="팝업 번호" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField
            label="제목"
            htmlFor="popup-title"
            required
            {...(tried && !title.trim() ? { error: '제목을 적어 주세요.' } : {})}
          >
            <FnbTextInput id="popup-title" value={title} onChange={setTitle} invalid={tried && !title.trim()} />
          </FnbField>

          <FnbField
            label="내용"
            htmlFor="popup-body"
            required
            hint={
              tooLong
                ? `${body.trim().length}자 — 길면 읽지 않고 닫습니다. 그대로 저장하셔도 됩니다.`
                : `${body.trim().length}자 · 120자 안이면 한눈에 읽힙니다.`
            }
            {...(tried && !body.trim() ? { error: '내용을 적어 주세요.' } : {})}
          >
            <FnbTextArea id="popup-body" value={body} onChange={setBody} rows={4} invalid={tried && !body.trim()} />
          </FnbField>
        </div>
      </Panel>

      <Panel title="언제 · 어떻게 뜨나" description="닫는 방법이 이 화면에서 가장 무거운 결정입니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <PeriodFields
            startAt={startAt}
            endAt={endAt}
            onStartChange={setStartAt}
            onEndChange={setEndAt}
            tried={tried}
          />

          <FnbField
            label="하루 감추기"
            hint={
              dismissible
                ? '한 번 닫으면 그날은 다시 뜨지 않습니다 — 대부분 이쪽입니다.'
                : '올 때마다 뜹니다. 반드시 읽혀야 하는 것에만 쓰세요 — 매번 뜨는 팝업은 읽지 않고 닫는 습관을 만듭니다.'
            }
          >
            <FnbToggle
              id="popup-dismissible"
              checked={dismissible}
              onChange={setDismissible}
              label="오늘 하루 보지 않기 두기"
              description="끄면 올 때마다 뜹니다."
            />
          </FnbField>

          <FnbField
            label="노출"
            hint={
              periodBackwards(startAt, endAt)
                ? '기간이 거꾸로라 켜 두어도 뜨지 않습니다.'
                : '끄면 기간과 상관없이 즉시 내려갑니다.'
            }
          >
            <FnbToggle
              id="popup-visible"
              checked={visible}
              onChange={setVisible}
              label="사이트에 띄우기"
              description="끄면 기간과 상관없이 즉시 내려갑니다."
            />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
