import type { Metadata } from 'next';
import { IR_COMPANY, MILESTONES, publicCredentials } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `site.about` · IR Client (템플릿 A) · route `/about`
 *
 * ## 세 층으로 둔다 — 한 줄 · 숫자 · 표
 * 전에는 문장 하나와 표 하나뿐이었다. 표는 확인하러 온 사람에게는 맞지만 **처음 온 사람에게는
 * 읽을 것이 없다** — 대표 이름과 주소를 보러 오는 사람은 드물다.
 *
 * 그래서 가운데에 **숫자 넉 줄**을 둔다. 설립 연도 · 상장 시장 · 연혁 수 · 특허와 인증 수.
 * 넷 다 이미 있는 값을 세는 것이라 지어낸 것이 없고, 회사의 크기와 나이를 한 눈에 준다.
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
 * - 연혁 수 ← 같은 store 의 `MILESTONES` (B2C Admin 의 회사 > 연혁이 고친다)
 */
export const metadata: Metadata = { title: `회사 소개 — ${IR_COMPANY.name}` };

export default function ProfileSettingsPage() {
  const visibleMilestones = MILESTONES.filter((one) => one.visible);

  /* 설립 연도만 잘라 쓴다. `2019-04-01` 을 그대로 두면 넉 줄 중 이 칸만 길어져 줄이 어긋난다. */
  const foundedYear = IR_COMPANY.foundedAt.slice(0, 4);

  return (
    <IrSiteShell>
      <IrPageTitle title="회사 소개" description={IR_COMPANY.intro} />

      {/*
        숫자 넉 줄. 값 아래에 이름을 두는 것이 아니라 **이름 아래에 값**을 둔다 — 훑는 눈은
        작은 글씨(이름)를 먼저 지나 큰 글씨(값)에서 멈추고, 그 차례가 반대면 값을 보고 나서
        그것이 무엇인지 되짚어 올라가야 한다.
      */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        <Stat label="설립" value={foundedYear} note="년" />
        <Stat label="상장" value={IR_COMPANY.market} note={IR_COMPANY.ticker} />
        <Stat label="연혁" value={`${visibleMilestones.length}`} note="건" />
        <Stat label="특허 · 인증" value={`${publicCredentials().length}`} note="건" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">회사 정보</h2>

        <IrTable
          columns={[{ label: '항목' }, { label: '내용' }]}
          rows={[
            ['회사명', `${IR_COMPANY.name} (${IR_COMPANY.nameEn})`],
            ['대표이사', IR_COMPANY.ceo],
            ['사업자등록번호', IR_COMPANY.businessNumber],
            ['설립일', IR_COMPANY.foundedAt],
            ['상장일', `${IR_COMPANY.listedAt} · ${IR_COMPANY.market}`],
            ['종목코드', IR_COMPANY.ticker],
            ['본사', IR_COMPANY.address],
          ]}
          empty="회사 정보를 불러오지 못했습니다."
        />
      </section>

    </IrSiteShell>
  );
}

/** 숫자 한 칸. 칸 사이 선은 바깥 격자의 `gap-px` 가 그린다 — 칸마다 테두리를 두르면 선이 겹쳐 두꺼워진다. */
function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 bg-canvas px-6 py-5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
        <span className="text-xs text-ink-muted">{note}</span>
      </p>
    </div>
  );
}

