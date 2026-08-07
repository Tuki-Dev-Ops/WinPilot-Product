'use client';

import { Badge, PageHeading } from '@winpilot/ui';
import { IR_COMPANY, SITE_INTRO } from '@winpilot/store';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * 회사 > 소개.
 *
 * ## 두 곳에 나가는 값이 한 화면에 있다
 * 위쪽 `첫 화면 소개` 는 홈 둘째 칸에, 아래 `회사 정보` 는 ABOUT 화면의 표에 선다. 나눠 두면
 * 회사 이름을 고치러 온 사람이 **어느 화면을 고쳐야 하는지** 먼저 알아내야 한다.
 *
 * ## 여기서 고치지 않는다
 * 값은 보여 주기만 한다. 회사 정보(`IR_COMPANY`)는 공시·푸터·사업자 표시가 함께 읽는 값이라,
 * 고치는 자리는 **한 곳에서 검토를 지나** 바뀌어야 한다 — 대표이사 이름이 사이트마다 다르면
 * 그것이 먼저 눈에 띄는 것은 밖이다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function CompanyAboutView() {
  return (
    <>
      <PageHeading title="회사 소개" description="첫 화면의 소개 문단과 회사 정보입니다." />

      <IrPanel title="첫 화면 소개" description="홈 둘째 칸에 그대로 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <Row label="영문 머리글" value={`${IR_COMPANY.brandEn} ${SITE_INTRO.eyebrow}`} />
          <Row label="큰 제목" value={SITE_INTRO.headline.join(' / ')} />
          <Row label="굵은 줄" value={SITE_INTRO.lead.join(' ')} />
          <Row label="본문" value={SITE_INTRO.body.join(' ')} />
        </div>
      </IrPanel>

      <IrPanel title="회사 정보" description="ABOUT 화면의 표와 사이트 푸터가 읽습니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <Row label="회사명" value={`${IR_COMPANY.name} (${IR_COMPANY.nameEn})`} />
          <Row label="대표이사" value={IR_COMPANY.ceo} />
          <Row label="사업자등록번호" value={IR_COMPANY.businessNumber} />
          <Row label="설립일" value={IR_COMPANY.foundedAt} />
          <Row label="상장" value={`${IR_COMPANY.listedAt} · ${IR_COMPANY.market} ${IR_COMPANY.ticker}`} />
          <Row label="본사" value={IR_COMPANY.address} />
          <Row label="개인정보보호책임자" value={IR_COMPANY.privacyOfficer} />
        </div>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 회사 정보는 공시·푸터·사업자 표시가 함께 읽습니다. 고치는
        자리는 한 곳이어야 합니다 — 대표이사 이름이 사이트마다 다르면 그것이 먼저 눈에 띄는 곳은 밖입니다.
      </p>
    </>
  );
}

/** 이름과 값 한 줄. 좁은 화면에서는 위아래로 선다. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
      <span className="w-40 shrink-0 text-xs text-ink-faint">{label}</span>
      <span className="min-w-0 text-sm leading-relaxed">{value}</span>
    </div>
  );
}
