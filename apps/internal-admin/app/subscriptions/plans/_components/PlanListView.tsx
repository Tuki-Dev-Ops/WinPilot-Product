'use client';

import { useMemo, useState } from 'react';
import { Badge, ListToolbar, PageHeading, type ListToolbarTab } from '@winpilot/ui';
import { InternalEmpty, InternalPanel } from '@/app/_components/InternalPanel';
import { formatCount, formatWon, PLANS, type PlanRecord } from '@/lib/data/subscriptions';
import {
  DOMAIN_NOTE,
  FEATURE_GROUPS,
  PLAN_DOMAINS,
  PLAN_FEATURES,
  type PlanDomain,
} from '@/lib/data/plan-features';
import { PlanMatrix, PlanMatrixEmpty } from './PlanMatrix';




/**
 * 플랜 — 도메인마다 **베이직 · 스탠다드 · 엔터프라이즈 셋**.
 *
 * ## 화면이 두 층인 이유
 * 위는 **요금과 한도**, 아래는 **기능 비교표**다. 한 카드에 둘을 함께 넣으면 같은 기능
 * 이름이 등급 수만큼 되풀이되고, "스탠다드에는 있고 베이직에는 없는 것" 을 찾으려면 카드
 * 사이를 눈으로 오가야 한다 — 계약 자리에서 가장 많이 받는 물음이 그것이다.
 * 행이 기능, 열이 등급이면 그 물음이 한 줄 읽기로 바뀐다.
 *
 * ## 등록이 없다
 * 등급이 셋으로 고정이라 **새로 만드는 것이 아니라 있는 셋을 고치는 자리**다
 * (`lib/data/subscriptions.ts` 의 `PLANS` 머리말).
 *
 * ## 탭이 도메인인 이유
 * 파는 것이 다르면 같은 등급 이름이 다른 것을 가리킨다 — B2C 의 회원 상한은 소비자 수이고
 * B2B 에서 같은 숫자는 거래처 담당자 수다.
 */
export function PlanListView() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<PlanDomain>('B2C');
  const [rows, setRows] = useState<PlanRecord[]>(PLANS);

  /*
    탭을 **판매 상태가 아니라 도메인**으로 가른다.

    파는 것이 다르면 등급이 뜻하는 것도 다르다 — B2C 의 회원 상한은 소비자 수이고 B2B 에서
    같은 숫자는 거래처 담당자 수다. 한 목록에 섞으면 '스탠다드' 라는 말이 두 가지를 가리킨다.
    판매 상태는 각 플랜 카드의 배지가 이미 말하고 있어 탭으로 또 가를 이유가 없다.
  */
  const tabs: ListToolbarTab[] = PLAN_DOMAINS.map((one) => ({
    id: one,
    label: one,
    count: rows.filter((plan) => plan.domain === one).length,
  }));

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((plan) => {
      if (plan.domain !== tab) return false;
      if (!keyword) return true;
      return plan.name.toLowerCase().includes(keyword) || plan.id.toLowerCase().includes(keyword);
    });
  }, [rows, search, tab]);

  const sellable = rows.filter((plan) => plan.sellable);
  const contracted = rows.reduce((sum, plan) => sum + plan.tenants, 0);
  const monthly = rows.reduce((sum, plan) => sum + plan.monthly * plan.tenants, 0);

  /*
    **플랜 등록이 없다.** 등급은 도메인마다 셋으로 고정이라(`subscriptions.ts` 의 `PLANS`
    머리말) 새로 만드는 것이 아니라 있는 셋을 고치는 자리다. 누를 수 있는데 만들면 안 되는
    단추를 두면, 눌러 본 사람이 왜 안 되는지를 찾게 된다.
  */

  return (
    <>
      <PageHeading title="플랜" description="등록된 플랜과 판매 상태를 확인하세요." />

      {/* 거를 것이 판매 상태 하나뿐이라 필터 단추를 따로 두지 않는다 — 탭이 그 일을 이미 한다. */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={(next) => setTab(next as PlanDomain)}
        searchId="plan-search"
        searchLabel="플랜 검색"
        searchHint="플랜 이름, 코드로 검색"
        searchValue={search}
        onSearchChange={setSearch}
      />

      {visible.length === 0 ? (
        <InternalPanel title="플랜" description={DOMAIN_NOTE[tab]}>
          <InternalEmpty>조건에 맞는 플랜이 없습니다.</InternalEmpty>
        </InternalPanel>
      ) : (
        <>
          {/* 요금과 한도는 표 위에 한 줄로 — 표 안에 섞으면 기능과 숫자를 같은 무게로 읽게 된다. */}
          <InternalPanel title={`${tab} 플랜`} description={DOMAIN_NOTE[tab]}>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((plan: PlanRecord) => (
                <div key={plan.id} className="flex flex-col gap-3 rounded-lg border border-border px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold">{plan.name}</span>
                    <Badge tone={plan.sellable ? 'ok' : 'neutral'}>
                      {plan.sellable ? '판매 중' : '판매 종료'}
                    </Badge>
                  </div>

                  <p className="text-lg font-semibold tabular-nums">
                    {formatWon(plan.monthly)}
                    <span className="ml-1 text-xs font-normal text-ink-muted">원 / 월</span>
                  </p>

                  <dl className="flex flex-col gap-1.5">
                    {[
                      { label: '배포', value: `${plan.deployments}개` },
                      {
                        /* IR 은 회원 가입이 없다 — 0 을 '0명' 으로 적으면 상한이 0 인 것으로 읽힌다. */
                        label: '회원 상한',
                        value: plan.memberLimit === 0 ? '가입 없음' : `${formatCount(plan.memberLimit)}명`,
                      },
                      { label: '쓰는 고객사', value: `${plan.tenants}곳` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-baseline justify-between gap-3">
                        <dt className="shrink-0 text-xs text-ink-faint">{item.label}</dt>
                        <dd className="min-w-0 truncate text-right text-sm tabular-nums">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {plan.note && <p className="text-xs leading-relaxed text-ink-faint">{plan.note}</p>}
                </div>
              ))}
            </div>
          </InternalPanel>

          <InternalPanel
            title="플랜별 기능"
            description="어느 등급부터 열리는지를 한 줄로 읽습니다. 위 등급은 아래 등급의 기능을 모두 포함합니다."
          >
            {PLAN_FEATURES[tab].length === 0 ? (
              <PlanMatrixEmpty domain={tab} note={DOMAIN_NOTE[tab]} />
            ) : (
              <PlanMatrix
                /* 팔지 않는 플랜은 표에서 뺀다 — 지금 팔 수 있는 것끼리 견주는 자리다. */
                plans={visible.filter((plan) => plan.sellable)}
                features={PLAN_FEATURES[tab]}
                groups={FEATURE_GROUPS[tab]}
              />
            )}
          </InternalPanel>
        </>
      )}

    </>
  );
}
