import {
  NUMERIC_EPSILON,
  PIXEL_TOLERANCE,
  SCHEMA_VERSION,
  figmaPageName,
  maxOrder,
  sortPages,
  validateManifest,
} from '@winpilot/uir';
import { breakpoints, pages } from '@/pages.manifest';

/**
 * 개발 전용 파이프라인 상태판.
 * 추출 대상이 아니다 — `pages.manifest.ts` 의 `devOnlyRoutes` 에 등록되어 있다.
 */

type PhaseState = 'done' | 'review' | 'next' | 'todo';

const PHASES: ReadonlyArray<{ n: number; title: string; state: PhaseState }> = [
  { n: 0, title: '모노레포 골격 · UIR 스키마 v1.0', state: 'done' },
  { n: 1, title: '토큰 생성기 — Tailwind @theme → DTCG', state: 'done' },
  { n: 2, title: '추출기 — Playwright → UIR + baseline', state: 'done' },
  { n: 3, title: 'Figma 플러그인 — 머티리얼라이저 · 페이지 정렬', state: 'review' },
  { n: 4, title: 'A. 수치 검증 (허용오차 0)', state: 'review' },
  { n: 5, title: 'B. 픽셀 검증 — 글리프 AA 마스크', state: 'review' },
  { n: 6, title: '전 페이지 × 3 브레이크포인트 · CI 게이트', state: 'next' },
];

const SAMPLE_PAGE_NAME = figmaPageName({ order: 1, id: 'index', name: 'Index', route: '/' }, 1);

export default function SsotStatusPage() {
  const ordered = sortPages(pages);
  const manifestErrors = validateManifest(pages);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-20">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-md bg-brand-600 text-[13px] font-bold text-white">
            W
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">WinPilot</div>
            <div className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">Design SSOT</div>
          </div>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11.5px] text-ink-muted">
          개발 전용 상태판
        </span>
      </header>

      <section className="pt-12">
        <h1 className="max-w-2xl text-3xl font-bold leading-[1.25] tracking-tight sm:text-[40px] sm:leading-[1.2]">
          프론트엔드 코드가
          <br />
          유일한 진실 공급원입니다
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          여기서 만든 화면은 브라우저가 계산한 최종 레이아웃 그대로 추출되어 Figma 페이지로 재구성됩니다. 디자인은
          손으로 옮기지 않습니다.
        </p>
      </section>

      <section className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        <Stat label="등록된 페이지" value={String(pages.length)} sub={pages.length === 0 ? '아직 없음' : '개'} />
        <Stat label="브레이크포인트" value={String(breakpoints.length)} sub={breakpoints.map((b) => b.width).join(' / ')} />
        <Stat label="UIR 스키마" value={`v${SCHEMA_VERSION}`} sub="추출기 · 플러그인 공유" />
        <Stat label="싱크 판정" value="2단계" sub="수치 + 픽셀" />
      </section>

      {manifestErrors.length > 0 && (
        <section className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">매니페스트 오류</h2>
          <ul className="mt-2 space-y-1 text-[12.5px] text-red-700 dark:text-red-300">
            {manifestErrors.map((error) => (
              <li key={error}>· {error}</li>
            ))}
          </ul>
        </section>
      )}

      <Section title="등록된 페이지" note="pages.manifest.ts">
        {ordered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface p-8">
            <p className="text-[15px] font-medium">아직 등록된 페이지가 없습니다.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              페이지를 하나 만들 때마다 아래 3단계를 거치면 Figma 에{' '}
              <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[12px] text-ink">
                {SAMPLE_PAGE_NAME}
              </code>{' '}
              형태의 페이지가 순번대로 생성됩니다.
            </p>
            <ol className="mt-6 space-y-3">
              <Step n={1}>
                <code className="font-mono text-[12.5px]">apps/web/app/&#123;route&#125;/page.tsx</code> 구현
              </Step>
              <Step n={2}>
                <code className="font-mono text-[12.5px]">pages.manifest.ts</code> 에{' '}
                <code className="font-mono text-[12.5px]">
                  &#123; order, id, name, route &#125;
                </code>{' '}
                한 줄 추가
              </Step>
              <Step n={3}>
                <code className="font-mono text-[12.5px]">pnpm ssot:extract && pnpm ssot:verify</code> 실행
              </Step>
            </ol>
            <p className="mt-6 border-t border-border pt-4 text-[13px] leading-relaxed text-ink-faint">
              등록하지 않은 라우트가 앱에 존재하면 추출기가 실패합니다 — 페이지를 만들고 등록을 잊는 사고를 구조적으로
              막습니다.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {ordered.map((page) => (
              <li key={page.id} className="flex items-center justify-between gap-4 bg-surface-raised px-5 py-4">
                <span className="font-mono text-sm font-medium">{figmaPageName(page, maxOrder(ordered))}</span>
                <span className="font-mono text-[12px] text-ink-faint">{page.route}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="파이프라인" note="docs/architecture/design-sync-ssot.md">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {PHASES.map((phase) => (
            <li key={phase.n} className="flex items-center gap-4 bg-surface-raised px-5 py-3.5">
              <span className="w-14 shrink-0 font-mono text-[12px] text-ink-faint">Phase {phase.n}</span>
              <span
                className={`flex-1 text-[14px] ${phase.state === 'todo' ? 'text-ink-faint' : 'text-ink'}`}
              >
                {phase.title}
              </span>
              <PhaseBadge state={phase.state} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="싱크 판정 기준" note="@winpilot/uir · tolerance.ts">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          <Criterion
            stage="A. 수치 검증"
            headline="허용오차 0"
            body="좌표 · 크기 · RGBA · 보더 · 모서리 · 그림자 · 자간 · 행간 · 줄 수까지 전 속성을 UIR 과 대조합니다."
            metric={`ε = ${NUMERIC_EPSILON}`}
          />
          <Criterion
            stage="B. 픽셀 검증"
            headline="글리프 AA 잔차만 허용"
            body="텍스트 외 전 영역은 diff 0. 텍스트는 잉크 무게중심으로 '정말 AA 차이일 뿐인지' 를 검사합니다."
            metric={`무게중심 ≤ ${PIXEL_TOLERANCE.inkCentroidPx}px · 커버리지 ≤ ${(
              PIXEL_TOLERANCE.inkCoverageRatio * 100
            ).toFixed(1)}%`}
          />
        </div>
      </Section>

      <footer className="mt-16 rounded-xl border border-border bg-surface px-5 py-4">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">이 화면은 개발 전용입니다.</span> 추출 대상이 아니며{' '}
          <code className="font-mono text-[12px]">pages.manifest.ts</code> 의{' '}
          <code className="font-mono text-[12px]">devOnlyRoutes</code> 에 등록되어 있습니다.
        </p>
      </footer>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface-raised px-5 py-5">
      <div className="text-2xs font-medium uppercase tracking-[0.1em] text-ink-faint">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-1 text-[12px] tabular-nums text-ink-muted">{sub}</div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[11.5px] text-ink-faint">{note}</span>
      </div>
      {children}
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full border border-border-strong font-mono text-2xs text-ink-muted">
        {n}
      </span>
      <span className="text-[14px] leading-6 text-ink-muted">{children}</span>
    </li>
  );
}

function PhaseBadge({ state }: { state: PhaseState }) {
  if (state === 'done') {
    return (
      <span className="rounded-full bg-signal-ok/12 px-2.5 py-1 text-[11.5px] font-medium text-signal-ok">완료</span>
    );
  }
  if (state === 'review') {
    return (
      <span className="rounded-full bg-brand-500/12 px-2.5 py-1 text-[11.5px] font-medium text-brand-700 dark:text-brand-300">
        Figma 확인 대기
      </span>
    );
  }
  if (state === 'next') {
    return (
      <span className="rounded-full bg-signal-wait/12 px-2.5 py-1 text-[11.5px] font-medium text-signal-wait">다음</span>
    );
  }
  return <span className="px-2.5 py-1 text-[11.5px] text-ink-faint">대기</span>;
}

function Criterion({
  stage,
  headline,
  body,
  metric,
}: {
  stage: string;
  headline: string;
  body: string;
  metric: string;
}) {
  return (
    <div className="bg-surface-raised px-5 py-5">
      <div className="text-2xs font-medium uppercase tracking-[0.1em] text-brand-600 dark:text-brand-400">
        {stage}
      </div>
      <div className="mt-2 text-[15px] font-semibold tracking-tight">{headline}</div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
      <div className="mt-3 text-[12px] tabular-nums text-ink-faint">{metric}</div>
    </div>
  );
}
