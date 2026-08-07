'use client';

import { useState } from 'react';
import type { MediaClip } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrTextInput,
  type FormMode,
} from '@/app/_components/IrRecordForm';

const LIST = '/contents/news';

/** 썸네일 무늬를 가르는 값. 일곱을 넘기면 무늬가 되풀이된다. */
const SEEDS = [0, 1, 2, 3, 4, 5, 6];

/**
 * 뉴스 등록 · 수정.
 *
 * ## 제목에 검증되는 사실을 적지 않는다
 * 여기 적은 것이 그대로 회사 홈페이지에 실리고, 그 홈페이지는 IR 자료로도 읽힌다. 수상 ·
 * 수출 실적처럼 **밖에서 확인되는 숫자**를 제목으로 적으면 그것이 허위 기재가 될 수 있다.
 * 그래서 안내 문구를 칸 아래가 아니라 **칸 위**에 둔다 — 다 적고 난 뒤에 읽는 주의는 늦다.
 *
 * ## 썸네일을 고르는 자리
 * 영상 파일과 미리보기 그림이 아직 없어 도형 무늬로 대신한다. 무늬를 고르는 칸을 두는 이유는
 * 목록에서 **어느 것이 어느 것인지** 갈라 보이기 위해서다 — 전부 같은 무늬면 격자가 한 덩어리로
 * 보인다. 고른 무늬를 그 자리에서 그려 보여 준다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function NewsForm({
  mode,
  code,
  initial,
}: {
  mode: FormMode;
  code: string;
  initial?: MediaClip;
}) {
  const [channel, setChannel] = useState(initial?.channel ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [seed, setSeed] = useState(initial?.seed ?? 0);
  const [tried, setTried] = useState(false);

  const broken = [...(channel.trim() ? [] : ['갈래']), ...(title.trim() ? [] : ['제목'])];

  return (
    <IrRecordForm
      mode={mode}
      resource="뉴스"
      listHref={LIST}
      detail={`${code} · ${title.trim() || '(제목 없음)'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="기본 정보" description="홈 마지막 칸과 CS CENTER 뉴스에 함께 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <p className="rounded-lg border border-signal-danger/40 bg-signal-danger/5 px-4 py-3 text-xs leading-relaxed text-ink-muted">
            수상 · 수출 실적처럼 <strong className="font-semibold text-ink">밖에서 확인되는 숫자</strong>를
            제목에 적지 마세요. 이 화면의 값은 회사 홈페이지에 그대로 실리고, 그 홈페이지는 IR 자료로도
            읽힙니다.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrReadonly label="뉴스 코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />

            <IrField
              label="갈래"
              htmlFor="news-channel"
              required
              {...(tried && !channel.trim()
                ? { error: '갈래를 입력해 주세요.' }
                : { hint: '어디에 실렸는지 — 방송사 · 행사 이름입니다.' })}
            >
              <IrTextInput
                id="news-channel"
                value={channel}
                onChange={setChannel}
                placeholder="예: 기업 브랜드 영상"
                invalid={tried && !channel.trim()}
              />
            </IrField>
          </div>

          <IrField
            label="제목"
            htmlFor="news-title"
            required
            {...(tried && !title.trim() ? { error: '제목을 입력해 주세요.' } : {})}
          >
            <IrTextInput
              id="news-title"
              value={title}
              onChange={setTitle}
              placeholder="예: Cloud MES — 설비 신호가 표준 데이터가 되기까지"
              invalid={tried && !title.trim()}
            />
          </IrField>
        </div>
      </IrPanel>

      <IrPanel title="썸네일" description="영상 파일이 아직 없어 도형 무늬로 대신합니다.">
        <div className="flex flex-wrap gap-3 px-6 py-5">
          {SEEDS.map((one) => (
            <button
              key={one}
              type="button"
              onClick={() => setSeed(one)}
              aria-pressed={one === seed}
              className={`w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-150 ${
                one === seed ? 'border-brand-500' : 'border-transparent hover:border-border-strong'
              }`}
            >
              <span className="block aspect-video">
                <ClipPattern seed={one} />
              </span>
            </button>
          ))}
        </div>
      </IrPanel>
    </IrRecordForm>
  );
}

/**
 * 미리보기 무늬.
 *
 * 투자자 화면이 그리는 것과 **같은 계산**이다. 여기서만 다르게 그리면 고를 때 본 것과 사이트에
 * 서는 것이 달라, 고르는 일 자체가 뜻을 잃는다.
 */
function ClipPattern({ seed }: { seed: number }) {
  const angle = 20 + seed * 25;

  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden className="size-full">
      <rect width="320" height="180" fill="#0b1526" />
      <g transform={`rotate(${angle} 160 90)`}>
        {SEEDS.map((index) => (
          <line
            key={index}
            x1={-40 + index * 60}
            y1={-60}
            x2={-40 + index * 60}
            y2={240}
            stroke={index === seed % 7 ? '#38bdf8' : 'rgba(148,163,184,0.28)'}
            strokeWidth={index === seed % 7 ? 3 : 1.5}
          />
        ))}
      </g>
    </svg>
  );
}
