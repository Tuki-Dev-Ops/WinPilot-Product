'use client';

import { useState } from 'react';
import { Dropdown, Panel } from '@winpilot/ui';
import { MARKETING_CHANNELS, findMarketingChannel, type MarketingPost } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbTextArea,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';

/**
 * 고르개에 세울 창구.
 *
 * 값(`instagram`)과 보이는 이름(`인스타그램`)이 다르다. 그래서 여기만 `Dropdown` 을 쓴다 —
 * 폼의 다른 고르개(`FnbSelect`)는 값이 곧 이름인 자리에 쓰는 것이고, 그 조각은 값과 이름을
 * 나눠 받지 못한다. 이름을 값으로 저장하면 창구 이름을 바꾸는 날 **글이 전부 창구를 잃는다.**
 */
const CHANNEL_OPTIONS = MARKETING_CHANNELS.map((one) => ({ value: one.id, label: one.name }));

/** `2026-08-05` 꼴인가. 월과 일이 뒤집힌 값이 들어와도 여기서는 못 잡지만, 모양은 잡는다. */
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 마케팅 글 상세 — **창구 · 제목 · 설명 · 올린 날.**
 *
 * ## 사진을 여기서 올리지 않는다
 * 사이트에서는 제목 첫 글자가 사진 자리를 대신하고 있다(`PhotoSlot`). 올리는 자리를 먼저 만들어
 * 두면 **저장은 되는데 사이트에는 안 뜨는** 상태가 생기고, 그때는 올린 사람이 자기가 뭘 잘못했는지
 * 찾는다. 사진을 실제로 거는 날 이 판에 한 칸이 는다.
 *
 * ## 설명을 짧게 받는다
 * 사이트에서 카드 안에 두 줄로 선다. 길게 적으면 카드마다 높이가 달라져 격자가 어긋나는데,
 * 그것은 **여기서 저장한 사람 눈에는 안 보인다.** 그래서 글자 수를 세어 알린다 — 막지는 않는다.
 *
 * ## 올린 날을 손으로 받는다
 * 저장 시각을 자동으로 박지 않는 이유는 목록 머리말에 있다 — 실제 창구에 올린 날과 여기 옮겨
 * 적는 날이 다른 것이 보통이다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function MarketingForm({ post, mode = 'edit' }: { post: MarketingPost ; mode?: 'edit' | 'create' }) {
  const [channelId, setChannelId] = useState(post.channelId);
  const [title, setTitle] = useState(post.title);
  const [desc, setDesc] = useState(post.desc);
  const [postedOn, setPostedOn] = useState(post.postedOn);
  const [visible, setVisible] = useState(post.visible);
  const [tried, setTried] = useState(false);

  const dateBroken = !DATE_SHAPE.test(postedOn.trim());
  /* 두 줄이 넘어가는 자리. 세어 알리되 막지 않는다 — 정말 길어야 하는 글이 있다. */
  const tooLong = desc.trim().length > 60;

  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(desc.trim() ? [] : ['설명']),
    ...(dateBroken ? ['올린 날'] : []),
  ];

  return (
    <FnbRecordForm
      resource="마케팅 글"
      mode={mode}
      detail={`${findMarketingChannel(channelId)?.name ?? channelId} · ${title.trim()}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="어디에 올린 글인가" description="사이트 마케팅 화면에서 이 창구를 고른 사람에게 보입니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="글 번호" value={post.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="글 번호" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField label="창구" htmlFor="post-channel" required>
            <Dropdown
              id="post-channel"
              label="창구를 고르세요"
              value={channelId}
              onChange={setChannelId}
              options={CHANNEL_OPTIONS}
            />
          </FnbField>

          <FnbField
            label="올린 날"
            htmlFor="post-date"
            required
            hint="실제 그 창구에 올린 날을 적으세요. 사이트는 이 날짜가 늦은 것부터 세웁니다."
            {...(tried && dateBroken ? { error: '2026-08-05 처럼 적어 주세요.' } : {})}
          >
            <FnbTextInput
              id="post-date"
              value={postedOn}
              onChange={setPostedOn}
              placeholder="2026-08-05"
              invalid={tried && dateBroken}
            />
          </FnbField>

          <FnbField label="공개" hint="끄면 사이트에서 빠집니다. 지우는 것과 달리 되돌릴 수 있습니다.">
            <FnbToggle
              id="post-visible"
              checked={visible}
              onChange={setVisible}
              label="사이트에 걸기"
              description="끄면 마케팅 화면에서 빠집니다."
            />
          </FnbField>
        </div>
      </Panel>

      <Panel title="무슨 글인가" description="카드에 제목과 설명 두 줄로 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField
            label="제목"
            htmlFor="post-title"
            required
            hint="사진 자리에 이 제목의 첫 글자가 큰 글씨로 섭니다 — 사진이 들어오기 전까지."
            {...(tried && !title.trim() ? { error: '제목을 적어 주세요.' } : {})}
          >
            <FnbTextInput id="post-title" value={title} onChange={setTitle} invalid={tried && !title.trim()} />
          </FnbField>

          <FnbField
            label="설명"
            htmlFor="post-desc"
            required
            hint={
              tooLong
                ? `${desc.trim().length}자 — 카드에서 두 줄을 넘길 수 있습니다. 그대로 저장하셔도 됩니다.`
                : `${desc.trim().length}자 · 60자 안이면 카드에 두 줄로 섭니다.`
            }
            {...(tried && !desc.trim() ? { error: '설명을 적어 주세요.' } : {})}
          >
            <FnbTextArea id="post-desc" value={desc} onChange={setDesc} rows={3} invalid={tried && !desc.trim()} />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
