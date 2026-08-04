import type { Metadata } from 'next';
import { CONTENT, COPY, SLOT, cid } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `profile.settings` · B2C Client (템플릿 A) · route `/company`
 *
 * '무엇을 하는 회사인가' 를 읽는 화면이다. 연혁(`/company/history`)과 나눈 이유는 읽는 목적이
 * 다르기 때문이고, 그래서 본문에 연혁 링크를 또 두지 않는다 — 아래 두 갈래 안내에서 함께 잇는다.
 *
 * 표제 · 소개 본문 · 사업자 정보 순서로 둔다. 사업자 정보를 본문 앞에 두면 회사가 무엇을
 * 하는지 읽기 전에 등록번호부터 보게 된다 — 확인용 값은 필요할 때만 찾으면 된다.
 *
 * 아래에 '연혁 · 포트폴리오 · 문의하기' 로 가는 카드를 두지 않는다 — 헤더의 회사소개 메뉴가
 * 이미 그 갈래를 펼쳐 보여 주므로, 본문에 또 두면 같은 길이 두 군데가 된다.
 *
 * ## 어드민 연동
 * - 회사 소개 본문 · 대표자 · 설립일 ← `b2c-admin` 회사 > 회사 소개 (`/company`)
 * - 회사명 · 주소 · 전화 · 이메일 · 사업자등록번호 · 통신판매업신고 · 업태 · 업종
 *   ← 설정 > 공급자 정보 (`/settings/supplier`) — 푸터에 적히는 값과 같은 것을 쓴다
 * - 연혁 건수 ← 회사 > 연혁 (`/company/milestones`)
 * - 포트폴리오 건수 ← 콘텐츠 > 포트폴리오 (`/contents/portfolios`)
 */
export const metadata: Metadata = { title: `${COPY.company.title} — ${CONTENT.seo.title}` };

export default function CompanyPage() {
  const { company, supplier, portfolios } = CONTENT;
  const founded = company.foundedAt.slice(0, 4);

  const stats = [
    { label: COPY.company.foundedLabel, value: company.foundedAt },
    { label: COPY.company.ceoLabel, value: company.ceo },
    { label: COPY.company.historyTitle, value: `${company.milestones.length}건` },
    { label: COPY.nav.portfolios, value: `${portfolios.length}건` },
  ];

  /** 확인용 값 — 표로 묶어 둔다. 문장으로 풀면 필요한 항목을 눈으로 찾기 어렵다. */
  const facts = [
    { label: '회사명', value: supplier.companyName },
    { label: COPY.company.ceoLabel, value: supplier.ceo },
    { label: '사업자등록번호', value: supplier.businessNumber },
    { label: '통신판매업신고', value: supplier.mailOrderNumber },
    { label: '업태', value: supplier.section },
    { label: '업종', value: supplier.industry },
    { label: '주소', value: `${supplier.address} ${supplier.addressDetail}`.trim() },
    { label: '전화', value: supplier.phone },
    { label: '이메일', value: supplier.email },
  ].filter((row) => row.value);

  return (
    <SiteShell>
      {/* 표제 — 회사명을 눈에 먼저 넣고, 한 줄로 무엇을 하는 곳인지 말한다. */}
      <header className="flex flex-col gap-4 border-b border-border pb-10">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{COPY.company.title}</p>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">{company.name}</h1>
        <p className="max-w-160 text-sm leading-relaxed text-ink-muted">{CONTENT.seo.description}</p>

        <dl className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 bg-canvas px-5 py-4">
              <dt className="text-xs text-ink-faint">{stat.label}</dt>
              <dd className="text-lg font-bold tabular-nums tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <section
          id={SLOT.companyIntro}
          data-ssot-cid={cid('profile.settings', 'SiteCompanyBody')}
          className="flex min-w-0 flex-1 flex-col gap-4"
        >
          <h2 className="text-xl font-bold tracking-tight">소개</h2>
          {/* 본문은 어드민 에디터가 만든 HTML 이다 — 템플릿이 문장을 덧붙이지 않는다. */}
          <RichBody html={company.intro} />
        </section>

        {/* 확인용 값은 오른쪽에 모아 둔다 — 읽는 흐름을 끊지 않으면서 필요할 때 눈에 들어온다. */}
        <aside className="w-full shrink-0 lg:w-88">
          <div className="flex flex-col gap-4 rounded-xl border border-border px-6 py-5">
            <h2 className="text-base font-bold tracking-tight">사업자 정보</h2>
            <dl className="flex flex-col gap-3">
              {facts.map((row) => (
                <div key={row.label} className="flex items-baseline gap-4">
                  <dt className="w-24 shrink-0 text-xs text-ink-faint">{row.label}</dt>
                  <dd className="min-w-0 flex-1 break-words text-sm">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {/* 설립 연도는 아래에 한 번 더 — 소개를 다 읽고 나서 '언제부터' 가 남는다. */}
      <p className="text-xs text-ink-faint">
        {founded}년 설립 · {supplier.companyName}
      </p>
    </SiteShell>
  );
}
