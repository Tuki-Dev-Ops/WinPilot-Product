import type { Metadata } from 'next';
import { IR_COMPANY, publicSolutions } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { IR_ROUTES } from '@/lib/navigation';
import { BusinessAreas } from './_components/BusinessAreas';
import { CapabilityBands } from './_components/CapabilityBands';
import { Manifesto } from './_components/Manifesto';
import { Vision } from './_components/Vision';

/**
 * Feature: `site.about` · IR Client (템플릿 A) · route `/about`
 *
 * ## 네 칸으로 둔다 — 지향 · 한 문장 · 하는 일 넷 · 파는 것 넷
 * 상장 제조사의 회사 소개가 거의 같은 차례로 선다. 이름은 회사마다 다르지만 순서는 같다 —
 * **무엇을 바라보는가(VISION) → 한 문장으로 말하면 → 그것을 어떻게 하는가 → 그래서 무엇을
 * 파는가.**
 *
 * 앞의 둘은 읽는 칸이고 뒤의 둘은 고르는 칸이다. 그 차례를 뒤집으면 **처음 온 사람이 고를
 * 것부터** 보게 된다.
 *
 * ## 여기까지 온 길
 * 1. 표 하나였다 — 확인하러 온 사람에게는 맞지만 처음 온 사람에게는 읽을 것이 없었다.
 * 2. 사진과 문장, 카드 넷, 기업정보 띠를 얹었다 — 카드 넷이 한 줄에 나란히 서서 **넷 다 같은
 *    것**으로 보였고, 회사가 하는 일을 말하는 자리가 사양표처럼 읽혔다.
 * 3. 지금은 **하나씩 화면 절반**을 쓴다(`CapabilityBands`). 하나를 볼 때 다른 셋이 눈에 없다.
 *
 * ## 뺀 것들
 * - `AboutIntro`(사진 왼쪽 · 글 오른쪽) — 그 자리의 표제는 배너로 올라갔고, 남은 사진 한 장과
 *   두 줄은 아래 밴드 넷이 훨씬 넓게 하고 있다.
 * - `WhatWeDo`(카드 넷) — 같은 넷이 밴드가 되었다.
 * - `FactoryStack`(어두운 층 띠) — 네 층(설비 · 수집 · 판단 · 화면)이 밴드 넷과 **같은 말**이다.
 *   층으로 한 번, 밴드로 또 한 번 말하면 읽는 사람은 둘이 다른 것인 줄 알고 두 번 읽는다.
 * - `CompanyFacts`(기업정보 격자) — 회사명 · 대표이사 · 설립일 · 종목코드 · 사업자등록번호가
 *   여덟 칸으로 서 있었다. **그 값들은 이미 푸터에 있다** — 어느 화면에서든 같은 자리에서
 *   보이는 값이라 회사 소개에만 한 번 더 크게 두면, 소개를 다 읽고 내려온 눈이 마지막으로
 *   만나는 것이 사업자등록번호가 된다.
 *
 * 셋 다 파일을 지웠다. 남겨 두면 다음 사람이 어느 쪽이 지금 쓰는 것인지 모른다.
 *
 * ## 숫자를 두지 않는다
 * 가운데에 숫자 넉 줄(설립 · 상장 · 연혁 수 · 특허 수)을 두었다가 뺐다. 설립과 상장은 푸터가
 * 이미 말하고, 연혁 수와 특허 수는 **그 화면에 가면 세어져 있는 값**이다.
 *
 * 없는 숫자를 지어내지도 않는다 — 회사 소개에서 가장 흔한 자리가 `고객사 000개 · 가동률 00%`
 * 인데, 그 값이 사실이 아니면 그 칸은 회사 소개가 아니라 광고가 된다.
 *
 * ## 어드민 연동
 * - 회사 정보 ← `@winpilot/store` 의 `IR_COMPANY`
 * - 사업 영역 ← 같은 store 의 `SOLUTIONS` (IR 어드민 제품)
 */
export const metadata: Metadata = { title: `회사 소개 — ${IR_COMPANY.name}` };

export default function ProfileSettingsPage() {
  return (
    <IrSiteShell
      hero={
        <PageHero title="회사 소개" image="/hero/about.jpg" />
      }
      after={
        <>
          {/*
            밴드 넷은 사진이 화면 왼쪽 끝까지 닿아야 해서 본문 밖에 선다. 본문(`main`)은
            `max-w-320` 으로 묶여 있어 그 안에서는 음수 여백으로도 벗어나지 못한다.
          */}
          <CapabilityBands
            items={[
              {
                name: 'Standardize',
                body: '설비와 작업자, 자재에서 나오는 기록을 실시간으로 모아 하나의 규격으로 맞춥니다. 설비마다 다르던 신호가 같은 기준을 갖게 되면서 관리의 사각지대가 사라집니다.',
                image: '/solutions/mes.jpg',
                href: '/solutions/mes',
                more: 'VIEW MORE',
              },
              {
                name: 'Connect',
                body: '수주에서 매입과 생산, 출하와 정산에 이르기까지를 하나의 자원 위에 올립니다. 한 번 적은 값이 다음 단계로 그대로 흐르므로, 마감이 숫자를 맞추는 일이 아니라 확인하는 일이 됩니다.',
                image: '/solutions/erp.jpg',
                href: '/solutions/erp',
                more: 'VIEW MORE',
              },
              {
                name: 'Decide',
                body: '표준이 된 데이터 위에서 비가동과 불량의 원인을 셉니다. 사람의 기억에만 남던 이유가 코드와 숫자로 남고, AI 판단이 입력으로 삼는 자리도 여기입니다.',
                image: '/solutions/dxp.jpg',
                href: IR_ROUTES.products,
                more: 'VIEW MORE',
              },
              {
                name: 'Operate',
                body: '코드 없이 화면을 만들고, 도입한 뒤의 인프라와 유지보수까지 사람이 붙어 함께 봅니다. 도입이 끝이 아니라 그때부터가 운영입니다.',
                image: '/solutions/crm.jpg',
                href: '/solutions/infra',
                more: 'VIEW MORE',
              },
            ]}
          />

          {/*
            사업 영역은 `store` 를 읽는다. 위의 밴드 넷은 제품이 늘어도 그대로지만 이쪽은
            제품이 늘면 함께 늘어야 하고, 그것을 아는 곳은 `store` 뿐이다.
          */}
          <BusinessAreas
            headline="공장 안의 설비부터 사무실의 장부까지, 한 줄로 잇습니다."
            lead="한 회사가 쓰는 도구가 서로 다른 말을 하지 않도록, 현장과 기간계 사이를 같은 데이터로 채웁니다. 네 제품은 따로 쓰셔도 되고, 하나만 먼저 들이고 나중에 붙이셔도 됩니다."
            more="VIEW MORE"
            areas={publicSolutions().map((one) => ({
              name: `Cloud ${one.name}`,
              body: one.tagline,
              image: `/solutions/${one.id}.jpg`,
              href: one.href,
            }))}
          />

        </>
      }
    >
      <Vision
        label="VISION"
        statement="설비에서 나온 신호가 표준이 되고, 그 위에서 판단과 실행이 도는 공장을 만듭니다."
        pillars={[
          { no: '1', name: 'Standard data', body: ['설비마다 다르던 기록을', '하나의 규격으로'] },
          { no: '2', name: 'Connected operations', body: ['수주에서 정산까지', '끊기지 않는 한 줄로'] },
          { no: '3', name: 'Judgment and execution', body: ['표준이 된 데이터 위에서', '판단하고 실행하도록'] },
        ]}
      />

      <Manifesto
        lines={[
          '사람의 기억이 아니라 남은 기록이',
          '다음 공정을 정하도록,',
          '현장이 일하는 방식을 바꿔 가고 있습니다.',
        ]}
      />
    </IrSiteShell>
  );
}
