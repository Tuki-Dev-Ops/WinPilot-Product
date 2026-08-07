import type { Metadata } from 'next';
import { IR_COMPANY, STOCK } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `stock.detail` · IR Client (템플릿 A) · route `/stock`
 *
 * **지연 시세임을 반드시 적는다.** 적지 않으면 실시간으로 읽고 그 차이로 판단한 뒤에야 안다.
 * 기준 시각을 숫자 바로 옆에 두는 이유도 같다.
 */
export const metadata: Metadata = { title: `주가 정보 — ${IR_COMPANY.name}` };

export default function IrStockDetailPage() {
  return (
    <IrSiteShell>
      <IrPageTitle
        title="주가 정보"
        description={`${IR_COMPANY.market} ${IR_COMPANY.ticker} · 지연 시세이며 실시간과 다를 수 있습니다.`}
      />

      <IrSubNav current={IR_ROUTES.stock} />

      <section className="flex flex-wrap items-baseline gap-x-10 gap-y-4 rounded-xl border border-border px-6 py-6">
        <div>
          <p className="text-3xl font-semibold tabular-nums">{STOCK.price.toLocaleString('ko-KR')}원</p>
          <p className={`text-sm tabular-nums ${STOCK.change >= 0 ? 'text-signal-danger' : 'text-brand-700'}`}>
            {STOCK.change >= 0 ? '▲' : '▼'} {Math.abs(STOCK.change).toLocaleString('ko-KR')} ({STOCK.changeRate}%)
          </p>
        </div>
        <p className="font-mono text-xs tabular-nums text-ink-faint">{STOCK.at} 기준 · 지연 시세</p>
      </section>

      <IrTable
        columns={[{ label: '항목' }, { label: '값', align: 'right' }]}
        rows={[
          ['거래량', `${STOCK.volume.toLocaleString('ko-KR')}주`],
          ['시가총액', `${STOCK.marketCap.toLocaleString('ko-KR')} 백만원`],
          ['52주 최고', `${STOCK.high52.toLocaleString('ko-KR')}원`],
          ['52주 최저', `${STOCK.low52.toLocaleString('ko-KR')}원`],
        ]}
        empty="주가 정보를 불러오지 못했습니다."
      />
    </IrSiteShell>
  );
}
