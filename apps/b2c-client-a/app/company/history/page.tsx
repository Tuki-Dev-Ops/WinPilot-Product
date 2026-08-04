import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `milestone.list` · B2C Client (템플릿 A) · route `/company/history`
 *
 * 회사 소개와 **별개 화면**이다 — 읽는 목적이 다르다.
 * 소개는 '무엇을 하는 회사인가', 연혁은 '어떻게 커 왔는가' 를 본다.
 *
 * **연도로 묶고 세로선으로 잇는다.** 날짜를 한 줄씩 늘어놓으면 2024 와 2026 사이가 몇 년인지
 * 세어야 알 수 있다. 연도를 크게 세워 두면 흐름이 눈으로 잡히고, 같은 해에 여러 일이 있었다는
 * 사실도 함께 보인다. 연도는 화면을 내리는 동안 왼쪽에 붙어 있는다(`sticky`) — 아래로 갈수록
 * 지금 몇 년도를 읽고 있는지 잃어버리기 때문이다.
 *
 * 최근이 위로 온다 — 지금 어디까지 왔는지가 먼저 궁금하기 때문이다.
 *
 * ## 어드민 연동
 * - 연혁 항목(연도 · 월 · 제목 · 설명) ← `b2c-admin` 회사 > 연혁 (`/company/milestones`)
 * - 설립일 · 대표자 · 회사명 ← 회사 > 회사 소개 (`/company`)
 * - 숨김으로 둔 항목은 여기 오지 않는다
 * - 정렬은 어드민이 매긴 순서를 그대로 따른다 — 템플릿이 다시 정렬하지 않는다
 */
export const metadata: Metadata = { title: `${COPY.company.historyTitle} — ${CONTENT.seo.title}` };

export default function MilestoneListPage() {
  const { company } = CONTENT;
  const milestones = company.milestones;

  // 'YYYY-MM' 또는 'YYYY.MM' 어느 모양으로 오든 앞 네 자리가 연도다.
  const years = [...new Set(milestones.map((milestone) => milestone.date.slice(0, 4)))];
  const founded = company.foundedAt.slice(0, 4);

  const stats = [
    { label: '설립', value: founded },
    { label: '기록된 해', value: `${years.length}년` },
    { label: '전체 기록', value: `${milestones.length}건` },
  ];

  return (
    <SiteShell>
      {/* 표제 — 연혁은 읽을거리라 제목을 크게 세우고 회사 한 줄 소개를 붙인다. */}
      <header className="flex flex-col gap-6 border-b border-border pb-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{company.name}</p>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight">{COPY.company.historyTitle}</h1>
          <p className="max-w-160 text-sm leading-relaxed text-ink-muted">
            {founded}년부터 지금까지, 화면과 운영을 한 벌로 맞춰 온 기록입니다.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 bg-canvas px-5 py-4">
              <dt className="text-xs text-ink-faint">{stat.label}</dt>
              <dd className="text-xl font-bold tabular-nums tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {milestones.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {years.map((year, yearIndex) => {
            const items = milestones.filter((milestone) => milestone.date.startsWith(year));
            const latest = yearIndex === 0;

            return (
              <section key={year} className="flex flex-col gap-5 lg:flex-row lg:gap-12">
                {/* 연도는 왼쪽에 크게 세워 두고, 내리는 동안 따라 붙는다. */}
                <div className="shrink-0 lg:sticky lg:top-6 lg:h-fit lg:w-44">
                  <p
                    className={`text-[44px] font-bold leading-none tabular-nums tracking-tight ${
                      latest ? 'text-ink' : 'text-ink-faint'
                    }`}
                  >
                    {year}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-ink-faint">
                    {items.length}건
                    {latest && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                        최근
                      </span>
                    )}
                  </p>
                </div>

                {/* 세로선은 한 줄로 흐르고, 항목마다 점이 얹힌다. */}
                <ol className="relative min-w-0 flex-1 border-l border-border pl-8">
                  {items.map((milestone) => (
                    <li key={milestone.id} className="relative pb-8 last:pb-0">
                      <span
                        className={`absolute -left-[35px] top-2 size-3 rounded-full border-2 border-canvas ${
                          latest ? 'bg-brand-500' : 'bg-border-strong'
                        }`}
                      />

                      <article className="rounded-xl border border-border px-5 py-4 transition-colors duration-150 hover:bg-surface">
                        <p className="font-mono text-xs tabular-nums text-brand-700 dark:text-brand-300">
                          {milestone.date}
                        </p>
                        <h2 className="mt-1.5 text-base font-medium leading-snug">{milestone.title}</h2>
                        {milestone.description && (
                          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{milestone.description}</p>
                        )}
                      </article>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      <a
        href={ROUTES.company}
        className="flex h-11 w-fit shrink-0 items-center whitespace-nowrap rounded-lg border border-border-strong px-5 text-sm text-ink-muted"
      >
        {COPY.company.title}
      </a>
    </SiteShell>
  );
}
