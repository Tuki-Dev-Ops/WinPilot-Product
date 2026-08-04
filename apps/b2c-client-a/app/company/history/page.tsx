import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `milestone.list` · B2C Client (템플릿 A) · route `/company/history`
 *
 * 회사 소개와 **별개 화면**이다 — 읽는 목적이 다르다.
 * 소개는 '무엇을 하는 회사인가', 연혁은 '어떻게 커 왔는가' 를 본다.
 *
 * ## 어드민 연동
 * - 연혁 ← `b2c-admin` 회사 > 연혁 (`/company/milestones`) — 숨김으로 둔 항목은 오지 않는다
 */
export const metadata: Metadata = { title: `${COPY.company.historyTitle} — ${CONTENT.seo.title}` };

export default function MilestoneListPage() {
  const { company } = CONTENT;

  return (
    <SiteShell>
      <PageTitle title={COPY.company.historyTitle} description={company.name} />

      <div className="flex flex-col">
        {company.milestones.map((milestone) => (
          <div key={milestone.id} className="flex gap-8 border-b border-border py-5 last:border-b-0">
            <span className="w-24 shrink-0 font-mono text-base font-medium tabular-nums text-brand-700 dark:text-brand-300">
              {milestone.date}
            </span>
            <div className="min-w-0">
              <p className="text-base font-medium">{milestone.title}</p>
              {milestone.description && (
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{milestone.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <a href={ROUTES.company} className="w-fit text-sm text-brand-700 dark:text-brand-300">
        {COPY.company.title}
      </a>
    </SiteShell>
  );
}
