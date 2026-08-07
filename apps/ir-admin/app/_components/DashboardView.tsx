'use client';

import { useMemo, useState } from 'react';
import { Badge, PageHeading } from '@winpilot/ui';
import {
  DISCLOSURES,
  PAGE_VISITS,
  SITE_INQUIRIES,
  SITE_NOTICES,
  SITE_REGIONS,
  STOCK,
  VISIT_TREND,
  missingEnglish,
  upcomingSchedules,
} from '@winpilot/store';
import { IrPanel } from './IrPanel';

/** 기준일. 서버가 없으므로 화면이 정한다 — 여러 화면이 다른 날을 쓰면 D-n 이 서로 어긋난다. */
const TODAY = '2026-08-06';

/** 기간을 고르는 두 갈래. 값은 `기간`(이번 달)과 `누적`(전체) 둘뿐이라 드롭다운을 두지 않는다. */
const SPANS = ['기간', '누적'] as const;
type Span = (typeof SPANS)[number];

/** 지역 분포를 무엇으로 셀지. 한 표에 셋을 다 넣으면 어느 숫자를 보는지 흐려진다. */
const LENSES = [
  { id: 'all', label: '전체 문의' },
  { id: 'deal', label: '도입 · 견적' },
  { id: 'waiting', label: '답변 대기' },
] as const;
type LensId = (typeof LENSES)[number]['id'];

/**
 * IR 대시보드.
 *
 * ## 위에 등록 현황, 아래에 지역 분포
 * 아침에 여는 사람이 묻는 것은 둘이다 — **얼마나 들어왔는가**, 그리고 **어디서 들어왔는가.**
 * 앞은 숫자 줄로, 뒤는 막대와 표로 답한다.
 *
 * ## 기간과 누적을 나란히 적는다
 * 큰 숫자 아래에 작은 `/ 누적` 을 붙인다. 이번 달 문의 12건은 그 자체로는 많은지 적은지
 * 말해 주지 않는다 — **누적 옆에 놓여야** 이번 달이 평소보다 나은지 알 수 있고, 그 판단이
 * 곧 오늘 무엇을 할지를 정한다.
 *
 * ## 지역을 지도가 아니라 막대와 표로 그린다
 * 지도를 그리면 눈에는 좋지만, 여기서 실제로 하는 일은 **어느 지역에 사람을 보낼지**를 정하는
 * 것이다. 그 판단에 필요한 것은 지역 이름과 건수를 나란히 견주는 것이고, 지도는 크기가 작은
 * 시·도(세종·광주)를 눌러 그 숫자를 지운다. 게다가 지도 그림은 우리가 그린 것이 정확한지
 * 확인할 방법이 없다 — 틀린 경계선을 콘솔에 두는 것보다 표가 낫다.
 *
 * ## 0건인 지역을 지우지 않는다
 * 표는 시·도 열일곱을 전부 세운다. 0 이 지워지면 **한 건도 오지 않은 지역**이 화면에서
 * 사라지는데, 그 지역이야말로 손대야 할 곳이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function DashboardView() {
  const [span, setSpan] = useState<Span>('기간');
  const [lens, setLens] = useState<LensId>('all');

  /** 이번 달. 값이 `YYYY-MM-DD` 로 서 있어 앞 일곱 자로 자른다. */
  const month = TODAY.slice(0, 7);
  const inPeriod = (at: string) => span === '누적' || at.startsWith(month);

  const inquiries = SITE_INQUIRIES.filter((one) => inPeriod(one.receivedAt));
  const deals = inquiries.filter((one) => one.kind === '도입 · 견적');
  const support = inquiries.filter((one) => one.kind === '기술 지원');
  const waiting = inquiries.filter((one) => one.state !== '답변완료');
  const notices = SITE_NOTICES.filter((one) => one.visible && inPeriod(one.postedAt));

  const last = VISIT_TREND[VISIT_TREND.length - 1];
  const visits = span === '누적' ? VISIT_TREND.reduce((sum, one) => sum + one.visits, 0) : (last?.visits ?? 0);
  const allVisits = VISIT_TREND.reduce((sum, one) => sum + one.visits, 0);

  /** 지역별 건수. 고른 잣대에 따라 세는 대상만 바뀌고 표의 뼈대는 그대로다. */
  const byRegion = useMemo(() => {
    const source =
      lens === 'deal' ? deals : lens === 'waiting' ? waiting : inquiries;

    return SITE_REGIONS.map((region) => ({
      region,
      count: source.filter((one) => one.region === region).length,
      deal: deals.filter((one) => one.region === region).length,
      waiting: waiting.filter((one) => one.region === region).length,
    }));
  }, [lens, inquiries, deals, waiting]);

  /** 막대는 값이 있는 곳만 그린다 — 0 이 열둘 서면 있는 막대가 묻힌다. 표에는 전부 남는다. */
  const bars = byRegion.filter((one) => one.count > 0).sort((a, b) => b.count - a.count);
  const top = bars.reduce((most, one) => Math.max(most, one.count), 1);

  const draft = DISCLOSURES.filter((one) => one.state === '작성 중' || one.state === '검토 요청');
  const upcoming = upcomingSchedules(TODAY);
  const noEnglish = missingEnglish();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading title="대시보드" description={`${TODAY} 기준입니다.`} />

        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border-strong p-1">
          {SPANS.map((one) => (
            <button
              key={one}
              type="button"
              onClick={() => setSpan(one)}
              aria-pressed={one === span}
              className={`h-8 rounded px-3 text-xs transition-colors duration-150 ${
                one === span ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {one === '기간' ? '이번 달' : '누적'}
            </button>
          ))}
        </div>
      </div>

      {/*
        왼쪽 한 장만 색을 채운다. 전부 칠하면 어느 숫자를 먼저 보라는 것인지 사라지고, 전부
        비우면 이 화면이 무엇을 재는 곳인지 첫눈에 잡히지 않는다.
      */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-brand px-5 py-5 text-white lg:row-span-1">
          <p className="text-sm font-medium">사이트 방문</p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums">{visits.toLocaleString('ko-KR')}</span>
            <span className="text-sm">회</span>
          </p>
          <p className="font-mono text-xs tabular-nums text-white/70">
            / 누적 {allVisits.toLocaleString('ko-KR')}회
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-3">
          <Stat label="문의" value={inquiries.length} total={SITE_INQUIRIES.length} />
          <Stat label="도입 · 견적" value={deals.length} total={SITE_INQUIRIES.filter((one) => one.kind === '도입 · 견적').length} />
          <Stat label="기술 지원" value={support.length} total={SITE_INQUIRIES.filter((one) => one.kind === '기술 지원').length} />
          <Stat
            label="답변 대기"
            value={waiting.length}
            total={SITE_INQUIRIES.filter((one) => one.state !== '답변완료').length}
            urgent={waiting.length > 0}
          />
          <Stat label="공지" value={notices.length} total={SITE_NOTICES.filter((one) => one.visible).length} />
          <Stat label="공시 원고" value={draft.length} total={DISCLOSURES.length} urgent={draft.length > 0} />
        </div>
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
        {bars.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-ink-muted">
            이 기간에 들어온 문의가 없습니다.
          </p>
        ) : (
          <div className="flex min-w-0 items-end gap-4 overflow-x-auto border-b border-border px-6 py-6">
            {bars.map((one) => (
              <div key={one.region} className="flex min-w-16 flex-1 flex-col items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-ink-muted">{one.count}</span>
                <span
                  className="w-full max-w-16 rounded-t bg-brand/80"
                  style={{ height: `${Math.round((one.count / top) * 120)}px` }}
                  aria-hidden
                />
                {/* 시·도 이름을 줄여 적는다 — `강원특별자치도` 가 그대로 서면 막대 폭이 이름에 끌려간다. */}
                <span className="text-center text-xs leading-tight text-ink-faint">{shortName(one.region)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-faint">
                <th scope="col" className="px-6 py-3 text-left font-medium">지역</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">문의</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">도입 · 견적</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">답변 대기</th>
              </tr>
            </thead>
            <tbody>
              {byRegion.map((one) => (
                <tr
                  key={one.region}
                  className={`border-b border-border last:border-b-0 ${one.count === 0 ? 'text-ink-faint' : ''}`}
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
      </IrPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <IrPanel title="많이 본 화면" description="이 화면들이 문의로 이어집니다.">
          <ol className="flex flex-col">
            {PAGE_VISITS.slice(0, 5).map((one) => (
              <li
                key={one.id}
                className="flex items-center gap-4 border-b border-border px-6 py-3.5 last:border-b-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="block min-w-0 truncate text-sm">{one.label}</span>
                  <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.route}</span>
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums">
                  {one.visits.toLocaleString('ko-KR')}
                </span>
              </li>
            ))}
          </ol>
        </IrPanel>

        <IrPanel title="손대야 할 것" description="오늘 하지 않으면 밖에서 드러나는 일입니다.">
          <ul className="flex flex-col">
            {waiting.slice(0, 3).map((one) => (
              <li
                key={one.id}
                className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0"
              >
                <Badge tone="wait">{one.state}</Badge>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {one.company} · {one.message}
                </span>
              </li>
            ))}

            {draft.map((one) => (
              <li
                key={one.id}
                className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0"
              >
                <Badge tone="danger">{one.state}</Badge>
                <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
              </li>
            ))}

            {noEnglish.length > 0 && (
              <li className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3.5 last:border-b-0">
                <Badge tone="danger">영문 없음</Badge>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {noEnglish.length}개 자리 — 해외 투자자에게는 없는 것과 같습니다.
                </span>
              </li>
            )}

            {waiting.length === 0 && draft.length === 0 && noEnglish.length === 0 && (
              <li className="px-6 py-16 text-center text-sm text-ink-muted">지금 손댈 것이 없습니다.</li>
            )}
          </ul>
        </IrPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <IrPanel title="주가" description="실시간이 아닙니다. 기준 시각을 함께 적습니다.">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 px-6 py-5">
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {STOCK.price.toLocaleString('ko-KR')}원
              </p>
              <p className={`text-sm tabular-nums ${STOCK.change >= 0 ? 'text-signal-danger' : 'text-brand-700'}`}>
                {STOCK.change >= 0 ? '▲' : '▼'} {Math.abs(STOCK.change).toLocaleString('ko-KR')} ({STOCK.changeRate}%)
              </p>
            </div>
            <p className="font-mono text-xs tabular-nums text-ink-faint">{STOCK.at} 기준</p>
          </div>
        </IrPanel>

        <IrPanel title="다음 일정" description="투자자 화면에 그대로 서 있는 일정입니다.">
          {upcoming.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-ink-muted">등록된 일정이 없습니다.</p>
          ) : (
            <ul className="flex flex-col">
              {upcoming.slice(0, 3).map((one) => (
                <li
                  key={one.id}
                  className="flex items-center gap-4 border-b border-border px-6 py-3.5 last:border-b-0"
                >
                  <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{one.at}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
                </li>
              ))}
            </ul>
          )}
        </IrPanel>
      </div>
    </>
  );
}

/**
 * 숫자 한 칸.
 *
 * 큰 숫자 아래 `/ 누적` 을 작게 붙인다. 두 숫자를 같은 크기로 두면 어느 쪽이 이번 달 것인지
 * 매번 읽어야 하고, 누적을 빼면 이번 달 숫자가 많은지 적은지 판단할 기준이 없다.
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
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-canvas px-4 py-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="flex items-baseline gap-1">
        <span
          className={`text-2xl font-semibold tabular-nums ${urgent && value > 0 ? 'text-signal-danger' : ''}`}
        >
          {value}
        </span>
        <span className="text-xs text-ink-muted">건</span>
      </p>
      <p className="font-mono text-xs tabular-nums text-ink-faint">/ {total}건</p>
    </div>
  );
}

/** 막대 아래 이름. `특별자치도` · `광역시` 같은 꼬리를 떼어 폭을 아낀다. */
function shortName(region: string): string {
  return region
    .replace('특별자치시', '')
    .replace('특별자치도', '')
    .replace('특별시', '')
    .replace('광역시', '')
    .replace('청북도', '북')
    .replace('청남도', '남')
    .replace('상북도', '북')
    .replace('상남도', '남')
    .replace('라남도', '남');
}
