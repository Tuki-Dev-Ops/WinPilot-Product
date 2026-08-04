import type { Metadata } from 'next';
import { AdminUserAuthForm } from './_components/AdminUserAuthForm';

/**
 * 고객 화면은 **다른 앱이자 다른 레포**다. 상대 경로로는 갈 수 없으므로 절대 URL 을 쓴다.
 * 배포 환경에서는 `NEXT_PUBLIC_CLIENT_SITE_URL` 로 주입한다.
 */
const CLIENT_SITE_URL = process.env.NEXT_PUBLIC_CLIENT_SITE_URL ?? 'http://localhost:3300';

/**
 * Feature: `user.auth` · Admin View · route `/admin/login`
 *
 * `/admin/**` 는 전부 인증이 필요하고 이 화면만 예외다 (docs/spec/03-flow.md §3.2).
 * 폼 필드의 placeholder·value 는 추출되지 않으므로 라벨을 입력 요소 **밖**에 둔다
 * (docs/spec/05-component.md · 추출기가 위반 시 경고한다).
 */
export const metadata: Metadata = {
  title: '운영자 로그인 — WinPilot',
  robots: { index: false, follow: false },
};

/**
 * 데모 계정.
 *
 * 입력란의 `value` / `placeholder` 로 넣지 않는다 — 그 텍스트는 DOM 텍스트 노드가 아니라
 * 추출되지 않고 Figma 에서 사라진다. 화면에 보이는 텍스트로 따로 표기한다.
 * 도메인은 `.test` (RFC 2606 예약) 를 써서 실재하지 않는 주소임을 분명히 한다.
 */
const DEMO_ACCOUNT = [
  { label: '이메일', value: 'demo@winpilot.test' },
  { label: '비밀번호', value: 'winpilot-demo-2026' },
];

function BrandMark({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-md text-sm font-bold ${
          tone === 'light' ? 'bg-white text-brand-700' : 'bg-brand-500 text-white'
        }`}
      >
        W
      </span>
      <div className="leading-tight">
        <div className={`text-base font-semibold tracking-tight ${tone === 'light' ? 'text-white' : 'text-ink'}`}>
          WinPilot
        </div>
        <div
          className={`font-mono text-xs uppercase tracking-widest ${
            tone === 'light' ? 'text-brand-200' : 'text-ink-faint'
          }`}
        >
          Admin Console
        </div>
      </div>
    </div>
  );
}

export default function AdminUserAuthPage() {
  return (
    <div data-ssot-cid="b2c-admin/user.auth" className="grid min-h-screen bg-canvas text-ink lg:grid-cols-2">
      {/* 비주얼 배너 — 폭이 좁아지면 폼만 남긴다 */}
      <aside
        data-ssot-cid="b2c-admin/user.auth#AdminUserAuthBanner"
        className="hidden flex-col justify-between bg-brand-700 p-12 lg:flex xl:p-16"
      >
        <BrandMark tone="light" />

        <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
          운영자가 쓰는 도구는
          <br />
          고객 화면만큼 중요합니다
        </h2>
      </aside>

      {/*
        로그인 폼 — 테두리 없이 오른쪽 영역 정중앙.
        푸터를 흐름에서 빼지 않으면 그 높이만큼 폼이 위로 밀려 정중앙이 되지 않는다.
      */}
      <div className="relative flex flex-col">
        <main className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
          <div data-ssot-cid="b2c-admin/user.auth#AdminUserAuthForm" className="w-full max-w-sm">
            <div className="lg:hidden">
              <BrandMark tone="dark" />
            </div>

            <h1 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">로그인</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">운영자 계정으로 접속하세요.</p>

            <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 dark:bg-brand-900">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-200">
                Demo
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {DEMO_ACCOUNT.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-ink-muted">{item.label}</span>
                    <span className="font-mono text-sm text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <AdminUserAuthForm />

            <p className="mt-8 text-sm leading-relaxed text-ink-muted">
              운영자 계정만 접근할 수 있습니다. 고객 계정은{' '}
              <a href={CLIENT_SITE_URL} className="text-brand-700 dark:text-brand-300">
                서비스 화면
              </a>
              에서 로그인하세요.
            </p>
          </div>
        </main>

        <footer className="absolute inset-x-0 bottom-0 px-6 py-6 sm:px-10">
          <p className="text-center font-mono text-xs text-ink-faint lg:text-left">© 2026 WinPilot</p>
        </footer>
      </div>
    </div>
  );
}
