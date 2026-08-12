import type { ReactNode } from 'react';
import { BackLink, BrandMark } from '@winpilot/ui';
import { FNB_BRAND, livePopups } from '@winpilot/store';
import { FOOTER_NAV, LEGAL_NAV } from '@/lib/navigation';
import { ApplyBar } from './ApplyBar';
import { PopupLayer } from './PopupLayer';
import { OctopusMark } from './OctopusMark';
import { FamilySiteMenu } from './FamilySiteMenu';
import { SiteHeader } from './SiteHeader';

/**
 * 외식 브랜드 홈페이지 껍데기 — **가로 상단 내비 + 넓은 본문 + 두 창구를 나눈 푸터**.
 *
 * ## 쇼핑몰 껍데기와 다른 것
 * 장바구니·로그인이 없다. 여기서 파는 것은 매장에서 팔리고, 사이트는 **어디로 가면 되는지**를
 * 알려 주는 곳이다. 없는 길을 그려 두면 눌러 본 사람이 왜 안 되는지 찾는다.
 *
 * ## 푸터에 번호가 둘이다
 * 손님 문의와 창업 상담을 나눠 적는다. 하나로 두면 창업 전화가 매장 번호로 가고, 그 전화를
 * 받는 사람은 답할 수 없는 것을 묻는 사람과 통화하게 된다 — 양쪽 다 손해다.
 *
 * ## 어드민 연동
 * - 브랜드·창구 정보 ← `@winpilot/store` 의 `FNB_BRAND` (F&B 어드민 설정 > 브랜드)
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

export function FnbSiteShell({
  back,
  hero,
  bleed,
  overlay = false,
  applyBar = true,
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
   * 다음 칸이 나타나지 않는다.
   */
  bleed?: ReactNode;
  /**
   * 헤더를 본문 **위에 겹칠지**.
   *
   * 첫 화면은 어두운 전면 배경이라, 흰 띠 헤더가 그 위에 얹히면 화면이 두 동강 난다. 겹치면
   * 헤더가 배경의 일부처럼 읽힌다. 다른 화면에서 켜지 않는 이유: 본문이 흰 바탕이라 흰 글씨가
   * 보이지 않는다.
   */
  overlay?: boolean;
  /**
   * 화면 아래에 붙어 따라오는 가맹 상담 바를 띄울지.
   *
   * **기본은 켬이다.** 이 사이트에서 가장 많이 세는 것이 창업 상담 신청이고, 화면이 아래로 길어
   * 다 읽은 사람이 신청하러 가려면 헤더까지 되올라가야 한다(`ApplyBar` 머리말).
   *
   * 끄는 화면은 신청 양식 자신뿐이다 — 이미 거기 온 사람에게 신청하러 가자고 하는 바는 양식을
   * 가리는 방해물이다.
   */
  applyBar?: boolean;
  /**
   * 너비가 제한된 본문.
   *
   * **없어도 된다.** 홈처럼 화면 끝까지 닿는 칸(`hero`·`bleed`)만으로 이뤄진 화면이 있는데,
   * 그때 빈 `<main>` 을 두면 위아래 여백만 남아 칸과 칸 사이가 벌어진다.
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
        보이지 않는다. 첫 화면과 같은 색을 써서 위아래가 같은 색으로 닫히게 한다.
      */}
      <footer className="bg-night text-white">
        <div className="mx-auto flex w-full max-w-320 flex-col gap-8 px-6 pb-12 pt-8">
          {/*
            약관과 처리방침은 **맨 윗줄에 가로로** 둔다. 사이트 메뉴 옆에 세로로 세우면 브랜드·
            창업과 같은 층으로 보이는데, 이 둘은 파는 것을 소개하는 길이 아니라 **어느 화면에서든
            같은 자리에 있어야 하는 고지**다.
          */}
          {/*
            고지는 왼쪽, 나가는 길은 오른쪽. 한 줄에 두되 **양 끝으로 밀어** 둔다 — 붙여 세우면
            `개인정보 처리방침` 옆에 `패밀리사이트` 가 서서 넷째 고지처럼 읽힌다.
          */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-8">
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
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

            <FamilySiteMenu />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            {/*
              로고가 메뉴 칸들의 **왼쪽 첫 자리**에 선다. 메뉴와 같은 줄에서 시작하면 그 오른쪽
              전부가 이 브랜드의 길이라는 것이 자리로 읽힌다.
            */}
            <BrandMark
              mark={<OctopusMark className="size-8 shrink-0 text-white" />}
              name={FNB_BRAND.name}
              tone="light"
              size={30}
            />

            {/*
              묶음들을 **오른쪽 끝에 붙인다.**

              전에는 세 칸을 남은 폭에 고르게 펼쳤다(`grid-cols-3`). 그러면 칸마다 항목 수가 달라
              (셋 · 넷 · 둘) 오른쪽 끝이 들쭉날쭉하고, 넓은 화면에서는 마지막 칸과 화면 끝 사이에
              빈 자리가 크게 남았다.

              끝을 맞춰 두면 로고(왼쪽 끝)와 메뉴(오른쪽 끝)가 **판의 양 끝을 잡는다.** 글자도
              오른쪽으로 맞춰야 그 선이 실제로 한 줄로 보인다 — 왼쪽 맞춤인 채로 묶음만 오른쪽에
              두면 항목마다 끝나는 자리가 달라 선이 생기지 않는다.
            */}
            <nav className="flex flex-wrap justify-end gap-x-12 gap-y-8 text-right">
              {FOOTER_NAV.map((group) => (
                <div key={group.title} className="flex flex-col items-end gap-3">
                  <p className="text-xs font-bold tracking-wide">{group.title}</p>
                  <div className="flex flex-col items-end gap-2">
                    {group.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="w-fit text-xs text-white/50 transition-colors duration-150 hover:text-white"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/*
            창구 둘을 나란히 둔다. 한 줄로 이어 적으면 번호 둘이 붙어 서서, 급한 사람이 앞의
            것을 누른다 — 창업 문의가 매장 번호로 가는 것은 그렇게 생긴다.
          */}
          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            <Desk label="손님 문의" value={FNB_BRAND.phone} note="메뉴 · 매장 · 예약" />
            <Desk label="창업 상담" value={FNB_BRAND.franchisePhone} note="가맹 · 상권 · 비용" />
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
            <p className="text-xs leading-relaxed text-white/50">
              {FNB_BRAND.name} · 대표이사 {FNB_BRAND.ceo} · 사업자등록번호 {FNB_BRAND.businessNumber}
            </p>
            <p className="text-xs leading-relaxed text-white/50">{FNB_BRAND.address}</p>
            <p className="text-xs leading-relaxed text-white/50">
              개인정보보호책임자 {FNB_BRAND.privacyOfficer} · {FNB_BRAND.email}
            </p>
            <p className="mt-4 font-mono text-xs tabular-nums text-white/30">
              © {COPYRIGHT_YEAR} {FNB_BRAND.nameEn} All rights reserved.
            </p>
          </div>
        </div>

        {/*
          바가 푸터 맨 아랫줄을 덮지 않게 자리를 비워 둔다. 바 높이(약 `3.5rem`)에 아래 여백을
          더한 만큼이다 — 안 비워 두면 저작권 한 줄이 바 뒤에 숨는다.
        */}
        {applyBar && <div aria-hidden className="h-20" />}
      </footer>

      {applyBar && <ApplyBar />}

      {/*
        팝업은 껍데기가 띄운다 — 화면마다 붙이면 새 화면을 만드는 날 빠뜨리고, 그러면 그
        화면에서만 안 뜬다. 어느 화면으로 들어오든 같아야 하는 것이라 여기가 제자리다.

        오늘을 여기서 정해 넘긴다. 조각 안에서 구하면 미리 만들어 두는 화면에서 빌드한 날에
        굳는다(`livePopups` 머리말).
      */}
      <PopupLayer popups={livePopups(new Date().toISOString().slice(0, 10))} />
    </div>
  );
}

/** 푸터의 창구 한 칸 — 누가 받는지(`note`)까지 적어야 전화가 제자리로 간다. */
function Desk({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-white/40">{label}</p>
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-white/40">{note}</p>
    </div>
  );
}

/**
 * 화면 제목 — **이름표 · 큰 제목 · 짧은 선 · 한 줄.**
 *
 * ## 홈의 칸 머리와 같은 모양이다
 * 홈은 칸마다 `이름표 → 제목 → 선` 으로 서고(`SectionHead`), 다른 화면의 맨 위도 같아야 한다.
 * 두 모양이면 홈에서 다른 화면으로 넘어갈 때 **다른 사이트에 온 것처럼** 읽힌다.
 *
 * ## 가운데가 기본이다
 * 한때 왼쪽 맞춤이 기본이고 `centered` 를 주는 화면만 가운데였다. 지금은 반대다 — 화면 열둘 중
 * 아홉이 가운데로 서면서, 예외를 적어 두는 쪽이 짧아졌다.
 *
 * 왼쪽으로 두는 것은 **아래가 왼쪽에서 시작하는 긴 글**뿐이다(약관 · 처리방침). 거기서 제목만
 * 가운데 두면 읽는 눈이 위아래로 오갈 때마다 옆으로도 움직인다.
 *
 * ## 이름표가 브랜드색이다
 * `MENU` · `STORE` 처럼 그 화면이 무엇인지를 한 마디로. 없어도 되지만, 있으면 제목 위에
 * 브랜드색이 한 번 나와서 화면마다 같은 리듬이 생긴다.
 *
 * ## 제목이 글자가 아니라 마디를 받는다
 * 한 낱말만 브랜드색으로 칠하는 자리가 있어서다(`Accent`). 글자만 받으면 그 강조를 화면마다
 * 손으로 그리게 되고, 그러면 색과 굵기가 화면마다 조금씩 달라진다.
 */
export function FnbPageTitle({
  label,
  title,
  description,
  align = 'center',
}: {
  label?: string;
  title: ReactNode;
  description?: string;
  /** 아래가 왼쪽에서 시작하는 긴 글에만 `left` 를 준다 */
  align?: 'center' | 'left';
}) {
  const centered = align === 'center';

  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : ''}`}>
      {label && <p className="text-xs font-bold uppercase tracking-widest text-octo-700">{label}</p>}

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>

      <span
        aria-hidden
        className={`mt-1 block h-0.5 w-10 rounded-full bg-octo-500 ${centered ? '' : 'self-start'}`}
      />

      {description && <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">{description}</p>}
    </div>
  );
}

/**
 * 제목 안에서 **한 낱말만 브랜드색으로** — 홈의 것과 같은 조각이다.
 *
 * 문장 전체를 색칠하면 읽기 어렵고, 색이 하나도 없으면 그 제목이 무엇을 말하려는지가 안
 * 드러난다. 한 낱말이면 눈이 거기 먼저 닿고 나머지를 이어 읽는다.
 */
export function Accent({ children }: { children: string }) {
  return <span className="text-octo-600">{children}</span>;
}
