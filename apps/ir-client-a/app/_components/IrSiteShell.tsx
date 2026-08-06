import type { ReactNode } from 'react';
import { BackLink, BrandMark } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';
import { LEGAL_NAV, SITE_NAV } from '@/lib/navigation';
import { SiteHeader } from './SiteHeader';

/**
 * 회사 홈페이지 껍데기 — **가로 상단 내비 + 넓은 본문 + 공시 안내 푸터**.
 *
 * ## 회사 홈페이지인데 IR 이 중심이다
 * 상장사가 홈페이지를 두는 이유가 대개 그것이다 — 제품은 영업이 따로 소개하고, 홈페이지는
 * **투자자와 주주가 찾아오는 곳**이 된다. 그래서 메뉴가 공시·재무·주주로 서고, 회사 소개는
 * 첫 화면의 문장 하나로 끝난다.
 *
 * ## 쇼핑몰 껍데기와 다른 것
 * 장바구니·로그인이 없다. 여기는 **읽는 곳**이고 파는 것이 없다 — 없는 길을 그려 두면
 * 눌러 본 사람이 왜 안 되는지 찾는다.
 *
 * 대신 푸터에 **IR 담당 창구**와 **예측 정보 주의문구**를 둔다. 앞의 것은 투자자가 가장 자주
 * 찾는 값이고, 뒤의 것은 전망을 담은 자료에 함께 있어야 하는 말이다.
 *
 * ## 어드민 연동
 * - 메뉴 이름 ← `ir-admin` 설정 > 국문 · 영문 (`/settings/locales`)
 * - 회사·창구 정보 ← `@winpilot/store` 의 `IR_COMPANY`
 */
/**
 * 저작권 표시의 연도.
 *
 * `new Date().getFullYear()` 를 쓰지 않는다. 이 화면은 미리 만들어 두는 정적 화면이라 그
 * 값이 **빌드한 날에 굳는다** — 해가 바뀌어도 다시 배포하기 전까지 옛 연도가 남고, 그때는
 * 코드에 최신 연도를 구하는 줄이 있으니 아무도 의심하지 않는다.
 *
 * 값으로 적어 두면 적어도 **여기를 고쳐야 한다는 것이 보인다.**
 */
const COPYRIGHT_YEAR = '2026';

export function IrSiteShell({
  back,
  hero,
  bleed,
  overlay = false,
  children,
}: {
  back?: { href: string; label: string };
  /**
   * 화면을 꽉 채우는 첫 화면.
   *
   * 본문(`children`)과 **따로 받는 이유**: 본문은 `max-w-320` 안에서 좌우 여백을 갖는데,
   * 첫 화면은 화면 끝까지 닿아야 한다. 본문 안에 두고 음수 여백으로 빼내면 너비 제한까지는
   * 벗어나지 못해, 넓은 화면에서 배경만 가운데 상자로 남는다.
   */
  hero?: ReactNode;
  /**
   * 첫 화면과 본문 사이에 서는, **좌우 끝까지 닿는 판**.
   *
   * `hero` 와 나눠 받는 이유: 첫 화면은 화면 높이를 꽉 채우지만 이 자리는 내용만큼만
   * 차지한다. 둘을 한 슬롯으로 받으면 이 판까지 `min-h-dvh` 안에 들어가, 스크롤을 내려도
   * 소개가 나타나지 않는다.
   */
  bleed?: ReactNode;
  /**
   * 헤더를 본문 **위에 겹칠지**.
   *
   * 첫 화면의 히어로는 어두운 전면 배경이라, 흰 띠 헤더가 그 위에 얹히면 화면이 두 동강
   * 난다. 겹치면 헤더가 배경의 일부처럼 읽히고 글자는 흰색으로 바뀐다.
   *
   * 다른 화면에서 켜지 않는 이유: 본문이 흰 바탕이라 흰 글씨가 보이지 않는다.
   */
  overlay?: boolean;
  /**
   * 너비가 제한된 본문.
   *
   * **없어도 된다.** 홈처럼 화면 끝까지 닿는 칸(`hero`·`bleed`)만으로 이뤄진 화면이 있는데,
   * 그때 빈 `<main>` 을 두면 위아래 여백(`py-10`)만 남아 칸과 칸 사이가 벌어진다.
   */
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <SiteHeader overlay={overlay} />

      {hero}
      {bleed}

      {(children || back) && (
        <main className="mx-auto flex w-full max-w-320 flex-1 flex-col gap-10 px-6 py-10">
          {back && <BackLink href={back.href} label={back.label} />}
          {children}
        </main>
      )}

      {/*
        푸터는 검다. 본문이 흰 바탕이라 그 아래가 같은 색이면 **페이지가 어디서 끝났는지**
        보이지 않고, 마지막 칸(Solution)도 밝은 칸이라 더 그렇다. 첫 화면과 같은 색을 써서
        위아래가 같은 색으로 닫히게 한다.
      */}
      {/*
        푸터는 검다. 본문이 흰 바탕이라 그 아래가 같은 색이면 **페이지가 어디서 끝났는지**
        보이지 않고, 마지막 칸도 밝은 칸이라 더 그렇다. 첫 화면과 같은 색을 써서 위아래가 같은
        색으로 닫히게 한다.
      */}
      <footer className="bg-[#05060d] text-white">
        <div className="mx-auto flex w-full max-w-320 flex-col gap-8 px-6 pb-12 pt-8">
          {/*
            약관과 처리방침은 **맨 윗줄에 가로로** 둔다. 사이트 메뉴 옆에 세로로 세웠더니
            ABOUT·SOLUTION 과 같은 층으로 보였는데, 이 둘은 파는 것을 소개하는 길이 아니라
            **어느 화면에서든 같은 자리에 있어야 하는 고지**다. 층을 나눠 두면 찾는 사람이
            메뉴를 훑지 않고 바로 집는다.
          */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 pb-8">
            {LEGAL_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/80 transition-colors duration-150 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            {/*
              로고가 메뉴 칸들의 **왼쪽 첫 자리**에 선다. 맨 위에 홀로 세워 보았더니 약관 줄과
              메뉴 사이에서 어느 쪽에 딸린 것인지가 흐렸다. 메뉴와 같은 줄에서 시작하면
              **그 오른쪽 전부가 이 회사의 길**이라는 것이 자리로 읽힌다.
            */}
            <BrandMark name={IR_COMPANY.name} tone="light" size={30} />

            {/*
              사이트 메뉴를 푸터에도 둔다. 헤더의 것은 마우스를 올려야 펼쳐지지만 **맨 아래까지
              내려온 사람은 이미 헤더에서 멀어져 있고**, 거기서 다음 갈래로 가려면 끝까지 올라가야
              한다. 여기서는 접지 않고 전부 펴 둔다 — 푸터는 좁힐 자리가 아니다.

              헤더와 같은 `SITE_NAV` 를 읽는다. 목록을 두 벌로 두면 메뉴 하나가 늘 때 한쪽만 는다.
            */}
            <nav className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
              {SITE_NAV.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <p className="text-xs font-bold tracking-wide">{item.label}</p>
                  <div className="flex flex-col gap-2">
                    {item.groups
                      .flatMap((group) => group.children)
                      .map((child) =>
                        child.ready ? (
                          <a
                            key={child.href + child.label}
                            href={child.href}
                            className="w-fit text-xs text-white/50 transition-colors duration-150 hover:text-white"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <span key={child.href + child.label} className="text-xs text-white/25">
                            {child.label}
                          </span>
                        ),
                      )}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
            {/*
              사업자등록번호와 개인정보보호책임자를 함께 적는다. 회사 이름과 주소만 적어 두면
              **누구에게 무엇을 물어야 하는지**가 빠지고, 그 둘은 찾는 사람이 가장 급한 값이다.
            */}
            <p className="text-xs leading-relaxed text-white/50">
              {IR_COMPANY.name} · 대표이사 {IR_COMPANY.ceo} · 사업자등록번호 {IR_COMPANY.businessNumber}
            </p>
            <p className="text-xs leading-relaxed text-white/50">{IR_COMPANY.address}</p>
            <p className="text-xs leading-relaxed text-white/50">
              개인정보보호책임자 {IR_COMPANY.privacyOfficer} · {IR_COMPANY.irEmail} · {IR_COMPANY.irPhone}
            </p>
            <p className="mt-4 font-mono text-xs tabular-nums text-white/30">
              © {COPYRIGHT_YEAR} {IR_COMPANY.nameEn} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** 화면 제목 — 상세에서는 위에 돌아가는 길이 함께 선다(`back`). */
export function IrPageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
    </div>
  );
}

/** 어드민 편집기가 만든 HTML. 값의 출처가 어드민이라 외부 입력이 아니다. */
export function IrRichBody({ html }: { html: string }) {
  return (
    <div
      className="text-sm leading-relaxed [&_a]:text-brand-700 [&_a]:underline [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-1 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
