import { Fragment, type ReactNode } from 'react';
import { BackLink, BrandMark } from '@winpilot/ui';
import { FNB_BRAND } from '@winpilot/store';
import { FNB_MENU, findFnbSection } from '@/lib/navigation/fnb-menu';
import { OctopusMark } from './OctopusMark';

export type FnbShellProps = {
  /** 현재 최상위 섹션 id — 사이드바 활성 표시와 보조 메뉴 선택에 쓴다 */
  sectionId: string;
  /** 현재 위치. 예: `['메뉴', '목록']` */
  trail: string[];
  /** 보조 메뉴에서 활성으로 표시할 자식 id */
  activeChildId?: string;
  /** 상세 화면에서 돌아갈 목록 */
  back?: { href: string; label: string };
  children: ReactNode;
};

/**
 * F&B Admin 껍데기.
 *
 * ## 콘솔들이 같은 뼈대를 쓴다
 * 사이드바는 최상위만, 세부는 본문 왼쪽 보조 메뉴에. 콘솔을 오가는 사람이 구조를 여러 번
 * 배우지 않게 하려는 것이고, 그래서 이 파일은 `IrShell` · `InternalShell` 과 같은 모양이다.
 *
 * **셸은 앱마다 갖는다**(`@winpilot/ui` 머리말). 사이드바 메뉴도, 어느 콘솔인지 알리는
 * 워드마크도 실제로 다르기 때문이다. 여기서 다른 것은 워드마크(`F&B`)와 메뉴뿐이다.
 *
 * ## 로그인이 없다
 * 오른쪽 위에 계정과 로그아웃 자리를 둔다. 로그인 화면은 아직 없어 주소만 맞춰 둔다 — 다른
 * 콘솔과 같은 자리에 같은 것이 있어야 오가는 사람이 찾는다.
 */
export function FnbShell({ sectionId, trail, activeChildId, back, children }: FnbShellProps) {
  const section = findFnbSection(sectionId);
  const subItems = section?.children ?? [];

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-canvas px-4 py-6 lg:flex">
        {/*
          어느 콘솔인지는 이름 아래 워드마크(`F&B`)가 말한다 — 로고는 어느 브랜드인지만 말한다.

          로고 자리에 문어를 세운다(`mark`). 이 브랜드는 아직 로고 파일이 없어, 안 넘기면
          **다른 브랜드의 로고**가 여기 선다. 원본을 받는 날 이 줄만 빼면 파일로 돌아간다.

          사이트와 같은 그림이라 조각도 같은 것을 써야 하는데, 그 조각이 사이트 앱 안에 있다.
          공유 패키지(`@winpilot/ui`)는 **자기가 무엇을 담는지 모르는** 자리라 문어가 거기 살
          수 없다. 두 벌이 되는 것을 알고 두는 것이고, 로고 파일을 받으면 두 벌 다 사라진다.
        */}
        <BrandMark
          className="px-2"
          mark={<OctopusMark className="size-8 shrink-0 text-octo-600" />}
          name={FNB_BRAND.name}
          note="F&B"
          size={30}
        />

        <nav className="mt-6 flex flex-col gap-1">
          {FNB_MENU.map((item) => (
            <Fragment key={item.id}>
              {/*
                성격이 다른 갈래 앞의 선. `aria-hidden` 인 이유: 낭독기에게는 목록의 순서가 이미
                구조로 전달되고 있어, 구분선까지 읽으면 뜻 없는 한 마디가 끼어든다.
              */}
              {item.separatedBefore && <hr aria-hidden className="my-2 border-t border-border" />}
              <a
                href={item.href}
                className={`rounded-r-lg border-l-2 px-3 py-2 text-sm ${
                  item.id === sectionId
 ? 'border-brand-500 font-semibold text-brand-700'
                    : 'border-transparent text-ink-muted'
                }`}
              >
                {item.label}
              </a>
            </Fragment>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-canvas px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <h1 aria-label={trail.join(' > ')} className="flex flex-wrap items-center gap-2 text-lg tracking-tight">
              {trail.map((part, index) => (
                <Fragment key={part}>
                  {index > 0 && (
                    <span aria-hidden="true" className="text-ink-faint">
                      |
                    </span>
                  )}
                  <span className={index === trail.length - 1 ? 'font-semibold' : 'text-ink-muted'}>{part}</span>
                </Fragment>
              ))}
            </h1>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-muted sm:inline">{FNB_BRAND.email}</span>
              {/*
                로그인 화면이 아직 없다. 한때 `B2C Admin 과 같은 자리에 둔다` 며 `/login` 을
                걸어 두었는데, 그 앱에만 화면이 있고 여기에는 없어서 **누르면 404** 였다.

                저장소가 이미 정한 규칙이 있다(`ir-client-a/lib/navigation.ts`) — 준비 중인
                자리를 눌러 404 로 보내면, 그 뒤로는 다른 메뉴도 눌러 보지 않는다. 그래서
                링크를 걸지 않고 글자로만 둔다. 화면이 생기는 날 `<a href="/login">` 으로
                되돌리면 된다.
              */}
              <span className="text-sm text-ink-faint" title="로그인 화면은 아직 없습니다">
                로그아웃
              </span>
            </div>
          </div>

          {/* lg 미만에서는 사이드바가 사라지므로 최상위 메뉴를 여기로 접는다. */}
          <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {FNB_MENU.map((item) => (
              <a
                key={item.id}
                href={item.href}
                /* 칩은 가로로 눕는 자리라 왼쪽 선이 뜻을 갖지 못한다 — 여기서만 채움을 쓴다. */
                className={`rounded px-3 py-1.5 text-sm ${
                  item.id === sectionId ? 'bg-ink font-medium text-white' : 'bg-surface text-ink-muted'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <main className="flex flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-10 lg:px-8">
          {subItems.length > 0 && (
            <aside className="w-full shrink-0 lg:w-44">
              <nav className="flex flex-wrap gap-1 lg:flex-col">
                {subItems.map((child) => (
                  <a
                    key={child.id}
                    href={child.href}
                    className={`rounded-r-lg border-l-2 px-3 py-2 text-sm ${
                      child.id === activeChildId
 ? 'border-brand-500 font-semibold text-brand-700'
                        : 'border-transparent text-ink-muted'
                    }`}
                  >
                    {child.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {back && <BackLink href={back.href} label={back.label} />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
