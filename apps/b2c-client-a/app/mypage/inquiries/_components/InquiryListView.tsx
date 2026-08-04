'use client';

import { useMemo, useState } from 'react';
import { COPY, pathLabel, type InquiryRecord } from '@winpilot/client-content';
import { SectionTabs } from '@/app/_components/SectionTabs';

/**
 * 문의 내역 — **상태 탭으로 나눠 본다.**
 *
 * 답변을 기다리는 문의와 이미 끝난 문의가 섞여 있으면, 매번 목록 전체를 훑어 어느 것이
 * 아직 답이 없는지 찾아야 한다. 기본은 전체이되 상태별로 몇 건인지가 탭에 함께 적힌다.
 *
 * ## 어드민 연동
 * - 목록·상태·답변 ← `b2c-admin` 문의 > 목록 (`/inquiries`) 과 **같은 기록**이다 (store `INQUIRIES`)
 * - 상태 이름(접수·처리중·답변완료·보류)은 어드민 화면과 글자까지 같다
 * - Path 는 문의 > 설정에 등록된 경로 이름으로 바꿔 보여 준다 (store `INQUIRY_PATHS`)
 */
const STATE_TONE: Record<string, string> = {
  접수: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  처리중: 'bg-surface text-ink-muted',
  답변완료: 'bg-signal-ok/12 text-signal-ok',
  보류: 'bg-signal-danger/12 text-signal-danger',
};

const STATES = ['접수', '처리중', '답변완료', '보류'] as const;

export function InquiryListView({ inquiries }: { inquiries: InquiryRecord[] }) {
  const [tabId, setTabId] = useState('all');

  const tabs = useMemo(
    () => [
      { id: 'all', label: '전체', count: inquiries.length },
      ...STATES.map((state) => ({
        id: state,
        label: state,
        count: inquiries.filter((inquiry) => inquiry.state === state).length,
      })),
    ],
    [inquiries],
  );

  const visible = tabId === 'all' ? inquiries : inquiries.filter((inquiry) => inquiry.state === tabId);

  return (
    <>
      <SectionTabs tabs={tabs} activeId={tabId} onSelect={setTabId} label={COPY.mypage.inquiries} />

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          {COPY.mypage.inquiryEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((inquiry) => (
            <article key={inquiry.id} className="flex flex-col gap-3 rounded-xl border border-border px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATE_TONE[inquiry.state] ?? 'bg-surface text-ink-muted'}`}
                >
                  {inquiry.state}
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                  {inquiry.category}
                </span>
                {/* 어느 화면에서 보냈는지 — 같은 제목의 문의가 여럿일 때 이것으로 갈린다. */}
                <span className="shrink-0 whitespace-nowrap text-xs text-ink-faint">{pathLabel(inquiry.path)}</span>
                <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-ink-faint">
                  {inquiry.createdAt}
                </span>
              </div>

              <h2 className="text-base font-semibold leading-snug">{inquiry.title}</h2>
              <p className="text-sm leading-relaxed text-ink-muted">{inquiry.message}</p>

              <div className="rounded-lg bg-surface px-4 py-3">
                <p className="text-xs font-medium text-ink-muted">
                  {COPY.mypage.inquiryAnswer}
                  {inquiry.answeredAt && (
                    <span className="ml-2 font-mono tabular-nums text-ink-faint">{inquiry.answeredAt}</span>
                  )}
                </p>
                {inquiry.answer ? (
                  // 답변 HTML 은 운영자가 어드민 에디터로 쓴 것이다 — 원문 그대로 보여 준다.
                  <div
                    className="prose-body mt-2 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: inquiry.answer }}
                  />
                ) : (
                  <p className="mt-2 text-sm text-ink-faint">{COPY.mypage.inquiryWaiting}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
