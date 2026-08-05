'use client';

import { useMemo, useState } from 'react';
import { HintInput, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalSummary } from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import { PLANS, ROLES, formatCount, formatWon, type PlanRecord } from '@/lib/data/subscriptions';

const SELL_STATES = ['판매 중', '판매 종료'] as const;

const EMPTY_DRAFT = { name: '', monthly: '', deployments: '1', memberLimit: '' };

/** 숫자 칸에서 숫자가 아닌 글자를 걷어 낸다 — 틀린 값을 오류로 알리기 전에 넣지 못하게 막는다. */
const digits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * 플랜 목록.
 *
 * 표가 아니라 **카드**로 늘어놓는다. 플랜 하나가 갖는 값이 금액·배포 수·회원 상한·권한 여덟
 * 개까지라, 한 줄에 밀어 넣으면 가로로 스크롤해야 읽힌다. 플랜은 넷뿐이므로 카드가 길어질
 * 걱정도 없다.
 *
 * 팔지 않는 플랜을 숨기지 않는 이유: 쓰던 고객사의 계약서에 그 이름이 적혀 있다. 목록에서
 * 사라지면 그 고객사의 플랜이 무엇인지 아무 화면에서도 확인할 수 없다.
 */
export function PlanListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sell, setSell] = useState('all');
  const [rows, setRows] = useState<PlanRecord[]>(PLANS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((plan) => {
      if (sell !== 'all' && (sell === '판매 중') !== plan.sellable) return false;
      if (!keyword) return true;
      return plan.name.toLowerCase().includes(keyword) || plan.id.toLowerCase().includes(keyword);
    });
  }, [rows, search, sell]);

  const sellable = rows.filter((plan) => plan.sellable);
  const contracted = rows.reduce((sum, plan) => sum + plan.tenants, 0);
  const monthly = rows.reduce((sum, plan) => sum + plan.monthly * plan.tenants, 0);

  const create = () => {
    if (!draft.name.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '플랜 이름은 반드시 입력해야 합니다.' });
      return;
    }
    if (rows.some((plan) => plan.name === draft.name.trim())) {
      toast.error({ message: '등록하지 못했습니다.', detail: `'${draft.name.trim()}' 은 이미 있는 플랜입니다.` });
      return;
    }
    if (!draft.monthly || !draft.memberLimit) {
      toast.error({ message: '등록하지 못했습니다.', detail: '월 구독료와 회원 상한을 넣어 주세요.' });
      return;
    }

    // 권한은 비운 채로 만든다 — 무엇을 열지는 권한 화면에서 보고 정하는 것이 순서다.
    const record: PlanRecord = {
      id: `P-${draft.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || rows.length + 1}`,
      name: draft.name.trim(),
      monthly: Number(draft.monthly),
      deployments: Number(draft.deployments) || 1,
      memberLimit: Number(draft.memberLimit),
      roles: [],
      tenants: 0,
      sellable: true,
      note: '',
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({
      message: '플랜을 등록했습니다.',
      detail: `${record.name} · 권한은 아직 비어 있습니다.`,
    });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '판매 중인 플랜', value: `${sellable.length}개`, hint: `전체 ${PLANS.length}개` },
          { label: '구독 중인 고객사', value: `${contracted}곳` },
          { label: '월 구독료 합계', value: `${formatWon(monthly)}원` },
        ]}
      />

      <InternalToolbar
        searchId="plan-search"
        searchLabel="플랜 검색"
        searchHint="플랜 이름, 코드로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="판매 상태" options={SELL_STATES} value={sell} onChange={setSell} />}
        action={{ label: '플랜 등록', onClick: () => setCreating(true) }}
      />

      {visible.length === 0 ? (
        <InternalPanel title="플랜" description="고객사가 고르는 구독 등급입니다.">
          <InternalEmpty>조건에 맞는 플랜이 없습니다.</InternalEmpty>
        </InternalPanel>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((plan: PlanRecord) => (
            <InternalPanel
              key={plan.id}
              title={plan.name}
              description={plan.note || undefined}
              aside={
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs text-ink-faint">{plan.id}</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                      plan.sellable ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
                    }`}
                  >
                    {plan.sellable ? '판매 중' : '판매 종료'}
                  </span>
                </div>
              }
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-5 sm:grid-cols-4">
                {[
                  { label: '월 구독료', value: `${formatWon(plan.monthly)}원` },
                  { label: '배포 수', value: `${plan.deployments}개` },
                  { label: '회원 상한', value: `${formatCount(plan.memberLimit)}명` },
                  { label: '쓰는 고객사', value: `${plan.tenants}곳` },
                ].map((item) => (
                  <div key={item.label} className="flex min-w-0 flex-col gap-1">
                    <dt className="text-xs uppercase tracking-widest text-ink-faint">{item.label}</dt>
                    <dd className="truncate text-sm font-medium tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 border-t border-border px-6 py-5">
                <p className="text-xs uppercase tracking-widest text-ink-faint">켜지는 권한</p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => {
                    const on = plan.roles.includes(role.id);
                    return (
                      <span
                        key={role.id}
                        className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs ${
                          on
                            ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                            : 'border-border text-ink-faint line-through'
                        }`}
                      >
                        {role.name}
                      </span>
                    );
                  })}
                </div>
                {/* 꺼진 것을 지우지 않고 취소선으로 남긴다 — 무엇이 빠졌는지가 곧 플랜의 차이다. */}
                <p className="text-xs leading-relaxed text-ink-faint">
                  취소선은 이 플랜에서 열리지 않는 권한입니다. 권한 하나하나가 무엇을 여는지는 보조 메뉴의
                  권한에서 봅니다.
                </p>
              </div>
            </InternalPanel>
          ))}
        </div>
      )}

      <InternalPanel title="플랜 이름의 원본" description="여러 화면이 함께 쓰는 목록이라 한 곳에서 정합니다.">
        <div className="flex flex-col gap-2 px-6 py-5 text-sm leading-relaxed text-ink-muted">
          <p>
            플랜 이름은 고객사 · 이탈 · 매출 화면에도 그대로 나옵니다. 이름을 고칠 때는 기준 값
            (설정 · 기준 값)에서 고쳐야 네 화면이 함께 바뀝니다.
          </p>
          <p className="font-mono text-xs text-ink-faint">
            {ROLES.length}개 권한 · {rows.length}개 플랜 · 원본 `lib/data/subscriptions.ts`
          </p>
        </div>
      </InternalPanel>

      <InternalModal
        open={creating}
        title="플랜 등록"
        description="새 플랜은 권한이 비어 있는 채로 만들어집니다. 무엇을 열지는 권한 화면에서 보고 정합니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="플랜 이름" htmlFor="plan-new-name" hint="계약서에 그대로 적히는 말입니다.">
          <HintInput
            id="plan-new-name"
            type="text"
            hint="예: 프리미엄"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="월 구독료" htmlFor="plan-new-monthly">
          <HintInput
            id="plan-new-monthly"
            type="text"
            hint="원 단위 숫자만"
            value={draft.monthly}
            onChange={(event) => setDraft((previous) => ({ ...previous, monthly: digits(event.target.value) }))}
            invalid={!draft.monthly}
          />
        </InternalField>

        <InternalField label="배포 수" htmlFor="plan-new-deployments" hint="이 플랜으로 쓸 수 있는 배포 수입니다.">
          <HintInput
            id="plan-new-deployments"
            type="text"
            hint="숫자만"
            value={draft.deployments}
            onChange={(event) => setDraft((previous) => ({ ...previous, deployments: digits(event.target.value) }))}
          />
        </InternalField>

        <InternalField label="회원 상한" htmlFor="plan-new-limit" hint="넘기면 고객사 사이트에서 새 가입이 막힙니다.">
          <HintInput
            id="plan-new-limit"
            type="text"
            hint="숫자만"
            value={draft.memberLimit}
            onChange={(event) => setDraft((previous) => ({ ...previous, memberLimit: digits(event.target.value) }))}
            invalid={!draft.memberLimit}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
