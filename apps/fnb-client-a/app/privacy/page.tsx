import type { Metadata } from 'next';
import { FNB_BRAND } from '@winpilot/store';
import { FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';

/**
 * Feature: `privacy` · F&B Client (템플릿 A) · route `/privacy`
 *
 * ## 약관과 달리 **여기는 비워 둘 수 없다**
 * 창업 상담 신청에서 성함 · 연락처 · 지역 · 예산을 받는다. 개인정보를 실제로 받고 있으므로
 * 무엇을 얼마나 보관하는지는 **지금 적혀 있어야 한다** — 원고가 없다는 이유로 비워 두면, 받고
 * 있으면서 안 밝히는 상태가 된다.
 *
 * 그래서 정식 처리방침 원고가 오기 전이라도 **실제로 하는 일**만큼은 적는다. 양식의 동의 문구와
 * 같은 말을 쓴다 — 두 곳의 말이 다르면 어느 쪽이 약속인지 알 수 없다.
 */
export const metadata: Metadata = { title: '개인정보 처리방침' };

/**
 * 지금 실제로 받는 것.
 *
 * 값을 store 에 두지 않은 이유: 이 표는 양식이 무엇을 받는지에 매여 있다. 어드민에서 따로
 * 고칠 수 있게 두면 **양식은 그대로인데 표만 바뀌는** 일이 생기고, 그때 어느 쪽이 사실인지
 * 화면으로는 알 수 없다. 양식을 고칠 때 이 표도 함께 고친다.
 */
const COLLECTED = [
  { what: '성함 · 연락처', why: '창업 상담 통화', keep: '상담 종료 후 6개월' },
  { what: '보고 계신 지역 · 예산 구간', why: '상담 순서와 담당자 배정', keep: '상담 종료 후 6개월' },
  { what: '하고 싶은 말', why: '첫 통화 전에 무엇이 궁금한지 파악', keep: '상담 종료 후 6개월' },
];

export default function PrivacySettingsPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        title="개인정보 처리방침"
        description="창업 상담 신청에서 받는 것과, 얼마나 보관하는지입니다."
        align="left"
      />

      <div className="flex flex-col gap-8">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="hidden gap-4 border-b border-border bg-surface px-6 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-3">
            <span>받는 것</span>
            <span>쓰는 곳</span>
            <span>보관 기간</span>
          </div>

          <ul className="flex flex-col">
            {COLLECTED.map((one) => (
              <li
                key={one.what}
                className="grid grid-cols-1 gap-2 border-b border-border px-6 py-4 text-sm last:border-b-0 lg:grid-cols-3 lg:gap-4"
              >
                <span className="font-medium">{one.what}</span>
                <span className="text-ink-muted">
                  <span className="mr-2 text-xs text-ink-faint lg:hidden">쓰는 곳</span>
                  {one.why}
                </span>
                <span className="text-ink-muted">
                  <span className="mr-2 text-xs text-ink-faint lg:hidden">보관</span>
                  {one.keep}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex max-w-3xl flex-col gap-4 rounded-2xl bg-surface px-8 py-8">
          <p className="text-sm leading-loose text-ink-muted">
            받은 것을 다른 곳에 넘기거나 팔지 않습니다. 보관 기간이 지나면 지웁니다. 지워 달라고
            하시면 그 전에도 지웁니다 — 아래로 말씀해 주세요.
          </p>
          <p className="text-sm leading-loose text-ink-muted">
            정식 처리방침 원고는 법무 검토 중이며, 확정되면 이 화면에 그대로 겁니다. 그때까지도 위에
            적힌 것 말고는 받지 않습니다.
          </p>
          <div className="flex flex-col gap-1 border-t border-border pt-5">
            <p className="text-xs text-ink-faint">개인정보보호책임자</p>
            <p className="text-sm font-medium">{FNB_BRAND.privacyOfficer}</p>
            <p className="font-mono text-sm">{FNB_BRAND.email}</p>
          </div>
        </div>
      </div>
    </FnbSiteShell>
  );
}
