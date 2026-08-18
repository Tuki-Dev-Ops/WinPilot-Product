import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import {
  Building2,
  CalendarCheck,
  Cpu,
  Factory,
  Hash,
  Landmark,
  LayoutGrid,
  LineChart,
  MapPin,
  UserRound,
} from 'lucide-react';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { AboutIntro } from './_components/AboutIntro';
import { CompanyFacts } from './_components/CompanyFacts';
import { FactoryStack } from './_components/FactoryStack';
import { WhatWeDo } from './_components/WhatWeDo';

/**
 * Feature: `site.about` · IR Client (템플릿 A) · route `/about`
 *
 * ## 네 층으로 둔다 — 배너 · 소개 · 하는 일 · 기업정보 띠
 * 전에는 문장 하나와 표 하나뿐이었다. 표는 확인하러 온 사람에게는 맞지만 **처음 온 사람에게는
 * 읽을 것이 없다** — 대표 이름과 주소를 보러 오는 사람은 드물다.
 *
 * 그래서 위에 **사진과 문장**을 두어 무엇을 하는 회사인지 먼저 답하고, 그 아래에 **하는 일 넷**을,
 * 맨 아래에 **기업정보 띠**를 둔다.
 *
 * 하는 일 넷은 파는 것 여섯을 **묶어서 줄인 것**이다. 여섯을 그대로 늘어놓으면 헤더 펼침 ·
 * 제품 화면 · 여기 셋이 같은 목록을 갖는다 — 여기는 무엇을 파는지가 아니라 **어떤 일을 하는
 * 회사인지**를 말하는 자리다.
 *
 * 가운데에 숫자 넉 줄(설립 · 상장 · 연혁 수 · 특허 수)을 두었다가 뺐다. 설립과 상장은 아래
 * 기업정보 카드가 이미 말하고, 연혁 수와 특허 수는 **그 화면에 가면 세어져 있는 값**이라
 * 여기서 다시 세면 두 곳이 각각 세는 셈이 된다.
 *
 * ## 표를 카드로 바꿨다
 * 회사 정보 일곱 줄이 표였다. 표는 **줄끼리 견주는** 자리에 맞는데, 대표이사와 설립일을 나란히
 * 놓고 크기를 재는 사람은 없다. 하나씩 집어 가는 값이라 카드가 맞고, 화면 끝까지 닿는 띠에
 * 얹어 훑어 내리는 눈이 여기서 한 번 멈추게 했다.
 *
 * ## 긴 소개 글을 두지 않는 이유
 * 홈 화면이 이미 무엇을 하는 회사인지 말했다. 여기서 그것을 다시 길게 쓰면 **같은 말이 두 곳에
 * 있고**, 고칠 때 한쪽만 고쳐진다. 여기는 확인하러 온 사람의 자리다.
 *
 * ## 끝에 두었던 바로가기 둘을 뺐다
 * 표 아래에 `연혁` 과 `특허 및 인증` 으로 가는 칸이 있었다. 뺀 이유: 그 둘은 **헤더의 회사 소개
 * 아래에 이미 서 있다.** 같은 길을 화면 안에 한 번 더 두면, 화면이 끝났다는 신호가 있어야 할
 * 자리에 링크 두 개가 서서 아래가 더 있는 것처럼 읽힌다.
 *
 * ## 어드민 연동
 * - 회사 정보 ← `@winpilot/store` 의 `IR_COMPANY`
 */
export const metadata: Metadata = { title: `회사 소개 — ${IR_COMPANY.name}` };

export default function ProfileSettingsPage() {
  return (
    <IrSiteShell
      hero={<PageHero title="회사 소개" image="/solutions/mes.jpg" />}
      after={
        <>
          <FactoryStack
            label="Architecture"
            headline="설비에서 시작해 사람이 보는 화면에서 끝납니다."
            lead="네 층은 따로 파는 것이 아니라 한 줄로 이어져 있습니다. 아래 층이 없으면 위 층이 볼 것이 없고, 위 층이 없으면 아래 층이 모은 것을 쓸 곳이 없습니다."
            layers={[
              {
                name: '설비 · 신호',
                body: 'PLC 와 센서, 계측기에서 나오는 신호를 있는 그대로 받습니다. 설비를 바꾸지 않고 붙는 것이 여기서 정해집니다.',
              },
              {
                name: '수집 · 표준화',
                body: '설비마다 다른 모양을 하나의 규격으로 바꿉니다. 위의 두 층이 같은 데이터를 보게 되는 것이 이 층 덕분입니다.',
              },
              {
                name: '판단 · 최적화',
                body: '표준이 된 데이터 위에서 비가동과 불량의 원인을 셉니다. AI 판단이 입력으로 삼는 자리도 여기입니다.',
              },
              {
                name: '화면 · 실행',
                body: '현장과 사무실이 각자 필요한 화면으로 봅니다. 판단이 공정과 물류의 실행으로 이어지는 것도 이 층에서 합니다.',
              },
            ]}
          />

          <CompanyFacts
            /*
            표제는 값이 아니라 화면이 든다. 어드민에서 고칠 수 있게 두면 계절 행사 문구가
            이 자리에 서는 날이 온다 — 여기는 늘 같은 말을 해야 하는 자리다.
          */
            headline={`${IR_COMPANY.name}은 자원 중심의 설계와 어긋나지 않는 구현으로, 오래 쓰는 운영 도구를 만듭니다.`}
            facts={[
              {
                label: '회사명',
                value: `${IR_COMPANY.name} (${IR_COMPANY.nameEn})`,
                icon: Building2,
              },
              { label: '대표이사', value: IR_COMPANY.ceo, icon: UserRound },
              {
                label: '설립일',
                value: IR_COMPANY.foundedAt,
                icon: CalendarCheck,
              },
              {
                label: '상장',
                value: `${IR_COMPANY.listedAt} · ${IR_COMPANY.market}`,
                icon: Landmark,
              },
              { label: '종목코드', value: IR_COMPANY.ticker, icon: Hash },
              {
                label: '사업자등록번호',
                value: IR_COMPANY.businessNumber,
                icon: Hash,
              },
              { label: '본사', value: IR_COMPANY.address, icon: MapPin },
            ]}
          />
        </>
      }
    >
      <AboutIntro
        headline="공장의 데이터를 표준으로, 표준 위에서 판단으로"
        body={IR_COMPANY.intro}
        image="/solutions/erp.jpg"
        points={[
          {
            label: '만드는 것',
            value: '제조 현장과 기간계를 잇는 운영 소프트웨어',
          },
          {
            label: '일하는 방식',
            value: '자원 중심 설계 · 디자인과 코드를 한 규격으로',
          },
          {
            label: '닿는 곳',
            value: '설비와 공정, 그리고 그 데이터를 보는 사람',
          },
        ]}
      />

      <WhatWeDo
        label="하는 일"
        headline="설비에서 나온 신호를 표준 데이터로 바꾸고, 그 위에서 판단과 실행이 돌게 합니다."
        items={[
          {
            title: '현장 데이터 표준화',
            body: '설비 · 작업자 · 자재의 기록을 실시간으로 모아 하나의 규격으로 맞춥니다. 관리의 사각지대가 사라집니다.',
            icon: Factory,
          },
          {
            title: '기간계 연결',
            body: '수주에서 매입 · 생산 · 출하 · 정산까지 하나의 자원으로 잇습니다. 한 번 적은 값이 다음 단계로 그대로 흐릅니다.',
            icon: LineChart,
          },
          {
            title: '판단과 실행',
            body: '표준화된 데이터 위에서 AI 가 판단하고, 공정 · 물류 로봇이 실행합니다.',
            icon: Cpu,
          },
          {
            title: '화면과 운영',
            body: '코드 없이 화면을 만들고, 도입 이후의 인프라와 유지보수까지 사람이 붙어 함께 봅니다.',
            icon: LayoutGrid,
          },
        ]}
      />
    </IrSiteShell>
  );
}
