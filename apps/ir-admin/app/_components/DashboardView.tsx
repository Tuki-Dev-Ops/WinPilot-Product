'use client';

import { useMemo, useState } from 'react';
import { PageHeading } from '@winpilot/ui';
import { DISCLOSURES, SITE_INQUIRIES, SITE_NOTICES, SITE_REGIONS } from '@winpilot/store';
import type { KoreaShape } from '@/lib/geo/korea';
import { TODAY } from '@/lib/today';
import { IrPanel } from './IrPanel';
import { KoreaMap } from './KoreaMap';

/**
 * 볼 기간 — 오늘 · 최근 7일 · 이번 달.
 *
 * 셋으로 둔다. 날짜를 직접 고르는 달력을 두면 **매번 두 번 눌러야** 숫자가 나오고, 이 화면에서
 * 하는 일은 대개 "어제까지와 견줘 오늘 어떤가" 라 그만한 자유가 필요 없다. 더 잘게 보는 자리는
 * 통계 갈래에 따로 있다.
 */
const SPANS = [
  { id: 'day', label: '일', note: '오늘' },
  { id: 'week', label: '주', note: '최근 7일' },
  { id: 'month', label: '월', note: '이번 달' },
] as const;
type SpanId = (typeof SPANS)[number]['id'];

/**
 * 그 기간이 언제부터인가 — `YYYY-MM-DD`.
 *
 * `TODAY` 라는 **고정된 글자**에서 세므로 서버와 브라우저가 같은 답을 낸다. 화면이 `new Date()`
 * 를 읽으면 그 둘이 갈리고, 자정을 넘기는 순간 한쪽만 날짜가 바뀐다.
 */
function since(span: SpanId): string {
  if (span === 'month') return `${TODAY.slice(0, 7)}-01`;
  if (span === 'day') return TODAY;

  const day = new Date(`${TODAY}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 6);
  return day.toISOString().slice(0, 10);
}

/** 지역 분포를 무엇으로 셀지. 한 표에 셋을 다 넣으면 어느 숫자를 보는지 흐려진다. */
const LENSES = [
  { id: 'all', label: '전체 문의' },
  { id: 'deal', label: '도입 · 견적' },
  { id: 'waiting', label: '답변 대기' },
] as const;
type LensId = (typeof LENSES)[number]['id'];

/**
 * IR 대시보드 — **등록 현황과 지역 분포, 둘뿐이다.**
 *
 * ## 왜 둘만 남겼나
 * 아침에 여는 사람이 묻는 것은 둘이다 — **얼마나 들어왔는가**, 그리고 **어디서 들어왔는가.**
 * 그 아래에 많이 본 화면 · 주가 · 다음 일정을 늘어놓았더니, 화면이 길어진 만큼 **아무것도
 * 먼저 보이지 않게** 되었다. 셋 다 자기 갈래에 제 화면이 있다(통계 · IR). 대시보드가 그것을
 * 한 번 더 보여 주는 동안 하는 일은 요약이 아니라 되풀이다.
 *
 * ## 기간과 전체를 나란히 적는다
 * 큰 숫자 아래에 작은 `/ 전체` 를 붙인다. 이번 달 문의 4건은 그 자체로는 많은지 적은지
 * 말해 주지 않는다 — **전체 옆에 놓여야** 이번 달이 평소보다 나은지 알 수 있고, 그 판단이
 * 곧 오늘 무엇을 할지를 정한다.
 *
 * ## 지도와 표를 나란히 둔다
 * 지도는 **어디가 비어 있는지**를 한눈에 말하고, 표는 **정확히 몇 건인지**를 말한다. 둘은
 * 다른 물음에 답하므로 위아래로 두면 하나를 볼 때 다른 하나가 화면 밖으로 나간다.
 *
 * 경계선은 서버에서 옮겨진 채 `shapes` 로 들어온다 — 이 화면은 좌표를 들고 있지 않다.
 *
 * ## 0건인 지역을 지우지 않는다
 * 지도와 표 모두 시 · 도 열일곱을 전부 세운다. 0 이 지워지면 **한 건도 오지 않은 지역**이
 * 화면에서 사라지는데, 그 지역이야말로 손대야 할 곳이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function DashboardView({
  shapes,
  box,
}: {
  /** 서버에서 화면 좌표로 옮겨 온 시 · 도 경계선 */
  shapes: KoreaShape[];
  box: { width: number; height: number };
}) {
  const [span, setSpan] = useState<SpanId>('month');
  const [lens, setLens] = useState<LensId>('all');
  const [picked, setPicked] = useState<string | undefined>(undefined);

  /*
    값이 `2026-08-05` 또는 `2026-08-05 09:41` 로 서 있다. 둘 다 앞 열 자가 날짜이고 사전순
    비교가 곧 날짜 비교라, 날짜로 되돌리지 않고 글자로 견준다.
  */
  const from = since(span);
  const inPeriod = (at: string) => at.slice(0, 10) >= from && at.slice(0, 10) <= TODAY;

  const inquiries = SITE_INQUIRIES.filter((one) => inPeriod(one.receivedAt));
  const deals = inquiries.filter((one) => one.kind === '도입 · 견적');
  const support = inquiries.filter((one) => one.kind === '기술 지원');
  const waiting = inquiries.filter((one) => one.state !== '답변완료');
  const notices = SITE_NOTICES.filter((one) => one.visible && inPeriod(one.postedAt));
  const draft = DISCLOSURES.filter((one) => one.state === '작성 중' || one.state === '검토 요청');

  /** 지역별 건수. 고른 잣대에 따라 세는 대상만 바뀌고 표의 뼈대는 그대로다. */
  const byRegion = useMemo(() => {
    const source = lens === 'deal' ? deals : lens === 'waiting' ? waiting : inquiries;

    return SITE_REGIONS.map((region) => ({
      region,
      count: source.filter((one) => one.region === region).length,
      deal: deals.filter((one) => one.region === region).length,
      waiting: waiting.filter((one) => one.region === region).length,
    }));
  }, [lens, inquiries, deals, waiting]);

  /** 지도가 받는 모양 — 이름 → 건수. */
  const counts = useMemo(() => {
    const found: Record<string, number> = {};
    for (const one of byRegion) found[one.region] = one.count;
    return found;
  }, [byRegion]);

  const shown = picked ? byRegion.filter((one) => one.region === picked) : byRegion;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading title="대시보드" description={`${TODAY} 기준입니다.`} />

        {/* 고른 기간이 실제로 언제부터인지 옆에 적는다 — `주` 만으로는 어디서 끊는지 알 수 없다. */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border-strong p-1">
            {SPANS.map((one) => (
              <button
                key={one.id}
                type="button"
                onClick={() => setSpan(one.id)}
                aria-pressed={one.id === span}
                title={one.note}
                className={`h-8 w-10 rounded text-xs transition-colors duration-150 ${
                  one.id === span ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {one.label}
              </button>
            ))}
          </div>
          <p className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">
            {from} ~ {TODAY}
          </p>
        </div>
      </div>

      {/*
        여섯을 **한 줄**에 세운다. 두 줄로 접히면 아랫줄이 윗줄의 곁가지처럼 보여, 문의와
        공시 원고가 서로 다른 무게로 읽힌다. 여기 있는 여섯은 전부 같은 무게의 숫자다.

        방문 수는 뺐다. 이 화면에서 보는 것은 **손대야 할 일의 수**이고, 방문은 그 일이 아니다 —
        많이 왔다고 오늘 할 일이 늘지 않는다. 방문은 통계 갈래가 다룬다.
      */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="문의" value={inquiries.length} total={SITE_INQUIRIES.length} />
        <Stat
          label="도입 · 견적"
          value={deals.length}
          total={SITE_INQUIRIES.filter((one) => one.kind === '도입 · 견적').length}
        />
        <Stat
          label="기술 지원"
          value={support.length}
          total={SITE_INQUIRIES.filter((one) => one.kind === '기술 지원').length}
        />
        <Stat
          label="답변 대기"
          value={waiting.length}
          total={SITE_INQUIRIES.filter((one) => one.state !== '답변완료').length}
          urgent={waiting.length > 0}
        />
        <Stat label="공지" value={notices.length} total={SITE_NOTICES.filter((one) => one.visible).length} />
        <Stat label="공시 원고" value={draft.length} total={DISCLOSURES.length} urgent={draft.length > 0} />
      </div>

      <IrPanel
        title="지역 분포"
        description="문의를 보낸 회사가 있는 시 · 도입니다. 방문 일정을 잡는 데 씁니다."
        aside={
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border-strong p-1">
            {LENSES.map((one) => (
              <button
                key={one.id}
                type="button"
                onClick={() => setLens(one.id)}
                aria-pressed={one.id === lens}
                className={`h-8 rounded px-3 text-xs transition-colors duration-150 ${
                  one.id === lens ? 'bg-surface font-medium text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {one.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-2">
          {/* 왼쪽 — 정확히 몇 건인지. */}
          <div className="flex min-w-0 flex-col border-b border-border xl:border-b-0 xl:border-r">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <p className="text-sm font-medium">
                {picked ?? '전국'}
                <span className="ml-2 font-mono text-xs font-normal tabular-nums text-ink-faint">
                  {shown.reduce((sum, one) => sum + one.count, 0)}건
                </span>
              </p>
              {picked && (
                <button
                  type="button"
                  onClick={() => setPicked(undefined)}
                  className="h-8 shrink-0 rounded-lg border border-border-strong px-3 text-xs text-ink-muted transition-colors duration-150 hover:border-ink-faint hover:text-ink"
                >
                  전체 보기
                </button>
              )}
            </div>

            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-96 border-collapse text-sm">
                <thead>
                  <tr className="border-y border-border text-xs text-ink-faint">
                    <th scope="col" className="px-6 py-3 text-left font-medium">지역</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">문의</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">도입 · 견적</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">답변 대기</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((one) => (
                    <tr
                      key={one.region}
                      onClick={() => setPicked(one.region === picked ? undefined : one.region)}
                      className={`cursor-pointer border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface ${
                        one.count === 0 ? 'text-ink-faint' : ''
                      } ${one.region === picked ? 'bg-surface' : ''}`}
                    >
                      <th scope="row" className="px-6 py-3 text-left font-normal">{one.region}</th>
                      <td className="px-6 py-3 text-right font-mono tabular-nums">{one.count}</td>
                      <td className="px-6 py-3 text-right font-mono tabular-nums">{one.deal}</td>
                      <td className="px-6 py-3 text-right font-mono tabular-nums">{one.waiting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 오른쪽 — 어디가 비어 있는지. */}
          <div className="flex min-w-0 flex-col items-center gap-4 px-6 py-6 text-brand">
            <KoreaMap
              shapes={shapes}
              box={box}
              counts={counts}
              {...(picked ? { picked } : {})}
              onPick={(region) => setPicked(region === picked ? undefined : region)}
            />
            <p className="text-center text-xs leading-relaxed text-ink-muted">
              통계청 2018년 시 · 도 경계입니다. 옅게 깔린 곳은 아직 한 건도 오지 않은 지역이고,
              마우스를 올리거나 누르면 어디인지 나옵니다.
            </p>
          </div>
        </div>
      </IrPanel>
    </>
  );
}

/**
 * 숫자 한 칸.
 *
 * ## 두 숫자를 한 줄에 둔다
 * 이 기간의 값과 `/ 전체` 를 나란히 세운다. 위아래로 나누면 **읽는 눈이 두 번 멈추고**, 여섯
 * 칸이 서면 그 멈춤이 열두 번이 된다. 견주라고 놓은 두 숫자는 견줄 수 있는 자리에 있어야 한다.
 *
 * 크기는 다르게 둔다. 같은 크기면 어느 쪽이 이 기간 것인지 매번 읽어야 하고, 전체를 빼면
 * 이 기간 숫자가 많은지 적은지 판단할 기준이 없다.
 */
function Stat({
  label,
  value,
  total,
  urgent,
}: {
  label: string;
  value: number;
  total: number;
  /** 0 이 아니면 손대야 하는 값. 색은 붉게 하되 글자로도 알 수 있게 라벨을 바꾸지는 않는다 */
  urgent?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-border bg-canvas px-4 py-4">
      <p className="min-w-0 truncate text-xs text-ink-muted">{label}</p>
      <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span
          className={`text-2xl font-semibold tabular-nums ${urgent && value > 0 ? 'text-signal-danger' : ''}`}
        >
          {value}
        </span>
        <span className="text-xs text-ink-muted">건</span>
        <span className="font-mono text-xs tabular-nums text-ink-faint">/ {total}건</span>
      </p>
    </div>
  );
}
