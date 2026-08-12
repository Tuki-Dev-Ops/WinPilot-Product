'use client';

import { useState } from 'react';
import { MARKETING_CHANNELS, postsOfChannel } from '@winpilot/store';
import { AsidePicker } from '@/app/_components/AsidePicker';
import { PhotoSlot } from '@/app/_components/PhotoSlot';

/**
 * 마케팅 — **왼쪽에 창구, 오른쪽에 올라간 글.**
 *
 * ## 표가 아니라 실제로 올라간 것을 보여 준다
 * 한때 이 자리에 `본사 부담 / 분담 / 점주 부담` 표가 있었다. 계약 조건으로는 맞는 말이었지만,
 * 마케팅을 보러 온 사람이 실제로 묻는 것은 **이 브랜드가 밖에서 어떻게 보이는가**였다. 부담이
 * 어떻게 갈리는지는 창업 안내의 비용 표와 계약 전 정보공개서가 답할 자리다.
 *
 * ## 창구를 왼쪽에 세운다
 * 둘뿐이라 위에 가로로 놓아도 된다. 그런데 오른쪽이 **사진 카드 격자**라 위가 가로 줄이면
 * 그 줄과 첫 카드 행이 붙어 어디까지가 고르는 자리인지 흐려진다. 왼쪽에 세우면 격자가 통째로
 * 오른쪽 판이 된다 — 고객센터 · 창업 문의와 같은 배치다.
 *
 * 기둥에는 창구 이름만 세운다. 한때 계정 이름(`@spaceplanning.kr`)을 아래 함께 적었는데,
 * **누를 수 없는 주소**가 눌러 보고 싶게 생긴 자리에 서 있었다 — 이름 둘이 겹쳐 어느 것이
 * 고르는 자리인지도 흐려졌다. 무엇을 올리는 곳인지는 오른쪽 맨 윗줄이 한 문장으로 말한다.
 *
 * 기둥 자체는 `AsidePicker` 가 갖는다 — 메뉴판 · 창업 문의와 같은 것이다. 여기만 개수를 적지
 * 않는데, 창구를 고를 때 재는 것이 글이 몇인가가 아니라 **어떤 곳인가**이기 때문이다.
 */
export function ChannelFeed() {
  const [channelId, setChannelId] = useState(MARKETING_CHANNELS[0]?.id ?? '');
  const channel = MARKETING_CHANNELS.find((one) => one.id === channelId);
  const posts = postsOfChannel(channelId);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <AsidePicker
        choices={MARKETING_CHANNELS.map((one) => ({ id: one.id, label: one.name }))}
        picked={channelId}
        onPick={setChannelId}
        width="lg:w-56"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-6">
          {channel && <p className="text-sm leading-relaxed text-ink-muted">{channel.note}</p>}

          {posts.length === 0 ? (
            <p className="rounded-2xl border border-border px-6 py-16 text-center text-sm text-ink-muted">
              아직 올라온 글이 없습니다.
            </p>
          ) : (
            /*
              카드가 링크가 아니다. 계정 주소를 아직 갖고 있지 않아서인데(`MARKETING_CHANNELS`
              머리말), 누를 수 있는 것처럼 보이게 두면 눌러 본 사람이 고장으로 읽는다. 그래서
              `hover` 도 넣지 않는다 — 움직이지 않는 것이 누를 수 없다는 말이 된다.
            */
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((one) => (
                <li
                  key={one.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border"
                >
                  <PhotoSlot name={one.title} />

                  <span className="flex flex-1 flex-col gap-2 px-5 py-4">
                    <span className="text-base font-semibold">{one.title}</span>
                    <span className="text-sm leading-relaxed text-ink-muted">{one.desc}</span>
                    <span className="mt-auto pt-2 font-mono text-xs tabular-nums text-ink-faint">
                      {one.postedOn}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
