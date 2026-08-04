import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `milestone.list` · B2C Client (템플릿 A) · route `/company/history`
 *
 * 회사 소개와 **별개 화면**이다 — 읽는 목적이 다르다.
 * 소개는 '무엇을 하는 회사인가', 연혁은 '어떻게 커 왔는가' 를 본다.
 *
 * **연도로 묶고 세로선으로 잇는다.** 날짜를 한 줄씩 늘어놓으면 2024 와 2026 사이가 몇 년인지
 * 세어야 알 수 있다. 연도를 크게 세워 두면 흐름이 눈으로 잡히고, 같은 해에 여러 일이 있었다는
 * 사실도 함께 보인다.
 *
 * 최근이 위로 온다 — 지금 어디까지 왔는지가 먼저 궁금하기 때문이다.
 *
 * ## 어드민 연동
 * - 연혁 항목(날짜 · 제목 · 설명) ← `b2c-admin` 회사 > 연혁 (`/company/milestones`)
 * - 숨김으로 둔 항목은 여기 오지 않는다
 * - 정렬은 어드민이 매긴 순서를 그대로 따른다 — 템플릿이 다시 정렬하지 않는다
 */
export const metadata: Metadata = { title: `${COPY.company.historyTitle} — ${CONTENT.seo.title}` };

export default function MilestoneListPage() {
  const { company } = CONTENT;

  // 'YYYY-MM' 또는 'YYYY.MM' 어느 모양으로 오든 앞 네 자리가 연도다.
  const years = [...new Set(company.milestones.map((milestone) => milestone.date.slice(0, 4)))];

  return (
    <SiteShell>
      <PageTitle title={COPY.company.historyTitle} description={company.name} />

      {company.milestones.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {years.map((year) => {
            const items = company.milestones.filter((milestone) => milestone.date.startsWith(year));

            return (
              <section key={year} className="flex flex-col gap-5 lg:flex-row lg:gap-12">
                {/* 연도는 왼쪽에 크게 세워 둔다 — 목록을 훑을 때 눈이 걸리는 자리다. */}
                <div className="shrink-0 lg:w-40">
                  <p className="text-[40px] font-bold leading-none tabular-nums tracking-tight">{year}</p>
                  <p className="mt-2 text-xs text-ink-faint">{items.length}건</p>
                </div>

                {/* 세로선은 한 줄로 흐르고, 항목마다 점이 얹힌다. */}
                <ol className="relative min-w-0 flex-1 border-l border-border pl-8">
                  {items.map((milestone) => (
                    <li key={milestone.id} className="relative pb-8 last:pb-0">
                      <span className="absolute -left-[35px] top-1.5 size-2.5 rounded-full border-2 border-canvas bg-brand-500" />

                      <p className="font-mono text-xs tabular-nums text-brand-700 dark:text-brand-300">
                        {milestone.date}
                      </p>
                      <p className="mt-1.5 text-base font-medium leading-snug">{milestone.title}</p>
                      {milestone.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{milestone.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}
