'use client';

import { useEffect, useState } from 'react';
import { BrandMark } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';
import { SITE_NAV, type SiteNavChild, type SiteNavItem } from '@/lib/navigation';

/**
 * 상단 내비 — **갈래 넷과, 그 아래로 화면 폭만큼 펼쳐지는 판**.
 *
 * ## 좁은 드롭다운이 아니라 넓은 판인 이유
 * 처음에는 갈래 바로 아래에 좁은 목록을 띄웠다. SOLUTION 아래가 셋일 때는 됐는데 여섯이
 * 되면서 **긴 목록 하나**가 되었고, 그러면 컨설팅과 Cloud MES 가 같은 종류로 보인다. 하나는
 * 사람이 하는 일이고 하나는 파는 물건이다.
 *
 * 판을 화면 폭으로 넓히면 묶음을 **칸으로 나눠** 세울 수 있다 — `서비스` 와 `클라우드 제품`이
 * 각각 제 칸에 서면, 사람이 하는 일과 파는 물건이 한 줄에 섞이지 않는다.
 *
 * ## 뒤는 어둡게 덮지 않는다
 * 한때 판 아래를 검은 막으로 덮었다. 그런데 판 자체가 검고 화면 폭을 다 쓰므로 **어디까지가
 * 메뉴인지**가 사라졌다 — 판과 막의 경계가 보이지 않아 화면이 통째로 한 번 꺼진 것처럼 보였다.
 *
 * 막은 투명하게 두되 자리는 지킨다. 판 밖을 눌러 닫는 것은 배우지 않아도 하는 동작이라,
 * 보이지 않아도 **누르면 닫힌다**는 기대가 맞아떨어진다.
 *
 * ## 언제나 검은 띠다 — 첫 화면 맨 위만 빼고
 * 다른 화면에서는 흰 바탕을 썼는데, 그러면 **화면마다 헤더 색이 달라** 같은 사이트 안에서 머리가
 * 두 벌로 보였다. 검게 고정하면 어느 화면에서든 맨 위가 같은 띠다.
 *
 * 첫 화면만 빼는 것은 거기서 헤더가 배경 영상 위에 겹쳐 뜨기 때문이다. 띠를 깔면 영상이 그만큼
 * 잘린다 — 대신 조금이라도 내려가거나 메뉴를 펼치면 그때 깔린다.
 *
 * 사라지게 두지 않는 이유: 이 사이트는 아래로 길다. 헤더가 맨 위에만 있으면 중간에서 다른
 * 갈래로 가려는 사람이 **끝까지 올라갔다 와야 한다.**
 *
 * ## 마우스만으로 열리지 않는다
 * 펼침을 `hover` 로만 두면 키보드로 오는 사람에게는 없는 메뉴가 된다. 포커스가 들어와도 열고,
 * `Esc` 로 닫는다. 갈래 자체도 눌러서 갈 수 있게 링크로 둔다 — 터치에서는 첫 탭이 이동이다.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  /** 지금 펼친 갈래. 하나만 열린다 — 둘이 겹치면 어느 쪽 항목인지 알 수 없다. */
  const [open, setOpen] = useState<string | null>(null);
  const scrolled = useScrolled();

  /* 열려 있는 동안 `Esc` 로 닫는다. 마우스를 쓰지 않는 사람에게는 이것이 유일한 닫는 길이다. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const opened = SITE_NAV.find((one) => one.label === open);

  /*
    검은 띠를 까는가.

    **첫 화면 말고는 언제나 깐다.** 다른 화면에서는 흰 바탕(`bg-canvas`)을 썼는데, 그러면
    화면마다 헤더 색이 달라 같은 사이트 안에서 머리가 두 벌로 보였다. 검게 고정하면 어느
    화면에서든 맨 위가 같은 띠다.

    첫 화면만 빼는 이유: 거기서는 헤더가 배경 영상 위에 겹쳐 뜬다. 띠를 깔면 영상이 그만큼
    잘리고, 화면을 꽉 채우려던 뜻이 사라진다 — 대신 조금이라도 내려가거나 메뉴를 펼치면
    그때 깔린다.
  */
  const solid = !overlay || scrolled || opened !== undefined;

  return (
    <header
      className={`${overlay ? 'fixed inset-x-0 top-0 z-30' : 'sticky top-0 z-30'} text-white transition-colors duration-200 ${
        solid ? 'border-b border-white/10 bg-black/85 backdrop-blur-sm' : ''
      }`}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto flex w-full max-w-320 flex-wrap items-center justify-between gap-4 px-6 py-4">
        {/*
          시장·종목 코드는 여기 두지 않는다. 회사 홈페이지의 맨 위가 답할 것은 **어느 회사인가**
          하나이고, 코스닥과 종목 코드는 그것을 알고 난 다음에 찾는 값이다.
        */}
        {/* 헤더가 늘 어두우므로 로고도 늘 흰색이다 — 색을 재는 조건이 없어졌다. */}
        <BrandMark href="/" name={IR_COMPANY.name} tone="light" size={30} />

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {SITE_NAV.map((item) => (
            <div key={item.label} onMouseEnter={() => setOpen(item.label)} onFocus={() => setOpen(item.label)}>
              <a
                href={item.href}
                aria-expanded={open === item.label}
                className={`relative block whitespace-nowrap py-2 text-sm font-semibold tracking-wide transition-colors duration-150 ${
                  open === item.label ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                {/*
                  펼친 갈래에만 밑줄. 판이 넓어 어느 갈래에서 나온 것인지가 위치로 드러나지
                  않으므로, 갈래 쪽에 표시를 남겨야 한다.
                */}
                {open === item.label && (
                  <span aria-hidden className="absolute inset-x-0 -bottom-0.5 block h-0.5 bg-white" />
                )}
              </a>
            </div>
          ))}
        </nav>
      </div>

      {opened && <MegaPanel item={opened} onClose={() => setOpen(null)} />}
    </header>
  );
}

/** 화면 폭으로 펼쳐지는 판 — 묶음마다 한 칸. */
function MegaPanel({ item, onClose }: { item: SiteNavItem; onClose: () => void }) {
  return (
    <>
      {/*
        판 밖을 눌러 닫기 위한 자리. **색을 입히지 않는다.**

        전에는 여기에 검은 막(`bg-black/60`)을 깔아 뒤를 어둡게 했다. 그런데 판 자체가 이미
        검고 화면 폭을 다 쓰므로, 뒤까지 어두워지면 **어디까지가 메뉴인지**가 사라진다 — 판과
        막의 경계가 보이지 않아 화면 전체가 한 번 꺼진 것처럼 보였다.

        투명해도 닫는 일은 그대로 한다. 판 밖을 눌러 닫는 것은 배우지 않아도 하는 동작이라,
        보이지 않아도 **누르면 닫힌다**는 기대가 맞아떨어진다.
      */}
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="fixed inset-x-0 top-full h-screen cursor-default"
      />

      <div className="absolute inset-x-0 top-full border-t border-white/10 bg-black/85 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-320 grid-cols-2 gap-x-12 gap-y-10 px-6 py-10 lg:grid-cols-4">
          {item.groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <p className="text-xs font-medium tracking-wide text-white/40">{group.title}</p>
              <ul className="flex flex-col gap-3">
                {group.children.map((child) => (
                  <li key={child.href + child.label}>
                    <PanelItem child={child} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** 펼침 안의 한 줄. **이름만** 둔다 — 설명을 달면 펼침이 읽는 화면이 된다(`navigation.ts` 머리말). */
function PanelItem({ child }: { child: SiteNavChild }) {
  if (!child.ready) {
    return (
      <span className="flex items-center gap-2 text-sm font-semibold text-white/35">
        {child.label}
        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-3xs">준비중</span>
      </span>
    );
  }

  return (
    <a
      href={child.href}
      className="block text-sm font-semibold text-white/85 transition-colors duration-150 hover:text-white"
    >
      {child.label}
    </a>
  );
}

/**
 * 맨 위에서 벗어났는가.
 *
 * 문턱을 `8px` 로 둔 이유: `0` 으로 두면 탄력 스크롤(트랙패드에서 위로 튕기는 것)에 값이
 * 오가며 띠가 깜빡인다. 그렇다고 크게 두면 이미 글이 헤더 아래로 들어온 뒤에 띠가 켜진다.
 *
 * `passive` 를 주는 이유: 이 처리는 스크롤을 막을 일이 없다고 브라우저에 알리는 것이고,
 * 그래야 스크롤이 이 함수를 기다리지 않는다.
 */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); /* 새로고침이 중간에서 일어나면 처음부터 켜져 있어야 한다. */
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
}
