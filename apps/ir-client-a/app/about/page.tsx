import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { CREDENTIALS, IR_COMPANY, MILESTONES } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IrTable } from '@/app/_components/IrTable';
import { IR_ROUTES } from '@/lib/navigation';

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
 * ## 어드민 연동
 * - 회사 정보 ← `@winpilot/store` 의 `IR_COMPANY`
 * - 연혁 수 ← 같은 store 의 `MILESTONES` (B2C Admin 의 회사 > 연혁이 고친다)
 */
export const metadata: Metadata = { title: `회사 소개 — ${IR_COMPANY.name}` };

export default function SiteAboutPage() {
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
        <Stat label="특허 · 인증" value={`${CREDENTIALS.length}`} note="건" />
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

      {/*
        다음으로 갈 곳을 **끝에 둔다.** 표를 다 읽은 사람이 그 다음에 묻는 것은 대개 둘이다 —
        어떻게 여기까지 왔나(연혁), 무엇을 가지고 있나(특허). 그 둘만 두고 나머지는 두지 않는다.
      */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NextLink href={IR_ROUTES.history} title="연혁" desc="회사가 지나온 자리" />
        <NextLink href={IR_ROUTES.certifications} title="특허 및 인증" desc="등록번호로 확인하실 수 있습니다" />
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

function NextLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border px-6 py-5 transition-colors duration-150 hover:bg-surface"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs text-ink-muted">{desc}</span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="size-5 shrink-0 text-ink-faint transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={1.8}
      />
    </a>
  );
}
