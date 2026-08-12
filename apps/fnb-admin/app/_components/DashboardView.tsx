import { PageHeading, Panel, PanelSummary, type SummaryCard } from '@winpilot/ui';
import {
  FNB_BANNERS,
  FNB_POPUPS,
  FRANCHISE_INQUIRIES,
  MENU_ITEMS,
  STORES,
  bannerState,
  publicFnbNotices,
} from '@winpilot/store';

/**
 * 대시보드 — **오늘 손대야 할 것 하나를 먼저 보여 준다.**
 *
 * ## 매출 숫자를 두지 않았다
 * 어드민 첫 화면에 흔히 매출 그래프가 깔린다. 여기는 없다 — 매장 매출은 POS 와 배달앱이 갖고
 * 있고, 그것을 옮겨 오면 **두 곳의 숫자가 다른 상태**가 만들어진다. 어느 쪽이 맞는지 모르게
 * 되면 두 화면 다 안 보게 된다(`fnb-menu.ts` 머리말).
 *
 * ## 대신 밀린 것을 보여 준다
 * 이 콘솔에서 **늦으면 밖에 표가 나는 것**은 창업 문의뿐이다. 사이트에 하루 안에 연락한다고
 * 적어 두었으므로, 답하지 않은 건수가 곧 지키지 못한 약속의 개수다. 그래서 그 카드만 색이 붙는다.
 *
 * ## 지금 사이트에 걸린 것을 함께 세운다
 * 배너와 팝업은 **기간이 지나면 저절로 내려간다.** 그것이 편한 만큼, 지금 무엇이 걸려 있는지를
 * 아무도 모르는 상태가 되기도 쉽다 — 목록을 열어야만 알 수 있으면 안 열어 본다.
 *
 * 팝업 수만 색을 붙인다. 셋을 넘으면 사이트에 들어온 사람이 팝업 셋을 닫고서야 첫 화면에
 * 닿는데, 그 상태는 **올린 사람 눈에는 안 보인다.**
 *
 * ## 오늘을 화면이 정한다
 * `bannerState()` 안에서 `new Date()` 를 부르지 않는 이유는 배너 목록 머리말에 있다 — 미리
 * 만들어 두는 화면에서 그 값이 빌드한 날에 굳는다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function DashboardView({ today }: { today: string }) {
  const waiting = FRANCHISE_INQUIRIES.filter((one) => one.state === '접수');
  const talking = FRANCHISE_INQUIRIES.filter((one) => one.state === '상담중');
  const opening = STORES.filter((one) => one.state === '준비중');
  const hidden = MENU_ITEMS.filter((one) => !one.visible);
  const liveBanners = FNB_BANNERS.filter((one) => bannerState(one, today) === '노출 중');
  const livePopups = FNB_POPUPS.filter((one) => bannerState(one, today) === '노출 중');

  const cards: SummaryCard[] = [
    {
      label: '답하지 않은 창업 문의',
      value: `${waiting.length}건`,
      /* 밀린 것이 있을 때만 색을 준다 — 늘 붉으면 붉은 것이 뜻을 잃는다. */
      ...(waiting.length > 0 ? { tone: 'text-signal-danger' } : {}),
      hint: '사이트에 하루 안에 연락한다고 적혀 있습니다',
    },
    { label: '상담 중', value: `${talking.length}건`, hint: '통화를 시작한 건' },
    { label: '문 여는 가맹점', value: `${opening.length}곳`, hint: '준비중으로 사이트에 서 있습니다' },
    { label: '내려 둔 메뉴', value: `${hidden.length}가지`, hint: '품절 · 계절 메뉴' },
    { label: '걸린 배너', value: `${liveBanners.length}개`, hint: '첫 화면에 지금 서 있는 것' },
    {
      label: '뜨는 팝업',
      value: `${livePopups.length}개`,
      /* 셋을 넘으면 첫 화면에 닿기까지 셋을 닫아야 한다 — 그때만 색을 준다. */
      ...(livePopups.length > 3 ? { tone: 'text-signal-danger' } : {}),
      hint: '닫아야 넘어갑니다 — 셋을 넘기지 마세요',
    },
  ];

  return (
    <>
      <PageHeading title="대시보드" description="오늘 손대야 할 것부터 보여 드립니다." />

      <PanelSummary cards={cards} />

      <Panel
        title="답을 기다리는 창업 문의"
        description="접수된 채로 남아 있는 것들입니다. 오래된 것이 위입니다."
      >
        {waiting.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-muted">밀린 문의가 없습니다.</p>
        ) : (
          <ul className="flex flex-col">
            {[...waiting]
              .sort((a, b) => a.receivedOn.localeCompare(b.receivedOn))
              .map((one) => (
                <li
                  key={one.id}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border px-6 py-4 text-sm last:border-b-0"
                >
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{one.receivedOn}</span>
                  <span className="font-medium">{one.name}</span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">{one.phone}</span>
                  <span className="text-xs text-ink-muted">
                    {one.region} · {one.budget}
                  </span>
                  <a
                    href={`/inquiries/${one.id}`}
                    className="ml-auto text-xs font-medium text-brand-700 dark:text-brand-300"
                  >
                    열기
                  </a>
                </li>
              ))}
          </ul>
        )}
      </Panel>

      <Panel title="사이트에 걸린 공지" description="손님이 지금 읽고 있는 것입니다.">
        <ul className="flex flex-col">
          {publicFnbNotices().map((one) => (
            <li
              key={one.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-6 py-4 text-sm last:border-b-0"
            >
              <span className="font-mono text-xs tabular-nums text-ink-faint">{one.postedOn}</span>
              <span className="min-w-0 truncate font-medium">{one.title}</span>
              {one.pinned && <span className="text-xs text-ink-muted">맨 위 고정</span>}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
