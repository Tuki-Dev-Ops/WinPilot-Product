import type { Metadata } from 'next';
import { AdminShell } from './_components/AdminShell';
import { BarChart, LineChart } from './statistics/_components/Charts';
import { StatCard, StatGrid, StatSection } from './statistics/_components/StatCard';
import { BANNERS, periodText, SCHEDULE_TONE, scheduleState } from '@/lib/data/banners';
import { changeRate, DAILY, formatAmount, PAGE_VIEWS, pointsFor, shortAmount, sum } from '@/lib/data/analytics';
import { INQUIRIES, INQUIRY_STATE_TONE, pathLabel } from '@/lib/data/inquiries';
import { ORDERS, PAY_TONE, SHIP_TONE } from '@/lib/data/orders';
import { optionLabelOf } from '@/lib/data/product-options';
import { todayStamp } from '@/lib/data/product-tags';
import { PRODUCTS } from '@/lib/data/products';
import { parseAmount } from '@/lib/validation/product-record';
import { Badge } from '@winpilot/ui';

/**
 * Feature: `site.dashboard` · B2C Admin · route `/`
 *
 * 대시보드는 **다른 화면의 요약**이다. 여기 숫자는 전부 각 화면이 쓰는 시드에서 나온다 —
 * 대시보드만 따로 가진 숫자를 두면 목록과 어긋나고, 어긋난 순간 아무도 대시보드를 믿지 않는다.
 * 모든 묶음은 그 숫자를 실제로 다루는 화면으로 이어진다.
 */
export const metadata: Metadata = {
  title: '대시보드 — WinPilot Admin',
  robots: { index: false, follow: false },
};

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="shrink-0 whitespace-nowrap text-sm text-brand-700 dark:text-brand-300">
      {label}
    </a>
  );
}

function TodoSection({
  title,
  href,
  linkLabel,
  emptyText,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  emptyText: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <SectionLink href={href} label={linkLabel} />
      </div>
      {children.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">{emptyText}</p>
      ) : (
        <div className="flex flex-col">{children}</div>
      )}
    </section>
  );
}

const TODO_ROW =
  'flex items-center justify-between gap-3 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface';

export default function AdminSiteDashboardPage() {
  const today = todayStamp();
  const week = pointsFor('7d');
  const last = DAILY[DAILY.length - 1];

  // 처리해야 할 일 — 읽고 끝나는 숫자보다 '남아 있는 일' 이 먼저다.
  const unanswered = INQUIRIES.filter((inquiry) => inquiry.state !== '답변완료');
  const waitingShipment = ORDERS.filter((order) => order.shipState === '배송준비' && order.payState === '결제완료');
  const exchanges = ORDERS.filter((order) => order.shipState === '교환요청');
  const soldOut = PRODUCTS.filter((product) => parseAmount(product.stock) === 0);
  const endedBanners = BANNERS.filter((banner) => scheduleState(banner, today) === '종료');

  return (
    <AdminShell sectionId="dashboard" trail={['대시보드']}>
      <StatGrid>
        <StatCard
          label="어제 주문"
          value={`${last?.orders ?? 0}건`}
          change={changeRate('7d', 'orders')}
          hint="최근 7일 · 직전 7일 대비"
        />
        <StatCard
          label="최근 7일 매출"
          value={`${formatAmount(sum(week, 'revenue'))}원`}
          change={changeRate('7d', 'revenue')}
        />
        <StatCard label="배송 준비" value={`${waitingShipment.length}건`} hint="운송장 등록 필요" />
        <StatCard label="미답변 문의" value={`${unanswered.length}건`} hint="접수 · 처리중 · 보류" />
      </StatGrid>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <StatSection title="매출 추이" action={<SectionLink href="/statistics" label="통계로" />}>
            <LineChart
              points={week.map((point) => ({ label: point.date.slice(5), value: point.revenue }))}
              formatTick={shortAmount}
              ariaLabel="최근 7일 매출 추이"
            />
          </StatSection>

          <section
            data-ssot-cid="b2c-admin/site.dashboard#AdminSiteDashboardOrders"
            className="overflow-hidden rounded-xl border border-border bg-canvas"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">최근 주문</h2>
              <SectionLink href="/products/sales" label="판매 목록" />
            </div>

            <div className="flex flex-col">
              {ORDERS.slice(0, 5).map((order) => (
                <a
                  key={order.id}
                  href={`/products/sales/${order.id}`}
                  className="group flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                >
                  <span className="shrink-0 font-mono text-sm text-ink-muted">{order.id}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {order.productName}
                    <span className="ml-1.5 text-ink-muted">· {optionLabelOf(order.optionId)}</span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">{formatAmount(order.amount)}원</span>
                  <Badge tone={PAY_TONE[order.payState]}>
                    {order.payState}
                  </Badge>
                  <Badge tone={SHIP_TONE[order.shipState]}>
                    {order.shipState}
                  </Badge>
                </a>
              ))}
            </div>
          </section>

          <StatSection
            title="많이 방문한 페이지"
            action={<SectionLink href="/statistics/pages" label="전체 보기" />}
          >
            <BarChart
              points={PAGE_VIEWS.slice(0, 5).map((page) => ({ label: page.label, value: page.views }))}
              formatValue={(value) => `${formatAmount(value)}회`}
              ariaLabel="많이 방문한 페이지"
            />
          </StatSection>
        </div>

        {/* 오른쪽은 전부 '지금 손대야 하는 것' 이다. */}
        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-96">
          <TodoSection
            title="처리 필요 문의"
            href="/inquiries"
            linkLabel="문의로"
            emptyText="답변할 문의가 없습니다."
          >
            {unanswered.slice(0, 4).map((inquiry) => (
              <a key={inquiry.id} href="/inquiries" className={TODO_ROW}>
                <div className="min-w-0">
                  <p className="min-w-0 truncate text-sm font-medium">{inquiry.title}</p>
                  <p className="min-w-0 truncate text-xs text-ink-faint">
                    {pathLabel(inquiry.path)} · {inquiry.name}
                  </p>
                </div>
                <Badge tone={INQUIRY_STATE_TONE[inquiry.state]}>
                  {inquiry.state}
                </Badge>
              </a>
            ))}
          </TodoSection>

          <TodoSection
            title="품절 상품"
            href="/products"
            linkLabel="상품 목록"
            emptyText="품절된 상품이 없습니다."
          >
            {soldOut.map((product) => (
              <a key={product.id} href={`/products/${product.id}`} className={TODO_ROW}>
                <div className="min-w-0">
                  <p className="min-w-0 truncate text-sm font-medium">{product.name}</p>
                  <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{product.id}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-signal-danger/12 px-2.5 py-1 text-xs font-medium text-signal-danger">
                  재고 0
                </span>
              </a>
            ))}
          </TodoSection>

          <TodoSection
            title="교환 요청"
            href="/products/sales"
            linkLabel="판매로"
            emptyText="교환 요청이 없습니다."
          >
            {exchanges.map((order) => (
              <a key={order.id} href={`/products/sales/${order.id}`} className={TODO_ROW}>
                <div className="min-w-0">
                  <p className="min-w-0 truncate text-sm font-medium">{order.productName}</p>
                  <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                    {order.id} · {order.buyerName}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-ink-muted">
                  {optionLabelOf(order.optionId)}
                </span>
              </a>
            ))}
          </TodoSection>

          <TodoSection
            title="노출 종료 배너"
            href="/banners"
            linkLabel="배너로"
            emptyText="종료된 배너가 없습니다."
          >
            {endedBanners.map((banner) => (
              <a key={banner.id} href={`/banners/${banner.id}`} className={TODO_ROW}>
                <div className="min-w-0">
                  <p className="min-w-0 truncate text-sm font-medium">{banner.title}</p>
                  <p className="min-w-0 truncate text-xs text-ink-faint">{periodText(banner)}</p>
                </div>
                <Badge tone={SCHEDULE_TONE['종료']}>
                  종료
                </Badge>
              </a>
            ))}
          </TodoSection>
        </aside>
      </div>
    </AdminShell>
  );
}
