'use client';

import { useState } from 'react';
import { Panel } from '@winpilot/ui';
import { FNB_NOTICES, type FnbNotice } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbTextArea,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';

/** `2026-08-05` 꼴인가. */
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

/** 홈 띠에서 한 줄로 흐를 때 잘리지 않는 길이. 넘겨도 막지 않고 알리기만 한다. */
const TICKER_LIMIT = 34;

/**
 * 공지 하나.
 *
 * ## 고정을 켜는 것이 이 화면에서 가장 무거운 결정이다
 * 고정한 글은 **날짜와 상관없이 맨 위에 남는다.** 가격 인상처럼 묻기 전에 읽혀야 하는 것에
 * 쓰라고 둔 자리인데, 켜 두고 잊으면 반년 지난 글이 계속 첫 줄에 선다.
 *
 * 그래서 이미 고정된 글이 있으면 그 사실을 여기서 알린다 — 목록으로 돌아가 세어 보게 하면
 * 아무도 안 센다.
 *
 * ## 제목이 홈 띠에 흐른다
 * 첫 화면 아래 한 줄짜리 띠가 이 제목을 굴린다. 길면 잘리는데 **그것은 여기서 저장한 사람
 * 눈에는 안 보인다.** 글자 수를 세어 알리되 막지는 않는다 — 정말 길어야 하는 제목이 있다.
 *
 * ## 올린 날을 손으로 받는다
 * 사이트가 이 날짜로 차례를 세운다. 저장한 시각을 박으면 **미리 적어 두고 나중에 여는** 공지가
 * 적어 둔 날짜로 서게 된다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function NoticeForm({ notice, mode = 'edit' }: { notice: FnbNotice; mode?: 'edit' | 'create' }) {
  const [title, setTitle] = useState(notice.title);
  const [body, setBody] = useState(notice.body);
  const [postedOn, setPostedOn] = useState(notice.postedOn);
  const [pinned, setPinned] = useState(notice.pinned);
  const [visible, setVisible] = useState(notice.visible);
  const [tried, setTried] = useState(false);

  const dateBroken = !DATE_SHAPE.test(postedOn.trim());
  const tooLong = title.trim().length > TICKER_LIMIT;

  /* 이 글 말고 이미 고정된 글 — 켜기 전에 몇이 있는지 알려 준다. */
  const alreadyPinned = FNB_NOTICES.filter((one) => one.id !== notice.id && one.pinned && one.visible).length;

  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(body.trim() ? [] : ['본문']),
    ...(dateBroken ? ['올린 날'] : []),
  ];

  return (
    <FnbRecordForm
      resource="공지"
      mode={mode}
      detail={`${title.trim()}${pinned ? ' · 맨 위 고정' : ''}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="무엇을 알리나" description="제목은 홈의 공지 띠에 한 줄로 흐릅니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="공지 번호" value={notice.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="공지 번호" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField
            label="제목"
            htmlFor="notice-title"
            required
            hint={
              tooLong
                ? `${title.trim().length}자 — 홈 공지 띠에서 잘릴 수 있습니다. 그대로 저장하셔도 됩니다.`
                : `${title.trim().length}자 · ${TICKER_LIMIT}자 안이면 홈 띠에서 잘리지 않습니다.`
            }
            {...(tried && !title.trim() ? { error: '제목을 적어 주세요.' } : {})}
          >
            <FnbTextInput id="notice-title" value={title} onChange={setTitle} invalid={tried && !title.trim()} />
          </FnbField>

          <FnbField
            label="본문"
            htmlFor="notice-body"
            required
            hint="고객센터 화면에서 제목을 누르면 이 글이 펴집니다."
            {...(tried && !body.trim() ? { error: '본문을 적어 주세요.' } : {})}
          >
            <FnbTextArea id="notice-body" value={body} onChange={setBody} rows={6} invalid={tried && !body.trim()} />
          </FnbField>
        </div>
      </Panel>

      <Panel title="언제 · 어디에 서나" description="날짜가 차례를 정하고, 고정은 그 차례를 무시합니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField
            label="올린 날"
            htmlFor="notice-date"
            required
            hint="사이트가 이 날짜로 차례를 세웁니다. 미리 적어 두는 글이면 실제로 알릴 날을 적으세요."
            {...(tried && dateBroken ? { error: '2026-08-05 처럼 적어 주세요.' } : {})}
          >
            <FnbTextInput
              id="notice-date"
              value={postedOn}
              onChange={setPostedOn}
              placeholder="2026-08-05"
              invalid={tried && dateBroken}
            />
          </FnbField>

          <FnbField
            label="맨 위 고정"
            hint={
              alreadyPinned > 0
                ? `이미 고정된 공지가 ${alreadyPinned}개 있습니다. 둘 이상 고정하면 고정의 뜻이 흐려집니다.`
                : '날짜와 상관없이 맨 위에 섭니다. 다 알린 뒤에는 꺼 주세요.'
            }
          >
            <FnbToggle
              id="notice-pinned"
              checked={pinned}
              onChange={setPinned}
              label="맨 위에 고정"
              description="묻기 전에 읽혀야 하는 글에만 쓰세요."
            />
          </FnbField>

          <FnbField label="공개" hint="끄면 사이트에서 빠집니다. 지우는 것과 달리 되돌릴 수 있습니다.">
            <FnbToggle
              id="notice-visible"
              checked={visible}
              onChange={setVisible}
              label="사이트에 걸기"
              description="홈 띠와 고객센터 공지사항에 섭니다."
            />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
