'use client';

import { FnbField, FnbTextInput } from '@/app/_components/FnbForm';

/** `2026-08-05` 꼴인가. 비어 있는 종료일은 `상시` 라는 뜻이라 통과시킨다. */
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

export function dateBroken(value: string): boolean {
  return !DATE_SHAPE.test(value.trim());
}

/** 시작이 종료보다 뒤인가. 글자 비교로 충분하다 — `YYYY-MM-DD` 는 사전순이 곧 날짜순이다. */
export function periodBackwards(startAt: string, endAt: string): boolean {
  return endAt.trim() !== '' && startAt.trim() > endAt.trim();
}

/**
 * 거는 기간 두 칸 — **배너와 팝업이 같은 것을 쓴다.**
 *
 * 두 화면의 규칙이 같다: 시작은 반드시 있고, 종료는 비우면 상시이며, 시작이 종료보다 뒤면 안
 * 된다. 화면마다 적으면 그 셋이 두 벌이 되고, 그러다 한쪽만 앞뒤 검사가 빠진다 — **기간을
 * 거꾸로 적은 배너는 영영 안 걸리는데**, 목록에서는 그냥 `종료` 로 보여 아무도 의심하지 않는다.
 *
 * 종료일을 비울 수 있게 두는 이유: 브랜드 소개 배너처럼 내릴 날을 정하지 않는 것이 있다.
 * 그때 먼 미래 날짜를 적게 두면(`2099-12-31`) 그 값이 진짜 계획인지 임시인지 알 수 없다.
 */
export function PeriodFields({
  startAt,
  endAt,
  onStartChange,
  onEndChange,
  tried,
}: {
  startAt: string;
  endAt: string;
  onStartChange: (next: string) => void;
  onEndChange: (next: string) => void;
  /** 저장을 한 번 눌렀는지. 누르기 전에는 붉은 글씨를 띄우지 않는다 */
  tried: boolean;
}) {
  const startBroken = dateBroken(startAt);
  const endBroken = endAt.trim() !== '' && dateBroken(endAt);
  const backwards = periodBackwards(startAt, endAt);

  return (
    <>
      <FnbField
        label="시작"
        htmlFor="period-start"
        required
        hint="이 날부터 걸립니다. 오늘보다 뒤면 목록에 `예정` 으로 섭니다."
        {...(tried && startBroken ? { error: '2026-08-05 처럼 적어 주세요.' } : {})}
      >
        <FnbTextInput
          id="period-start"
          value={startAt}
          onChange={onStartChange}
          placeholder="2026-08-05"
          invalid={tried && startBroken}
        />
      </FnbField>

      <FnbField
        label="종료"
        htmlFor="period-end"
        hint="비우면 상시입니다. 내릴 날이 정해져 있으면 적어 두세요 — 그날이 지나면 저절로 내려갑니다."
        {...(tried && endBroken ? { error: '2026-09-30 처럼 적거나 비워 주세요.' } : {})}
        {...(tried && !endBroken && backwards ? { error: '종료가 시작보다 앞입니다 — 이대로면 걸리지 않습니다.' } : {})}
      >
        <FnbTextInput
          id="period-end"
          value={endAt}
          onChange={onEndChange}
          placeholder="비우면 상시"
          invalid={tried && (endBroken || backwards)}
        />
      </FnbField>
    </>
  );
}
