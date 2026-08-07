'use client';

import { useState } from 'react';
import { SITE_BANNERS, type SiteBanner } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrTextInput,
  IrToggle,
  type FormMode,
} from '@/app/_components/IrRecordForm';

/**
 * 배너 등록 · 수정 — **메인 비주얼과 팝업이 같은 화면을 쓴다.**
 *
 * ## 왜 한 벌인가
 * 둘은 서는 자리만 다르고 갖는 값이 같다(제목 · 기간 · 노출). 화면을 나누면 기간을 다루는
 * 규칙이 두 벌이 되고, **한쪽만 고친 채 반년이 지난다.** 자리는 `slot` 으로 받아 문구만 바꾼다.
 *
 * ## 기간이 지난 것을 화면이 먼저 말한다
 * 배너의 사고는 늘 같다 — **끝난 배너가 그대로 걸려 있는 것.** 지난 행사 안내가 첫 화면에 서
 * 있으면 회사가 관리되지 않는다는 인상을 주고, 그 사실은 대개 밖에서 먼저 알려 온다. 그래서
 * 끝난 날을 적는 순간 그 자리에서 알린다.
 *
 * ## 끝을 비우면 계속 선다
 * 상시 배너가 실제로 있다. 다만 비워 두면 **잊힌다** — 그래서 비운 것이 실수가 아니라 뜻이라는
 * 것을 적어 두게 안내 문구를 남긴다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function BannerForm({
  mode,
  slot,
  code,
  today,
  initial,
}: {
  mode: FormMode;
  slot: SiteBanner['slot'];
  code: string;
  /** 오늘 — 서버가 없으므로 화면 밖에서 받는다 */
  today: string;
  initial?: SiteBanner;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startAt, setStartAt] = useState(initial?.startAt ?? '');
  const [endAt, setEndAt] = useState(initial?.endAt ?? '');
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [tried, setTried] = useState(false);

  const backwards = Boolean(startAt) && Boolean(endAt) && endAt < startAt;
  const over = Boolean(endAt) && endAt < today;
  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(startAt ? [] : ['시작일']),
    ...(backwards ? ['종료일'] : []),
  ];

  const listHref = slot === '팝업' ? '/banners/popups' : '/banners';
  const where = slot === '팝업' ? '사이트에 뜨는 팝업' : '첫 화면의 배너';

  return (
    <IrRecordForm
      mode={mode}
      resource={slot}
      listHref={listHref}
      detail={`${code} · ${title.trim() || '(제목 없음)'} · ${startAt || '?'} ~ ${endAt || '계속'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="기본 정보" description={`${where}로 섭니다.`}>
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrReadonly label="배너 코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />
            <IrReadonly label="서는 자리" value={slot} note="메뉴가 정함" />
          </div>

          <IrField
            label="제목"
            htmlFor="banner-title"
            required
            {...(tried && !title.trim() ? { error: '제목을 입력해 주세요.' } : {})}
          >
            <IrTextInput
              id="banner-title"
              value={title}
              onChange={setTitle}
              placeholder="예: 2026 스마트팩토리 솔루션 페어"
              invalid={tried && !title.trim()}
            />
          </IrField>
        </div>
      </IrPanel>

      <IrPanel
        title="기간"
        description="이 기간에만 섭니다. 끝난 배너가 그대로 걸려 있는 것이 가장 흔한 사고입니다."
      >
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrField
              label="시작일"
              htmlFor="banner-start"
              required
              {...(tried && !startAt ? { error: '시작일을 골라 주세요.' } : {})}
            >
              <IrTextInput
                id="banner-start"
                type="date"
                value={startAt}
                onChange={setStartAt}
                invalid={tried && !startAt}
              />
            </IrField>

            <IrField
              label="종료일"
              htmlFor="banner-end"
              {...(backwards
                ? { error: '종료일이 시작일보다 앞섭니다.' }
                : { hint: '비우면 내릴 때까지 계속 섭니다 — 비운 것은 잊히기 쉽습니다.' })}
            >
              <IrTextInput
                id="banner-end"
                type="date"
                value={endAt}
                onChange={setEndAt}
                invalid={backwards}
              />
            </IrField>
          </div>

          {over && !backwards && (
            <p className="rounded-lg border border-signal-danger/40 bg-signal-danger/5 px-4 py-3 text-xs leading-relaxed text-ink-muted">
              이미 지난 기간입니다 (오늘 {today}). 저장해도 사이트에 서지 않습니다.
            </p>
          )}

          <IrToggle
            id="banner-visible"
            label="사이트에 노출"
            description="기간 안이어도 이것이 꺼져 있으면 서지 않습니다. 급히 내릴 때 쓰는 자리입니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>

      <IrPanel title={`지금 서 있는 ${slot}`} description="같은 기간에 여럿이 겹치는지 확인하세요.">
        <ul className="flex flex-col">
          {SITE_BANNERS.filter((one) => one.slot === slot && one.id !== initial?.id).map((one) => (
            <li
              key={one.id}
              className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                {one.startAt} ~ {one.endAt || '계속'}
              </span>
            </li>
          ))}
        </ul>
      </IrPanel>
    </IrRecordForm>
  );
}
