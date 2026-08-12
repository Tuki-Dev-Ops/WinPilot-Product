import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FNB_BRAND, liveBanners, orderedFnbNotices, publicMenuItems } from '@winpilot/store';
import { FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { Carousel } from '@/app/_components/Carousel';
import { BrandPoints } from '@/app/_components/BrandPoints';
import { OctopusMark } from '@/app/_components/OctopusMark';
import { FactStrip } from '@/app/_components/FactStrip';
import { GrandOpenRoll } from '@/app/_components/GrandOpenRoll';
import { GrowthPanel } from '@/app/_components/GrowthPanel';
import { SalesRoll } from '@/app/_components/SalesRoll';
import { MenuCard } from '@/app/_components/MenuCard';
import { NoticeTicker } from '@/app/_components/NoticeTicker';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * Feature: `home` · F&B Client (템플릿 A) · route `/`
 *
 * ## 첫 화면이 답하는 것은 하나다 — **무엇을 파는 집인가**
 * 외식 브랜드 사이트의 첫 화면에 대개 매장 사진과 수상 내역이 깔린다. 그런데 처음 온 사람이
 * 그 화면에서 알고 싶은 것은 **무엇을 파는 집인가** 하나다. 그래서 여기는 한 줄(`tagline`)과
 * 두 개의 길(메뉴 보기 · 창업 상담)만 둔다.
 *
 * ## 손님 길과 점주 길을 첫 화면에서 갈라 둔다
 * 한 화면 안에서 둘을 섞으면 아래로 갈수록 누구에게 하는 말인지 흐려진다. 여기서는 위쪽 절반이
 * 손님(대표 메뉴 · 매장 수), 아래쪽 판이 점주(창업 비용 · 상담)다. 판의 배경색이 바뀌는 자리가
 * 곧 **말 거는 상대가 바뀌는 자리**다.
 *
 * ## 숫자를 세지 않고 값에서 읽는다
 * `매장 8곳` · `창업 비용 8,900만원` 을 글로 적어 두면 매장이 하나 늘 때 이 화면만 옛 숫자로
 * 남는다. 세는 일은 store 가 한다.
 */
export default function SiteHomePage() {
  /*
    슬라이더에 실을 메뉴 — **표가 붙은 것부터.**

    한때 `인기` 만 걸러 셋을 세웠다. 그런데 넓은 화면에서 한 번에 보이는 것이 셋이라 **밀 것이
    없었다** — 흐르지 않는 슬라이더는 그냥 목록이고, 밑줄은 늘 꽉 찬 채로 선다.

    전부를 싣되 차례를 표로 정한다. 첫 화면에 서는 것은 그대로 대표(`인기`·`신메뉴`)이고,
    미는 사람에게는 나머지가 이어진다. `sort` 는 순서가 같은 것끼리 자리를 지키므로 메뉴판의
    차례가 그 뒤에 그대로 따라온다.
  */
  const featured = [...publicMenuItems()].sort(
    (a, b) => Number(b.tags.length > 0) - Number(a.tags.length > 0),
  );

  /*
    첫 화면의 글을 **어드민 배너에서 받아 온다.**

    한때 `FNB_BRAND.tagline` 을 그대로 걸었다. 그러면 배너 화면 셋(목록 · 상세 · 등록)을 다
    만들어 두고도 **거기서 무엇을 저장하든 첫 화면이 그대로**였다 — 저장은 되는데 아무 일도
    일어나지 않는 상태다.

    걸린 배너가 없으면 브랜드 한 줄로 돌아간다. 첫 화면이 비는 것보다 낫고, 기간이 끝난 날
    새 배너를 미처 못 올렸을 때 그 자리를 브랜드가 메운다.

    오늘은 여기서 정해 넘긴다 — 조각 안에서 구하면 빌드한 날에 굳는다(`liveBanners` 머리말).
  */
  const banner = liveBanners(new Date().toISOString().slice(0, 10))[0];
  const headline = banner?.title ?? FNB_BRAND.tagline;
  const subcopy =
    banner?.subtitle ||
    '새벽 경매에서 받아 그날 다 씁니다. 남은 것으로 다음 날을 열지 않습니다 — 그 하나를 지키려고 매장 수를 천천히 늘려 왔습니다.';

  return (
    <FnbSiteShell
      overlay
      hero={
        <section className="relative flex min-h-dvh flex-col justify-end bg-night text-white">
          {/*
            사진 대신 큰 글자와 결. 브랜드 사진이 준비되기 전에 자리만 잡아 두면 **빈 회색 상자**가
            첫 화면이 되는데, 그것은 없는 것보다 나쁘다 — 사이트가 아직 안 만들어졌다는 인상을 준다.
          */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_38px,rgba(255,255,255,0.04)_38px_39px)]"
          />
          {/*
            아래에서 올라오는 적갈 기운. 검은 첫 화면이 그냥 검정이면 다음 칸(흰 바탕)과 만나는
            자리가 딱 잘려 보인다. 브랜드색이 바닥에서 옅게 올라오면 그 경계가 풀리고, 첫 화면에
            이미 브랜드색이 한 번 나온 셈이 된다.
          */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-octo-900/50 to-transparent"
          />

          {/*
            오른쪽에 문어를 크게 세운다. 첫 화면이 사진 없이 글자만 있을 때는 **무엇을 파는
            집인지**가 한 줄 소개를 읽어야만 드러났다 — 훑고 지나가는 사람은 그 줄도 안 읽는다.

            글 뒤로 숨기지 않고 옆에 둔다. 겹치면 큰 글씨의 획 사이로 다리가 지나가 둘 다 읽기
            어려워진다. 좁은 화면에서는 아예 감춘다(`hidden lg:block`) — 거기서는 글이 폭을
            다 써야 하고, 그림이 들어갈 자리가 남지 않는다.
          */}
          <OctopusMark className="absolute right-8 top-1/2 hidden size-96 -translate-y-1/2 text-white/[0.07] lg:block xl:right-24 xl:size-[30rem]" />

          <div className="relative mx-auto flex w-full max-w-320 flex-col gap-8 px-6 pb-24 pt-32">
            <p className="font-mono text-xs tracking-[0.3em] text-octo-300">SINCE {FNB_BRAND.foundedYear}</p>

            {/*
              제목을 **두 토막으로 갈라** 뒤엣것에 색을 준다. `통문어 한 마리, 그날 삶아 냅니다`
              처럼 쉼표로 나뉜 문장이라 자를 자리가 값 안에 이미 있다.

              쉼표가 없는 제목이 오면 색 없이 통째로 선다 — 억지로 자르면 낱말 가운데가 갈린다.
            */}
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight lg:text-6xl">
              {headline.includes(',') ? (
                <>
                  {headline.split(',')[0]},
                  <br />
                  <Accent onDark>{headline.split(',').slice(1).join(',').trim()}</Accent>
                </>
              ) : (
                headline
              )}
            </h1>

            <p className="max-w-2xl text-sm leading-loose text-white/60 lg:text-base">{subcopy}</p>

            <div className="mt-2 flex flex-wrap gap-3">
              {/*
                배너에 가는 곳이 적혀 있으면 그리로 보낸다. 비어 있으면(브랜드를 말하기만 하는
                배너) 늘 있는 두 길을 세운다 — 단추가 사라지면 첫 화면에서 갈 데가 없어진다.
              */}
              <HeroLink href={banner?.href || FNB_ROUTES.menu} primary>
                {banner?.href ? '자세히 보기' : '메뉴 보기'}
              </HeroLink>
              <HeroLink href={FNB_ROUTES.stores}>매장 찾기</HeroLink>
            </div>
          </div>
        </section>
      }
      bleed={
        <>
          {/*
            ── 숫자 띠 ── 첫 화면 바로 아래. 자리를 보고 있는 사람이 재는 셋이다(아래 머리말).

            공지보다 위인 이유: 공지는 **이미 우리를 아는 사람**이 읽고, 이 셋은 처음 온 사람이
            읽는다. 첫 화면 다음 자리는 처음 온 사람 것이다.
          */}
          <FactStrip />

          {/* ── 공지 ── 한 줄이다(아래 머리말) */}
          <NoticeStrip />

          {/*
            ── 손님에게 ── **가운데로 세운다.**

            아래 창업 칸은 왼쪽 맞춤이다. 둘을 다르게 두는 것은 읽는 사람이 다르기 때문이다 —
            여기는 지나가며 훑는 자리라 제목과 카드가 한 축에 모여야 눈이 덜 움직이고, 창업 칸은
            숫자와 조건을 따져 읽는 자리라 줄 시작이 한 줄로 서야 한다.
          */}
          <section className="mx-auto flex w-full max-w-320 flex-col items-center gap-10 px-6 py-24">
            <SectionHead
              label="메뉴"
              lead="처음 오시면 이것부터 권합니다"
              title={
                <>
                  그날 들어온 <Accent>문어</Accent>만 씁니다
                </>
              }
            />
            <Carousel slides={featured.map((one) => ({ id: one.id, node: <MenuCard item={one} /> }))} />
            <MoreLink href={FNB_ROUTES.menu}>전체 메뉴 보기</MoreLink>
          </section>

          {/* ── 매장 ── */}
          {/*
            바탕을 따뜻한 흰색(`octo-50`)으로 깐다. 회색(`surface`)을 쓰면 칸이 **그늘진 것**
            처럼 보이는데, 이 칸은 새로 여는 매장을 알리는 자리라 가라앉으면 안 된다.
          */}
          <section className="bg-octo-50">
            <div className="mx-auto flex w-full max-w-320 flex-col items-center gap-8 px-6 py-24">
              <SectionHead
                label="매장"
                lead={`${FNB_BRAND.foundedYear}년 군산 한 곳에서 시작했습니다`}
                title={
                  <>
                    <Accent>GRAND</Accent> OPEN
                  </>
                }
              />
              <GrandOpenRoll />
              <MoreLink href={FNB_ROUTES.stores}>매장 전체 보기</MoreLink>
            </div>
          </section>

          {/* ── 브랜드 ── 읽는 칸이라 카드가 아니라 잎 모양이다(아래 머리말) */}
          <section className="mx-auto flex w-full max-w-320 flex-col items-center gap-14 px-6 py-24">
            <SectionHead
              label="본사"
              lead="지원이라는 말로 뭉뚱그리지 않습니다"
              title={
                <>
                  매일 <Accent>하는 것</Accent>으로 말합니다
                </>
              }
            />
            <BrandPoints />
          </section>

          {/*
            ── 성장 ── **판의 색이 바뀌는 자리가 말 거는 상대가 바뀌는 자리다.**

            여기까지는 드시러 오는 분이 읽고, 여기부터는 차리려는 분이 읽는다. 검은 판이 그
            경계를 말한다 — 첫 화면과 푸터가 같은 검정이라 사이트가 위아래로 닫힌다.
          */}
          <section className="bg-night">
            <div className="mx-auto flex w-full max-w-320 flex-col items-center gap-12 px-6 py-24">
              <SectionHead
                label="창업 안내"
                lead="지금 점주의 절반 이상이 첫 장사입니다"
                title={
                  <>
                    자리를 잡으면 <Accent onDark>이만큼</Accent> 돕니다
                  </>
                }
                onDark
              />

              <GrowthPanel />
            </div>
          </section>

          {/*
            ── 매장별 실적 ── **검은 판에서 떼어 낸 흰 칸.**

            위 검은 판은 브랜드 전체를 요약하고, 이 칸은 매장 하나하나가 저마다 다르다고 말한다.
            한 판에 있을 때는 둘이 같은 값으로 읽혔다(`SalesRoll` 머리말).
          */}
          <section className="mx-auto flex w-full max-w-320 flex-col items-center gap-10 px-6 py-24">
            <SectionHead
              label="매장별 실적"
              lead="그래서 상담에서 자리부터 함께 봅니다"
              title={
                <>
                  자리가 다르면 <Accent>숫자</Accent>도 다릅니다
                </>
              }
            />
            <SalesRoll />
            <MoreLink href={FNB_ROUTES.franchise}>창업 안내 자세히 보기</MoreLink>
          </section>
        </>
      }
    />
  );
}

/**
 * 히어로 바로 아래의 공지 — **한 줄이다.**
 *
 * ## 왜 칸을 크게 두지 않나
 * 첫 화면 다음 자리는 이 사이트에서 가장 값이 나가는 자리다. 거기서 답해야 할 것은 **무엇을 파는
 * 집인가**이고, 그 답은 아래 대표 메뉴가 한다. 공지를 카드 여럿으로 펼치면 처음 온 사람이
 * 가격 조정 안내부터 읽게 된다 — 아직 뭘 파는지도 모르는 사람에게.
 *
 * 그렇다고 아래로 내리거나 뺄 수도 없다. 가격이 오르거나 매장이 문을 닫는 일은 **묻기 전에
 * 읽혀야** 하고, 그것이 푸터에만 있으면 아무도 못 본다.
 *
 * 한 줄이 그 둘을 다 만족한다. 지나가며 읽히되 자리를 뺏지 않는다.
 *
 * ## 한 줄에 여럿을 굴린다
 * 줄을 셋 세우면 그것은 띠가 아니라 목록이다. 대신 **한 줄 자리에서 달력 넘기듯 위로** 굴린다 —
 * 자리는 한 줄인데 넷을 다 보여 줄 수 있다. 어떻게 굴리는지는 `NoticeTicker` 머리말에 있다.
 *
 * 차례는 store 가 정한다(`orderedFnbNotices`) — 공지 목록 화면과 **같은 차례**여야 한다.
 * 여기서 본 것을 누르고 들어갔더니 다른 차례로 서 있으면 그때부터 목록을 못 믿는다.
 *
 * ## 없으면 띠도 없다
 * 공지가 하나도 없을 때 빈 띠를 세우면 히어로와 메뉴 사이에 뜻 없는 줄 하나가 남는다.
 */
function NoticeStrip() {
  const notices = orderedFnbNotices();
  if (notices.length === 0) return null;

  return (
    <section className="border-b border-border bg-canvas">
      <div className="mx-auto flex w-full max-w-320 items-center gap-x-5 px-6 py-4">
        <span className="shrink-0 rounded-full bg-night px-3 py-1 text-xs font-bold tracking-wide text-white">
          공지
        </span>

        {/* 굴러가는 한 줄. 날짜도 제목과 함께 넘어간다 — 따로 두면 짝이 어긋난 날짜가 선다. */}
        <NoticeTicker notices={notices} />

        <a
          href={FNB_ROUTES.notices}
          className="group flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-70"
        >
          전체보기
          <ArrowUpRight
            aria-hidden
            className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </section>
  );
}

/** 첫 화면의 길 둘. 주된 것 하나만 채운 단추다 — 둘 다 채우면 어느 쪽이 주된 것인지 사라진다. */
function HeroLink({ href, primary, children }: { href: string; primary?: boolean; children: string }) {
  return (
    <a
      href={href}
      className={`rounded-full px-6 py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-85 ${
        primary ? 'bg-octo-500 text-white' : 'border border-white/30 text-white'
      }`}
    >
      {children}
    </a>
  );
}

/**
 * 칸 머리 — **이름표 · 제목 · 짧은 선.**
 *
 * ## 이름표가 브랜드색이다
 * 한때 회색(`ink-faint`)이었다. 그러면 칸마다 위에 흐린 글자 한 줄이 떠 있을 뿐 아무 일도
 * 하지 않는다. 적갈로 바꾸면 그 한 줄이 **여기부터 새 칸**이라고 말하고, 아래로 내려가는 내내
 * 같은 색이 반복되어 사이트에 표정이 생긴다.
 *
 * ## 제목을 키웠다
 * 24px 이었다. 카드 안 제목이 16px 이라 둘의 차이가 한 단계뿐이었고, 그래서 칸 제목이 **카드
 * 하나처럼** 읽혔다. 32/40px 로 벌리면 훑는 눈이 칸의 경계를 먼저 만난다.
 *
 * ## 제목 아래 짧은 선
 * 가운데 정렬한 제목은 좌우가 비어 있어 어디서 끝났는지가 흐리다. 짧은 선 하나가 그 끝을
 * 찍어 주고, 브랜드색이 한 번 더 나온다 — 이름표와 같은 색이라 색이 늘지는 않는다.
 *
 * 어두운 판에서도 쓴다(`onDark`). 그때는 이름표를 흐린 흰색으로 두는데, 적갈은 검정 위에서
 * 가라앉아 이름표가 안 읽히기 때문이다. 선만 적갈로 남긴다 — 선은 색이 옅어도 형태로 보인다.
 */
function SectionHead({
  label,
  lead,
  title,
  onDark,
}: {
  label: string;
  /**
   * 제목 위의 **작은 한 문장**. 없어도 된다.
   *
   * 프랜차이즈 사이트가 칸마다 두 층으로 말하는 자리다 — 작은 글씨가 말을 걸고 큰 글씨가
   * 단언한다. 한 층으로만 두면 제목이 **간판처럼** 읽혀, 무엇을 보여 주려는 칸인지가 흐리다.
   */
  lead?: string;
  title: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p
        className={`text-xs font-bold uppercase tracking-widest ${
          onDark ? 'text-white/40' : 'text-octo-700'
        }`}
      >
        {label}
      </p>

      {lead && <p className={`text-sm ${onDark ? 'text-white/60' : 'text-ink-muted'}`}>{lead}</p>}

      <h2 className={`text-3xl font-bold tracking-tight lg:text-4xl ${onDark ? 'text-white' : ''}`}>
        {title}
      </h2>
      <span aria-hidden className="mt-1 block h-0.5 w-10 rounded-full bg-octo-500" />
    </div>
  );
}

/**
 * 제목 안에서 **한 낱말만 브랜드색으로.**
 *
 * 프랜차이즈 사이트의 헤드라인이 늘 이 모양이다 — 문장 전체를 색칠하면 읽기 어렵고, 색이
 * 하나도 없으면 그 문장이 무엇을 자랑하는지가 안 드러난다. 한 낱말이면 눈이 거기 먼저 닿고
 * 나머지를 이어 읽는다.
 *
 * 어두운 판에서는 500 이 가라앉아 300 을 쓴다 — 같은 색의 밝은 자리다.
 */
function Accent({ onDark, children }: { onDark?: boolean; children: string }) {
  return <span className={onDark ? 'text-octo-300' : 'text-octo-600'}>{children}</span>;
}


/**
 * 칸 아래에서 더 보러 가는 길.
 *
 * 브랜드색으로 둔다. 검은 글씨였을 때는 본문과 같은 색이라 **링크로 보이지 않았고**, 밑줄을
 * 그으면 칸마다 밑줄 하나가 떠서 지저분했다. 색 하나면 누를 것이라는 게 드러난다.
 */
function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="group flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-octo-700 transition-opacity duration-150 hover:opacity-70"
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}
