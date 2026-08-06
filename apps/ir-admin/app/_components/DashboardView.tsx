'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { DISCLOSURES, IR_SCHEDULES, LOCALE_PAIRS, STOCK, SUBSCRIBERS, missingEnglish, publicDisclosures, upcomingSchedules } from '@winpilot/store';
import { IrPanel, IrSummary } from './IrPanel';

/** 기준일. 서버가 없으므로 화면이 정한다 — 여러 화면이 다른 날을 쓰면 D-n 이 서로 어긋난다. */
const TODAY = '2026-08-06';

/**
 * IR 대시보드.
 *
 * 오늘 손대야 할 것만 모은다. IR 담당자가 아침에 묻는 것은 셋이다 —
 * **내보내지 않은 원고가 있는가 · 다음 일정이 언제인가 · 영문이 빠진 자리가 있는가.**
 *
 * 여기서 정하는 값은 하나도 없다. 다른 화면이 만들어 낸 신호를 모아 보내는 자리다.
 */
export function DashboardView() {
  const draft = DISCLOSURES.filter((one) => one.state === '작성 중' || one.state === '검토 요청');
  const upcoming = upcomingSchedules(TODAY);
  const waiting = missingEnglish();
  const unverified = SUBSCRIBERS.filter((one) => !one.verified);

  return (
    <>
      <PageHeading title="대시보드" description="오늘 손대야 할 것을 먼저 확인하세요." />

      <IrSummary
        cards={[
          {
            label: '내보내지 않은 공시',
            value: `${draft.length}건`,
            tone: draft.length > 0 ? 'text-signal-danger' : '',
            hint: '원고와 검토 요청은 사이트에 나타나지 않습니다.',
          },
          {
            label: '공시된 것',
            value: `${publicDisclosures().length}건`,
            hint: '투자자 화면에 서 있는 공시입니다.',
          },
          {
            label: '다음 일정',
            value: upcoming[0] ? upcoming[0].at : '없음',
            hint: upcoming[0]?.title ?? '등록된 일정이 없습니다.',
          },
          {
            label: '영문이 빠진 자리',
            value: `${waiting.length}개`,
            tone: waiting.length > 0 ? 'text-signal-danger' : '',
            hint: '해외 투자자에게는 그 자리가 없는 것과 같습니다.',
          },
        ]}
      />

      <IrPanel title="주가" description="실시간이 아닙니다. 기준 시각을 함께 적습니다.">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 px-6 py-5">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{STOCK.price.toLocaleString('ko-KR')}원</p>
            <p
              className={`text-sm tabular-nums ${STOCK.change >= 0 ? 'text-signal-danger' : 'text-brand-700'}`}
            >
              {STOCK.change >= 0 ? '▲' : '▼'} {Math.abs(STOCK.change).toLocaleString('ko-KR')} ({STOCK.changeRate}%)
            </p>
          </div>
          <p className="font-mono text-xs tabular-nums text-ink-faint">{STOCK.at} 기준</p>
        </div>
      </IrPanel>

      <IrPanel
        title="손대야 할 것"
        description="여기 있는 것이 오늘 하지 않으면 밖에서 드러나는 일입니다."
      >
        <div className="flex flex-col">
          {draft.map((one) => (
            <div key={one.id} className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4 last:border-b-0">
              <Badge tone="wait">{one.state}</Badge>
              <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
              <span className="shrink-0 font-mono text-xs text-ink-faint">{one.id}</span>
            </div>
          ))}

          {unverified.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4 last:border-b-0">
              <Badge tone="neutral">구독</Badge>
              <span className="min-w-0 flex-1 truncate text-sm">
                메일 확인을 마치지 않은 구독자 {unverified.length}명 — 알림이 가지 않습니다.
              </span>
            </div>
          )}

          {draft.length === 0 && unverified.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-ink-muted">오늘 손댈 것이 없습니다.</p>
          )}
        </div>
      </IrPanel>

      {/* 갯수가 0 이어도 카드를 숨기지 않는다 — 사라진 카드는 기능이 없어진 것으로 읽힌다. */}
      <IrPanel title="다가오는 일정" description="투자자 화면의 IR 일정에 그대로 섭니다.">
        <div className="flex flex-col">
          {upcoming.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-ink-muted">등록된 일정이 없습니다.</p>
          ) : (
            upcoming.map((one) => (
              <div key={one.id} className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4 last:border-b-0">
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">{one.at}</span>
                <Badge tone="neutral">{one.kind}</Badge>
                <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
              </div>
            ))
          )}
        </div>
      </IrPanel>
    </>
  );
}
