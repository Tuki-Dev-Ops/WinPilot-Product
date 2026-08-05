'use client';

import { useMemo, useState } from 'react';
import { Dropdown, HintInput, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalSummary } from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  DEALS,
  PIPELINE_STAGES,
  STAGE_MEANING,
  STAGE_TONE,
  formatDealAmount,
  nextStage,
  previousStage,
  type PipelineDeal,
  type PipelineStage,
} from '@/lib/data/pipeline';
import { STAFF } from '@/lib/data/settings';
import { TENANT_PLANS, todayStamp } from '@/lib/data/tenants';

const EMPTY_DRAFT = {
  name: '',
  plan: TENANT_PLANS[0] as string,
  amount: '',
  owner: STAFF[0]?.name ?? '',
  lastTouch: '',
};

const MOVE_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-2.5 text-xs transition-colors duration-150';

/**
 * 도입 파이프라인 — 단계별 세로 칸.
 *
 * **끌어 옮기기를 만들지 않는다.** 끌기는 되돌리기가 없으면 실수했을 때 되돌릴 길이 없고,
 * 되돌리기를 붙이면 이 화면 하나 때문에 실행 취소라는 개념이 생긴다. 단계 바꾸기는 카드의
 * 단추로 하고, 앞으로 가는 길과 되돌아오는 길을 함께 둔다.
 *
 * `운영` 칸이 곧 고객 목록이다 — 그래서 그 칸의 카드에는 고객사 코드가 붙고, 눌러서 상세로
 * 들어간다. 두 화면이 같은 자료를 다르게 보는 것이지 다른 자료를 보는 것이 아니다.
 *
 * **프론트엔드 전용** — 단계 변경은 이 화면에만 반영된다.
 */
export function PipelineBoardView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState('all');
  const [deals, setDeals] = useState<PipelineDeal[]>(DEALS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const owners = useMemo(() => [...new Set(DEALS.map((deal) => deal.owner))], []);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return deals.filter((deal) => {
      if (owner !== 'all' && deal.owner !== owner) return false;
      if (!keyword) return true;
      return (
        deal.name.toLowerCase().includes(keyword) ||
        deal.id.toLowerCase().includes(keyword) ||
        deal.plan.toLowerCase().includes(keyword)
      );
    });
  }, [deals, search, owner]);

  const running = visible.filter((deal) => deal.stage === '운영');
  const pending = visible.filter((deal) => deal.stage !== '운영');
  const expected = pending.reduce((sum, deal) => sum + deal.amount, 0);

  const move = (deal: PipelineDeal, to: PipelineStage | undefined) => {
    if (!to) return;
    setDeals((previous) => previous.map((item) => (item.id === deal.id ? { ...item, stage: to } : item)));
    toast.info({ message: `${deal.name} 을(를) ${to} 단계로 옮겼습니다.`, detail: `${deal.stage} → ${to}` });
  };

  const create = () => {
    if (!draft.name.trim() || !draft.amount) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이름과 예상 금액은 반드시 입력해야 합니다.' });
      return;
    }

    // 새 건은 언제나 `문의` 에서 시작한다 — 중간부터 넣으면 어디서 들어왔는지가 남지 않는다.
    const record: PipelineDeal = {
      id: `D-${306 + deals.length}`,
      name: draft.name.trim(),
      stage: '문의',
      plan: draft.plan,
      amount: Number(draft.amount),
      owner: draft.owner,
      enteredAt: todayStamp(),
      lastTouch: draft.lastTouch.trim() || '등록됨',
      memo: '',
    };

    setDeals((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '파이프라인에 건을 등록했습니다.', detail: `${record.name} · 문의 단계` });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '진행 중', value: `${pending.length}건`, hint: '아직 고객사가 아닌 곳입니다.' },
          { label: '예상 금액', value: `${formatDealAmount(expected)}원`, hint: '운영 단계를 뺀 합계입니다.' },
          { label: '운영', value: `${running.length}곳`, hint: '이 칸이 곧 고객 목록입니다.' },
        ]}
      />

      <InternalToolbar
        searchId="pipeline-search"
        searchLabel="파이프라인 검색"
        searchHint="이름, 건 번호, 플랜으로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="사내 담당" options={owners} value={owner} onChange={setOwner} />}
        action={{ label: '파이프라인 건 등록', onClick: () => setCreating(true) }}
      />

      {/*
        칸을 가로로 늘어놓고 좁은 화면에서는 그 줄만 가로로 스크롤한다 — 페이지 전체가 밀리지
        않게. 칸을 세로로 쌓지 않는 이유는 단계 사이의 흐름이 왼쪽에서 오른쪽으로 읽히기 때문이다.
      */}
      <div className="-mx-6 min-w-0 overflow-x-auto px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const column = visible.filter((deal) => deal.stage === stage);
            const sum = column.reduce((total, deal) => total + deal.amount, 0);

            return (
              <section key={stage} className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-canvas">
                <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_TONE[stage]}`}
                    >
                      {stage}
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{column.length}건</span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-faint">{STAGE_MEANING[stage]}</p>
                  <p className="font-mono text-xs tabular-nums text-ink-muted">{formatDealAmount(sum)}원</p>
                </div>

                <div className="flex flex-col gap-3 px-4 py-4">
                  {column.length === 0 ? (
                    // 빈 칸을 지우지 않는다 — 사라진 칸은 단계가 없어진 것으로 읽힌다.
                    <p className="py-6 text-center text-xs text-ink-faint">이 단계에 있는 건이 없습니다.</p>
                  ) : (
                    column.map((deal) => (
                      <article key={deal.id} className="flex flex-col gap-2 rounded-lg border border-border px-3 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {deal.tenantId ? (
                              <a
                                href={`/tenants/${deal.tenantId}`}
                                className="truncate text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
                              >
                                {deal.name}
                              </a>
                            ) : (
                              <p className="truncate text-sm font-medium">{deal.name}</p>
                            )}
                            <p className="truncate font-mono text-xs text-ink-faint">
                              {deal.tenantId ?? deal.id} · {deal.owner}
                            </p>
                          </div>
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-muted">
                            {deal.plan}
                          </span>
                        </div>

                        <p className="text-sm tabular-nums">{formatDealAmount(deal.amount)}원</p>
                        <p className="text-xs leading-relaxed text-ink-muted">{deal.lastTouch}</p>
                        <p className="font-mono text-xs tabular-nums text-ink-faint">{deal.enteredAt} 진입</p>

                        {/*
                          앞으로 가는 길과 되돌아오는 길을 함께 둔다. 되돌릴 수 없는 이동은
                          실수했을 때 손댈 곳이 없다.
                        */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!previousStage(deal.stage)}
                            onClick={() => move(deal, previousStage(deal.stage))}
                            className={`${MOVE_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint disabled:opacity-40`}
                          >
                            ← {previousStage(deal.stage) ?? '처음'}
                          </button>
                          <button
                            type="button"
                            disabled={!nextStage(deal.stage)}
                            onClick={() => move(deal, nextStage(deal.stage))}
                            className={`${MOVE_BUTTON} border-brand-500 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-300`}
                          >
                            {nextStage(deal.stage) ?? '마지막'} →
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        끌어 옮기기는 만들지 않았습니다. 끌기는 되돌리기가 없으면 실수했을 때 되돌릴 길이 없어서, 단계 바꾸기를
        카드의 단추로 두고 앞뒤 두 방향을 함께 열어 두었습니다.
      </p>

      <InternalModal
        open={creating}
        title="파이프라인 건 등록"
        description="새 건은 언제나 문의 단계에서 시작합니다. 중간부터 넣으면 어디서 들어왔는지가 남지 않습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="이름" htmlFor="deal-new-name" hint="아직 고객사가 아니어도 됩니다.">
          <HintInput
            id="deal-new-name"
            type="text"
            hint="예: 리프레시랩"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="팔려는 플랜">
          <Dropdown
            id="deal-new-plan"
            label="플랜 선택"
            options={TENANT_PLANS.map((item) => ({ value: item, label: item }))}
            value={draft.plan}
            onChange={(next) => setDraft((previous) => ({ ...previous, plan: next }))}
          />
        </InternalField>

        <InternalField label="예상 금액" htmlFor="deal-new-amount">
          <HintInput
            id="deal-new-amount"
            type="text"
            hint="원 단위 숫자만"
            value={draft.amount}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, amount: event.target.value.replace(/[^0-9]/g, '') }))
            }
            invalid={!draft.amount}
          />
        </InternalField>

        <InternalField label="사내 담당">
          <Dropdown
            id="deal-new-owner"
            label="담당 선택"
            options={STAFF.map((staff) => ({ value: staff.name, label: staff.name, hint: staff.team }))}
            value={draft.owner}
            onChange={(next) => setDraft((previous) => ({ ...previous, owner: next }))}
          />
        </InternalField>

        <InternalField
          label="어떻게 들어왔나"
          htmlFor="deal-new-touch"
          hint="비우면 등록됨으로 적습니다. 나중에 활동에서 자세히 남깁니다."
        >
          <HintInput
            id="deal-new-touch"
            type="text"
            hint="예: 홈페이지 문의 폼으로 들어옴"
            value={draft.lastTouch}
            onChange={(event) => setDraft((previous) => ({ ...previous, lastTouch: event.target.value }))}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
