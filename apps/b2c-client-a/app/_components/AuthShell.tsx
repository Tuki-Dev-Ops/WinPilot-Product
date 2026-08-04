import type { ReactNode } from 'react';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';

/**
 * 로그인·회원가입 공통 뼈대 — **로고 · 탭 · 제목 · 내용**을 화면 가운데로 모은다.
 *
 * 이 두 화면은 다른 곳으로 가는 길이 없다시피 하다(헤더 메뉴도 여기서는 쓰이지 않는다).
 * 그래서 넓은 화면에서 왼쪽에 붙여 두면 눈이 화면 한쪽에서만 움직이게 되어 좁게 느껴진다.
 *
 * **탭으로 두 화면을 잇는다.** 아래에 작은 링크 한 줄로 두면 계정이 없는 사람이 로그인 화면을
 * 한참 들여다본 뒤에야 찾는다. 탭이면 들어온 순간 두 갈래가 함께 보인다.
 *
 * 로고를 맨 위에 두는 이유는, 로그인 화면이 **어느 서비스의 것인지**가 가장 먼저 필요하기
 * 때문이다 — 결제·주소가 걸린 계정이라 잘못 들어온 화면에 비밀번호를 넣으면 안 된다.
 *
 * ## 어드민 연동
 * - 로고 · 회사명 ← `b2c-admin` 설정 > 공급자 정보 (`/settings/supplier`)
 * - 계정은 사용자 > 사용자 목록(`/users`)에서 운영자가 본다
 */
export function AuthShell({
  active,
  title,
  description,
  children,
}: {
  active: 'login' | 'signup';
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { supplier } = CONTENT;

  const tabs = [
    { id: 'login', href: ROUTES.login, label: COPY.auth.loginTitle },
    { id: 'signup', href: ROUTES.signup, label: COPY.auth.signupTitle },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-100 flex-col items-center gap-8 py-6">
      <a href={ROUTES.home} className="flex shrink-0 items-center">
        {supplier.logoUrl ? (
          // 어드민이 올린 로고는 objectURL 일 수 있어 next/image 최적화 대상이 아니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={supplier.logoUrl} alt={supplier.companyName} className="h-8 w-auto" />
        ) : (
          <span className="whitespace-nowrap text-2xl font-bold tracking-tight">
            {supplier.companyName || COPY.brandFallback}
          </span>
        )}
      </a>

      {/* 탭 — 고른 쪽만 밑줄로 표시한다. 칩으로 두면 단추처럼 보여 눌러도 화면이 안 바뀐 줄 안다. */}
      <nav aria-label={COPY.auth.loginTitle} className="flex w-full border-b border-border">
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <a
              key={tab.id}
              href={tab.href}
              aria-current={on ? 'page' : undefined}
              className={`-mb-px flex flex-1 items-center justify-center whitespace-nowrap border-b-2 pb-3 text-[15px] transition-colors duration-150 ${
                on ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>

      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
      </header>

      <div className="flex w-full flex-col gap-6">{children}</div>
    </div>
  );
}
