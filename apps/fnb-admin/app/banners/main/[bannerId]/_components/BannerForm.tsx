'use client';

import { useState } from 'react';
import { Panel } from '@winpilot/ui';
import type { FnbBanner } from '@winpilot/store';
import { FnbField, FnbReadonly, FnbRecordForm, FnbTextInput, FnbToggle } from '@/app/_components/FnbForm';
import { PeriodFields, dateBroken, periodBackwards } from '@/app/banners/_components/PeriodFields';

/**
 * 메인 비주얼 상세.
 *
 * ## 사진을 여기서 올리지 않는다
 * 사이트 첫 화면은 지금 사진 없이 큰 글자와 결로 서 있다. 올리는 자리를 먼저 만들어 두면
 * **저장은 되는데 첫 화면은 그대로인** 상태가 생기고, 그때는 올린 사람이 자기가 뭘 잘못했는지
 * 찾는다. 사진을 실제로 거는 날 이 판에 한 칸이 는다.
 *
 * ## 가는 곳을 비울 수 있다
 * 브랜드를 말하기만 하는 배너가 있다. 그때 억지로 주소를 넣게 하면 `/` 같은 값이 들어가고,
 * 그러면 **누를 수 있어 보이는데 눌러도 제자리인** 배너가 된다.
 *
 * ## 저장을 막는 것과 알리는 것을 가른다
 * 제목과 시작일이 없으면 막는다 — 없으면 배너가 성립하지 않는다. 기간이 거꾸로인 것은 알리기만
 * 한다. 실수인 것이 거의 확실하지만, **적어 두고 나중에 고치는 일**이 실제로 있다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function BannerForm({ banner, mode = 'edit' }: { banner: FnbBanner ; mode?: 'edit' | 'create' }) {
  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle);
  const [href, setHref] = useState(banner.href);
  const [startAt, setStartAt] = useState(banner.startAt);
  const [endAt, setEndAt] = useState(banner.endAt);
  const [visible, setVisible] = useState(banner.visible);
  const [tried, setTried] = useState(false);

  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(dateBroken(startAt) ? ['시작'] : []),
    ...(endAt.trim() !== '' && dateBroken(endAt) ? ['종료'] : []),
  ];

  return (
    <FnbRecordForm
      resource="메인 비주얼"
      mode={mode}
      detail={`${title.trim()} · ${startAt} ~ ${endAt || '상시'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="무슨 배너인가" description="첫 화면의 큰 글씨와 그 아래 한 줄입니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="배너 번호" value={banner.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="배너 번호" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField
            label="제목"
            htmlFor="banner-title"
            required
            hint="첫 화면에서 가장 큰 글씨입니다. 한 줄에 담기게 짧게 적으세요."
            {...(tried && !title.trim() ? { error: '제목을 적어 주세요.' } : {})}
          >
            <FnbTextInput id="banner-title" value={title} onChange={setTitle} invalid={tried && !title.trim()} />
          </FnbField>

          <FnbField label="한 줄" htmlFor="banner-sub" hint="없어도 됩니다. 제목만으로 다 말하는 배너가 있습니다.">
            <FnbTextInput id="banner-sub" value={subtitle} onChange={setSubtitle} />
          </FnbField>

          <FnbField
            label="가는 곳"
            htmlFor="banner-href"
            hint="비우면 누를 수 없는 배너가 됩니다. `/menu` 처럼 사이트 안 주소를 적으세요."
          >
            <FnbTextInput id="banner-href" value={href} onChange={setHref} placeholder="/menu" />
          </FnbField>
        </div>
      </Panel>

      <Panel title="언제 거나" description="시작과 종료가 지나면 사람이 손대지 않아도 오르내립니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <PeriodFields
            startAt={startAt}
            endAt={endAt}
            onStartChange={setStartAt}
            onEndChange={setEndAt}
            tried={tried}
          />

          <FnbField
            label="노출"
            hint={
              periodBackwards(startAt, endAt)
                ? '기간이 거꾸로라 켜 두어도 걸리지 않습니다.'
                : '끄면 기간과 상관없이 즉시 내려갑니다.'
            }
          >
            <FnbToggle
              id="banner-visible"
              checked={visible}
              onChange={setVisible}
              label="첫 화면에 걸기"
              description="끄면 기간과 상관없이 즉시 내려갑니다."
            />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
