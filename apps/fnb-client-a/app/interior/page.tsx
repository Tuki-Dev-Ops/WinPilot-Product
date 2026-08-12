import type { Metadata } from 'next';
import { INTERIOR_PER_PYEONG } from '@winpilot/store';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { SectionLabel } from '@/app/_components/SectionLabel';
import { PhotoMosaic } from './_components/PhotoMosaic';
import { PlanCarousel } from './_components/PlanCarousel';

/**
 * Feature: `interior.detail` · F&B Client (템플릿 A) · route `/interior`
 *
 * ## 사진보다 숫자가 먼저다
 * 인테리어 소개에 흔히 완성 매장 사진만 깔린다. 그런데 자리를 보고 있는 사람이 그 사진에서
 * 알아내는 것은 없다 — 예뻐 보인다는 것뿐이고, 그것은 어느 브랜드 사진이나 같다. 그 사람이
 * 실제로 묻는 것은 **내 평수에 얼마가 들고 몇 석이 나오느냐**다.
 *
 * 그래서 평형별 안이 굴림판 한 장씩 서고, 사진 자리 바로 아래에 값과 좌석 수가 함께 온다.
 * 왜 세 칸으로 깔지 않았는지는 `PlanCarousel` 머리말에 있다.
 *
 * ## 공사비를 표에 적지 않고 계산한다
 * 평당 단가 하나(`INTERIOR_PER_PYEONG`)에서 세 값이 나온다. 평형마다 금액을 적어 두면 단가가
 * 오르는 날 셋 중 하나가 옛 값으로 남고, 그 어긋남은 세 줄을 나란히 놓아야만 보인다.
 * 창업 안내의 비용표도 같은 단가에서 나온다.
 *
 * ## 좌석 수를 함께 적는다
 * 평수만으로는 하루에 몇 번 돌릴 수 있는지를 셀 수 없다. 그 값이 매출 계산의 시작이라,
 * 상담 전에 스스로 두들겨 보는 사람이 실제로 많다.
 *
 * ## 상담으로 보내는 판이 없다
 * 다른 화면 다섯은 맨 아래에서 창업 상담으로 보낸다. 여기는 뺐다 — 이 화면이 답하는 것은
 * **얼마 드는가** 하나이고, 그 물음으로 온 사람은 값을 본 뒤 창업 안내로 간다. 검은 판이 사진
 * 모자이크 바로 아래에 서면 방금 본 사진의 색을 덮기도 했다.
 *
 * 갈 길이 없어진 것은 아니다. 헤더의 `창업안내` 와 푸터가 그대로 있고, 창업 안내 화면이 비용
 * 표를 다 보여 준 자리에서 신청으로 보낸다.
 *
 * ## 어드민 연동
 * - 평형 · 좌석 · 기간 ← `@winpilot/store` 의 `INTERIOR_PLANS`
 * - 평당 단가 ← 같은 곳의 `INTERIOR_PER_PYEONG` (창업 비용표와 같은 값)
 * - 사진 목록 ← 같은 곳의 `INTERIOR_GALLERY`
 */
export const metadata: Metadata = { title: '인테리어' };

export default function InteriorSettingsPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Interior"
        title={
          <>
            내 평수에 <Accent>얼마</Accent> 드나
          </>
        }
        description={`평당 ${INTERIOR_PER_PYEONG}만원. 철거 · 소방 · 외부 간판은 따로 듭니다.`}
      />

      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-6">
          <SectionLabel>평형별 안</SectionLabel>

          <PlanCarousel />
        </section>

        <PhotoMosaic />
      </div>
    </FnbSiteShell>
  );
}
