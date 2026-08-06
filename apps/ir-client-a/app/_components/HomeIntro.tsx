import { ArrowUpRight } from 'lucide-react';
import { IR_COMPANY } from '@winpilot/store';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * 첫 화면 바로 아래 — **이 회사가 무엇을 하는가** 한 판.
 *
 * ## 히어로와 색을 잇는다
 * 배경이 히어로와 같은 `#05060d` 다. 여기서 흰 바탕으로 끊으면 스크롤을 내린 사람이 **다른
 * 화면으로 넘어온 것으로** 읽는다. 어두운 판을 한 번 더 지나고 나서 흰 본문(공시·주가)이
 * 시작되어야, 첫 화면 → 소개 → 자료로 이어지는 층이 생긴다.
 *
 * ## 왼쪽은 이름, 오른쪽은 설명
 * 한 덩어리로 늘어놓으면 큰 제목이 문단의 머리처럼 읽혀 **문단을 다 읽어야** 무슨 회사인지
 * 안다. 좌우로 갈라 두면 왼쪽만 보고 지나가는 사람도 이름과 한 줄은 가져간다 — 스크롤을
 * 빠르게 내리는 사람이 실제로 읽는 것은 그만큼이다.
 *
 * 좁은 화면에서는 위아래로 선다. 폭이 모자란 채로 좌우를 유지하면 큰 제목이 글자마다 끊긴다.
 *
 * ## 여기서 끝내지 않는다
 * 소개는 세 문장이고, 더 읽을 사람은 `자세히 보기`로 회사 소개(`/about`)에 간다. 첫 화면
 * 아래에 회사 연혁까지 늘어놓으면 정작 아래에 있는 **공시와 주가**를 아무도 만나지 못한다.
 *
 * ## 어드민 연동
 * - 회사 이름·소개 ← `@winpilot/store` 의 `IR_COMPANY`
 */
export function HomeIntro() {
  return (
    <section className="bg-[#05060d] px-6 py-24 text-white lg:py-32">
      <div className="mx-auto grid w-full max-w-320 grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <p className="text-lg font-bold tracking-tight">{IR_COMPANY.brandEn} Digital Factory</p>

          {/*
            두 줄로 끊어 적는다(`<br />` 대신 블록 둘). 한 문장으로 두면 화면 폭에 따라 끊기는
            자리가 달라져, 넓은 화면에서는 `AX·RX` 만 둘째 줄에 홀로 남는다.
          */}
          <h2 className="text-4xl font-bold leading-[1.25] tracking-tight lg:text-5xl lg:leading-[1.2]">
            <span className="block">스마트 자동화 ERP로</span>
            <span className="block">제조를 잇는 회사</span>
          </h2>
        </div>

        <div className="flex flex-col gap-6 lg:pt-2">
          <p className="text-base font-bold leading-relaxed lg:text-lg">
            {IR_COMPANY.name}은 ERP·MES·CRM을 한 자원으로 이어
            <br />
            제조 현장의 데이터를 표준으로 만들어 왔습니다.
          </p>

          <p className="text-sm leading-loose text-white/70 lg:text-base">
            이제는 표준화된 제조 데이터 위에서 AI가 판단(AX)하고 설비와 로봇이 실행(RX)합니다. 수주에서
            생산·출하·정산까지가 한 줄로 흐르므로, 부서마다 같은 값을 옮겨 적던 자리가 사라집니다.
            <br />
            사람은 확인하는 일에서 벗어나 판단이 필요한 일에 섭니다.
          </p>

          <a
            href={IR_ROUTES.about}
            className="group mt-2 inline-flex w-fit items-center gap-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            자세히 보기
            {/*
              화살표는 아이콘 라이브러리(`lucide-react`)에서 가져온다. 손으로 그린 `path` 를
              화면마다 두면 **같은 화살표가 굵기와 끝 모양이 조금씩 다른 채로** 늘어난다 —
              그림 파일이 아니라 SVG 컴포넌트라 Figma 로 뽑는 데도 걸림이 없다.
            */}
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[#05060d] transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
