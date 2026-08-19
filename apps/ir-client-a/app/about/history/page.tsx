import type { Metadata } from 'next';
import { IR_COMPANY, MILESTONES, sortMilestones } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';

/**
 * Feature: `milestone.list` · IR Client (템플릿 A) · route `/about/history`
 *
 * ## 해를 왼쪽에 크게 세운다
 * 연혁에서 사람이 먼저 찾는 것은 사건이 아니라 **언제**다 — "그게 몇 년이었지" 로 들어와
 * 그 해의 줄만 읽는다. 그래서 해를 왼쪽 기둥에 크게 한 번 세우고, 같은 해의 일은 그 오른쪽에
 * 묶어 둔다. 줄마다 해를 되풀이하면 **몇 해에 걸친 이야기인지**가 사라진다.
 *
 * ## 세로선과 점을 걷어냈다
 * 왼쪽에 파란 점이 박힌 세로선을 세워 두었다. 하나로 이어져 여기까지 왔다는 것을 선으로
 * 말하려던 것인데, 회사 소개 화면이 **선도 점도 쓰지 않는 어법**으로 정리되면서 이 화면만
 * 색을 가진 장치가 남았다. 한 사이트에서 같은 뜻을 화면마다 다른 장치로 말하면, 그 장치가
 * 뜻이 아니라 **그 화면의 버릇**으로 읽힌다.
 *
 * 지금은 해마다 실선 하나와 **옅은 큰 연도**다. 이어져 있다는 것은 선이 아니라 해가 빠짐없이
 * 이어지는 것으로 보인다.
 *
 * ## 위가 최신이다
 * `sortMilestones` 가 최신순으로 준다. 오래된 것부터 쌓으면 **지금 무엇을 하는 회사인지**가
 * 맨 아래에 있게 되는데, 여기 오는 사람의 절반은 첫 화면만 보고 나간다.
 *
 * ## 왼쪽에 연도 기둥을 세운다
 * 해가 늘수록 아래로 길어져, `2019` 를 보려면 화면을 여러 번 굴려야 했다. 왼쪽에 연도만 모아
 * 두면 **몇 해짜리 이야기인지**가 한눈에 들어오고 원하는 해로 바로 뛴다.
 *
 * 자바스크립트 없이 **닻(`#year-2026`)**으로 뛴다. 주소에 남으므로 뒤로 가기가 듣고, 특정
 * 해를 그대로 공유할 수 있다 — 굴려서 옮기는 것으로 만들면 그 둘을 다 잃는다.
 *
 * 지금 보고 있는 해를 켜는 일만 브라우저가 한다(`YearNav`). 누르는 순간 바로 켜고 그 뒤로는
 * 화면이 켠다 — 누름만으로 켜면 굴려 내려간 뒤에도 옛 해가 켜져 있고, 보는 것만으로 켜면
 * 부드러운 스크롤이 도는 동안 눌린 것인지 알 수 없다.
 *
 * 머리띠가 `sticky` 라 그냥 뛰면 제목이 그 밑에 깔린다. `scroll-mt-28` 로 그만큼 비운다.
 *
 * ## 점이 두 가지다
 * 맨 위(가장 최근)만 **채운 점**이고 나머지는 **속이 빈 점**이다. 연혁에서 눈이 먼저 찾는 것은
 * 지금 어디까지 왔는가이고, 점이 전부 같으면 그 자리가 목록 안에서 사라진다.
 *
 * 선은 마지막 묶음에서 **서서히 옅어진다.** 전에는 바탕색 조각으로 아래를 덮어 잘랐는데,
 * 그 방식은 바탕이 흰색일 때만 맞는다 — 칸 색이 바뀌면 덮은 자리가 네모로 드러난다.
 *
 * ## 오른쪽 절반이 비어 있었다
 * 월 · 제목 · 설명이 한 줄로 쌓여, 글이 왼쪽 절반에서 끝나고 나머지는 흰 여백이었다. 항목이
 * 셋뿐이라 그 빈 자리가 **아직 안 만든 화면**처럼 보였다.
 *
 * 한 항목을 **두 칸으로 나눈다** — 왼쪽에 월과 한 일, 오른쪽에 그 설명. 연혁에서 훑는 사람이
 * 읽는 것은 왼쪽뿐이고, 오른쪽은 멈춰 선 사람만 읽는다. 두 칸으로 두면 훑는 눈이 제목만
 * 따라 내려갈 수 있고, 화면도 끝까지 찬다.
 *
 * 카드로 감싸지 않았다. 테두리를 두르면 셋이 **나란히 놓인 별개의 상자**가 되는데, 연혁이
 * 말하려는 것은 그 반대다. 아래 실선 하나만 긋는다.
 *
 * ## 문장은 배너가 든다
 * 배너 바로 아래가 연도 기둥이라 화면이 **목록으로 시작해 목록으로 끝났다.** 무엇을 보는
 * 자리인지 말하는 줄이 없어서 본문 첫 칸에 한 문장을 두었는데, 배너가 문장을 받게 되면서
 * 그리로 올렸다 — 같은 말이 배너와 본문 첫 칸에 두 번 서 있었다.
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 의 `MILESTONES` 다. **B2C Admin 의 회사 > 연혁**이 그 값을
 *   고치고 있어, 여기에 따로 두면 같은 회사의 연혁이 두 벌이 된다.
 * - 숨김(`visible: false`)인 것은 여기 오지 않는다.
 */
/**
 * 한 구간에 담는 햇수.
 *
 * 다섯이다. 셋이면 구간이 잦게 끊겨 왼쪽 큰 제목이 계속 새로 서고, 열이면 한 구간에 열
 * 해가 들어가 **어느 시기의 일인지**가 오른쪽 작은 연도에만 남는다.
 */
const SPAN = 5;

export const metadata: Metadata = { title: `연혁 — ${IR_COMPANY.name}` };

export default function MilestoneListPage() {
  const rows = sortMilestones(MILESTONES.filter((one) => one.visible));

  /*
    해마다 묶는다. 배열의 차례를 그대로 지키려고 `Map` 을 쓴다 — 평범한 객체는 **숫자처럼 생긴
    키를 오름차순으로 재배열**해서, 최신순으로 정렬해 둔 것이 2019 부터로 뒤집힌다.
  */
  const byYear = new Map<string, typeof rows>();
  for (const one of rows) {
    const box = byYear.get(one.year);
    if (box) box.push(one);
    else byYear.set(one.year, [one]);
  }

  /*
    해를 다시 **구간**으로 묶는다. 해마다 큰 제목을 세우면 항목이 하나뿐인 해에서도 제목이
    화면 절반을 차지해, 연혁이 아니라 제목 목록이 된다. 다섯 해씩 묶으면 왼쪽 제목 하나가
    오른쪽 여러 줄을 거느려 **한 시기**로 읽힌다.

    맨 위 구간만 이름이 `Now` 로 시작한다 — 끝난 시기가 아니라 지금 이어지는 시기라서다.
  */
  const eras: { label: string; id: string; items: typeof rows }[] = [];
  for (const [year, items] of byYear) {
    const at = Number(year);
    const head = eras[eras.length - 1];
    const openable = head && Number(head.items[0]?.year ?? 0) - at < SPAN;

    if (openable && head) head.items.push(...items);
    else eras.push({ label: '', id: `era-${year}`, items: [...items] });
  }

  for (const [index, era] of eras.entries()) {
    const newest = era.items[0]?.year ?? '';
    const oldest = era.items[era.items.length - 1]?.year ?? '';
    /*
      맨 위 구간만 **현재**로 닫는다 — 끝난 시기가 아니라 지금 이어지는 시기라서다.

      한때 `Now-2024` 였다. 화면의 다른 큰 글씨가 다 한글인데 이 자리만 영문이라 **한 화면에
      두 말이 섞였고**, 읽는 차례도 오른쪽에서 왼쪽으로(2024 → Now) 흘러 어색했다. 한글로
      두면 `2024 – 현재` 로 왼쪽에서 오른쪽으로 읽힌다.
    */
    era.label = index === 0 ? `${oldest} – 현재` : `${oldest} – ${newest}`;
  }

  return (
    <IrSiteShell hero={<PageHero title="연혁" image="/hero/history.jpg" />}>
      {eras.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          등록된 연혁이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-20 lg:gap-32">
          {eras.map((era) => (
            /*
              구간 하나 = **왼쪽 큰 이름 + 오른쪽 줄 목록**.

              왼쪽 이름은 따라 붙는다(`sticky`). 오른쪽이 길게 흐르는 동안 어느 시기를 보고
              있는지가 화면에 남아야 하는데, 위에 가로로 두면 다섯 줄쯤에서 화면 밖으로 나간다.
            */
            <section key={era.id} id={era.id} className="grid scroll-mt-28 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
              {/*
                구간 이름은 **얇고 크다.** 굵게 두면 오른쪽 항목 제목과 같은 무게가 되어 둘이
                다투는데, 이 글자는 읽으라고 있는 것이 아니라 **어느 시기인지 알려 주려고**
                있다. 얇고 크면 눈에는 먼저 들어오되 읽는 차례는 오른쪽에 넘어간다.
              */}
              {/*
                고정폭 글꼴(`font-mono`)이었다. 숫자를 가지런히 세우려던 것인데 `현재` 가
                함께 서면서 **한글이 고정폭으로 벌어져** 글자 사이가 뜬다. 숫자 넷은 이
                크기에서 굳이 맞출 필요가 없다.
              */}
              <h2 className="text-4xl font-light leading-none tracking-tight lg:sticky lg:top-28 lg:h-fit lg:text-6xl xl:text-7xl">
                {era.label}
              </h2>

              <ol className="flex min-w-0 flex-col">
                {era.items.map((one) => (
                  /*
                    한 줄 = **연도 · 한 일**. 줄마다 위에 실선을 긋는다 — 아래에 그으면 마지막
                    줄 밑으로 선이 남아 다음 구간이 시작된 것처럼 보인다.
                  */
                  <li
                    key={one.id}
                    className="grid grid-cols-[minmax(0,3.5rem)_minmax(0,1fr)] gap-x-6 border-t border-border py-7 last:border-b sm:grid-cols-[minmax(0,6rem)_minmax(0,1fr)] sm:gap-x-10"
                  >
                    {/*
                      연도는 작고 옅다. 같은 해가 여러 줄에 되풀이되므로 진하게 두면 같은
                      숫자가 세로로 늘어서서, 그 반복이 한 일보다 먼저 읽힌다.
                    */}
                    <span className="pt-0.5 font-mono text-xs tabular-nums text-ink-faint sm:text-sm">
                      {one.year}
                    </span>

                    <div className="flex min-w-0 flex-col gap-2">
                      <p className="text-base font-bold leading-relaxed tracking-tight lg:text-lg">{one.title}</p>
                      {/*
                        설명은 있으면 붙이고 없으면 만다. 원본이 한 줄짜리 항목과 두 줄짜리
                        항목을 함께 갖는데, 없는 자리에 빈 줄을 두면 줄 높이가 들쭉날쭉해진다.
                      */}
                      {one.description && (
                        <p className="text-sm leading-loose text-ink-muted">{one.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </IrSiteShell>
  );
}
