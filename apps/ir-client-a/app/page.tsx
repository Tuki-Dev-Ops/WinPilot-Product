import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { HomeHero } from '@/app/_components/HomeHero';
import { HomeIntro } from '@/app/_components/HomeIntro';
import { HomeMedia } from '@/app/_components/HomeMedia';
import { HomeService } from '@/app/_components/HomeService';
import { HomeSolutions } from '@/app/_components/HomeSolutions';
import { IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `site.home` · IR Client (템플릿 A) · route `/`
 *
 * 첫 화면부터 차례로 답한다 — **무슨 회사인가**(첫 화면 · 소개) → **무엇을 파는가**(서비스 ·
 * 솔루션) → **진짜로 하고 있나**(미디어).
 *
 * ## 공시·주가·일정을 여기서 뺐다
 * 전에는 아래쪽에 최근 공시 세 줄과 지연 시세, 다가오는 일정을 두었다. 뺀 이유:
 *
 * 이 화면은 **처음 온 사람**이 무슨 회사인지 알아보는 자리다. 공시를 보러 오는 사람은 이미
 * 이 회사를 알고 주소를 치거나 검색으로 들어오고, 그 사람에게 필요한 것은 세 줄짜리 요약이
 * 아니라 **전체 목록**이다 — 그것은 `/disclosures` 와 `/schedules` 가 이미 하고 있다.
 *
 * 요약을 두면 두 가지가 따라온다. 하나는 같은 값이 두 곳에 보이는 것이고(그중 하나는 늘
 * 오래된 것이 된다), 다른 하나는 **소개와 숫자가 한 화면에 섞이는 것**이다. IR 로 가는 길은
 * 푸터의 `IR 정보` 묶음이 통째로 열어 두고 있다.
 *
 * ## 그래서 본문(`children`)이 없다
 * 이 화면은 좌우 끝까지 닿는 칸들로만 이뤄진다. 껍데기는 본문이 없으면 `<main>` 자체를 두지
 * 않는다 — 빈 `<main>` 은 여백만 남겨 칸과 칸 사이를 벌린다.
 */
export const metadata: Metadata = { title: `${IR_COMPANY.name} — 스마트 자동화 ERP` };

export default function IrSiteHomePage() {
  return (
    <IrSiteShell
      overlay
      /*
        배경 영상은 **장마다 다르고** 저장소 안(`public/hero/`)에 있다. 어느 장에 무엇이
        깔리는지는 `HomeHero` 의 `SLIDES` 가 들고 있고, 출처와 라이선스는 그 폴더의
        `README.md` 에 적어 두었다.
      */
      hero={<HomeHero />}
      bleed={
        <>
          <HomeIntro />
          <HomeService />
          <HomeSolutions />
          <HomeMedia />
        </>
      }
    />
  );
}
