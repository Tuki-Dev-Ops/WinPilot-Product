'use client';

import { useMemo, useState } from 'react';
import { PageHeading } from '@winpilot/ui';
import {
  DISCLOSURES,
  SITE_INQUIRIES,
  SITE_NOTICES,
  SITE_REGIONS,
  VISIT_TREND,
} from '@winpilot/store';
import { TODAY } from '@/lib/today';
import { IrPanel } from './IrPanel';
import { KoreaMap } from './KoreaMap';

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
 * IR 대시보드 — **등록 현황과 지역 분포, 둘뿐이다.**
 *
 * ## 왜 둘만 남겼나
 * 아침에 여는 사람이 묻는 것은 둘이다 — **얼마나 들어왔는가**, 그리고 **어디서 들어왔는가.**
 * 그 아래에 많이 본 화면 · 주가 · 다음 일정을 늘어놓았더니, 화면이 길어진 만큼 **아무것도
 * 먼저 보이지 않게** 되었다. 셋 다 자기 갈래에 제 화면이 있다(통계 · IR). 대시보드가 그것을
 * 한 번 더 보여 주는 동안 하는 일은 요약이 아니라 되풀이다.
 *
 * ## 기간과 누적을 나란히 적는다
 * 큰 숫자 아래에 작은 `/ 누적` 을 붙인다. 이번 달 문의 12건은 그 자체로는 많은지 적은지
 * 말해 주지 않는다 — **누적 옆에 놓여야** 이번 달이 평소보다 나은지 알 수 있고, 그 판단이
 * 곧 오늘 무엇을 할지를 정한다.
 *
 * ## 지도와 표를 나란히 둔다
 * 지도는 **어디가 비어 있는지**를 한눈에 말하고, 표는 **정확히 몇 건인지**를 말한다. 둘은
 * 다른 물음에 답하므로 위아래로 두면 하나를 볼 때 다른 하나가 화면 밖으로 나간다.
 *
 * ## 0건인 지역을 지우지 않는다
 * 지도와 표 모두 시 · 도 열일곱을 전부 세운다. 0 이 지워지면 **한 건도 오지 않은 지역**이
 * 화면에서 사라지는데, 그 지역이야말로 손대야 할 곳이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function DashboardView() {
  const [span, setSpan] = useState<Span>('기간');
  const [lens, setLens] = useState<LensId>('all');
  const [picked, setPicked] = useState<string | undefined>(undefined);

  /** 이번 달. 값이 `YYYY-MM-DD` 로 서 있어 앞 일곱 자로 자른다. */
  const month = TODAY.slice(0, 7);
  const inPeriod = (at: string) => span === '누적' || at.startsWith(month);

  const inquiries = SITE_INQUIRIES.filter((one) => inPeriod(one.receivedAt));
  const deals = inquiries.filter((one) => one.kind === '도입 · 견적');
  const support = inquiries.filter((one) => one.kind === '기술 지원');
  const waiting = inquiries.filter((one) => one.state !== '답변완료');
  const notices = SITE_NOTICES.filter((one) => one.visible && inPeriod(one.postedAt));
  const draft = DISCLOSURES.filter((one) => one.state === '작성 중' || one.state === '검토 요청');

  const last = VISIT_TREND[VISIT_TREND.length - 1];
  const visits = span === '누적' ? VISIT_TREND.reduce((sum, one) => sum + one.visits, 0) : (last?.visits ?? 0);
  const allVisits = VISIT_TREND.reduce((sum, one) => sum + one.visits, 0);

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
    const box: Record<string, number> = {};
    for (const one of byRegion) box[one.region] = one.count;
    return box;
  }, [byRegion]);

  const shown = picked ? byRegion.filter((one) => one.region === picked) : byRegion;

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
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-brand px-5 py-5 text-white">
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
              counts={counts}
              {...(picked ? { picked } : {})}
              onPick={(region) => setPicked(region === picked ? undefined : region)}
            />
            <p className="text-center text-xs leading-relaxed text-ink-muted">
              칸 하나가 시 · 도 하나입니다. 자리는 실제 지리를 따르고, 크기는 숫자를 읽을 수 있게
              고정했습니다 — 넓이대로 그리면 세종과 광주가 손톱만 해집니다.
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
