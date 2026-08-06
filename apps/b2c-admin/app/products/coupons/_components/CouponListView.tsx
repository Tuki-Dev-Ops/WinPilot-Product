'use client';

import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { COUPON_STATE_TONE, couponAmountText, COUPONS, couponState, type CouponRecord } from '@/lib/data/coupons';
import { CouponDetailModal } from './CouponDetailModal';
import { CouponFormModal, type CouponFormInput } from './CouponFormModal';
import { todayStamp } from '@/lib/data/product-tags';

/**
 * 쿠폰 목록 — 고객 화면의 쿠폰함(`/mypage/coupons`)이 보는 **그 목록**이다.
 *
 * 노출/숨김 대신 **상태**(사용 가능·사용 완료·기간 만료)로 나눈다. 쿠폰은 운영자가 감추는 것이
 * 아니라 기간과 사용 여부로 저절로 갈리기 때문이다 — 목록 뼈대의 '노출' 열에는 사용 가능 여부를
 * 싣는다.
 *
 * 발급 대상이 비어 있으면 **누구나 받을 수 있는 쿠폰**이고, 고객 화면의 '쿠폰 받기' 탭에 나온다.
 */
const TODAY = todayStamp();

const COLUMNS: Array<ContentColumn<CouponRecord>> = [
  {
    id: 'name',
    label: '쿠폰',
    // 열 합이 11 이어서 관리 열이 다음 줄로 밀렸다. 예산은 9 다 (`CONTENT_COLUMN_BUDGET`).
    span: 3,
    render: (coupon) => (
      <div className="min-w-0">
        <p className="block min-w-0 truncate text-sm font-medium">{coupon.name}</p>
        <p className="font-mono text-xs text-ink-faint">{coupon.id}</p>
      </div>
    ),
  },
  {
    id: 'amount',
    label: '할인',
    span: 2,
    render: (coupon) => (
      <div className="min-w-0">
        <p className="text-sm font-medium tabular-nums">{couponAmountText(coupon)}</p>
        <p className="block min-w-0 truncate text-xs text-ink-faint">
          {coupon.minAmount > 0 ? `${coupon.minAmount.toLocaleString('ko-KR')}원 이상` : '제한 없음'}
        </p>
      </div>
    ),
  },
  {
    id: 'period',
    label: '기간',
    span: 2,
    render: (coupon) => (
      <span className="font-mono text-xs tabular-nums text-ink-muted">
        {coupon.startAt} ~ {coupon.endAt}
      </span>
    ),
  },
  {
    id: 'owner',
    label: '발급 대상',
    span: 1,
    render: (coupon) => (
      <span className="block min-w-0 truncate text-xs text-ink-muted">{coupon.ownerEmail || '누구나 (받기 가능)'}</span>
    ),
  },
  {
    id: 'state',
    label: '상태',
    span: 1,
    align: 'center',
    render: (coupon) => {
      const state = couponState(coupon, TODAY);
      return (
        <Badge tone={COUPON_STATE_TONE[state] ?? 'neutral'}>
          {state}
        </Badge>
      );
    },
  },
];

export function CouponListView() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<CouponRecord[]>(COUPONS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const opened = coupons.find((coupon) => coupon.id === openId) ?? null;

  const digits = (value: string) => Number(value.replace(/[\s,]/g, '') || 0);

  const create = (input: CouponFormInput) => {
    const record: CouponRecord = {
      // 코드는 사람이 정하지 않는다 — 겹치면 어느 쿠폰이 쓰였는지 추적할 수 없다.
      id: `CP-${`${coupons.length + 1}`.padStart(3, '0')}`,
      name: input.name.trim(),
      kind: input.kind,
      value: digits(input.value),
      minAmount: digits(input.minAmount),
      // 정액 쿠폰에는 한도라는 개념이 없다 — 0 으로 두어 '제한 없음' 과 같게 만든다.
      maxDiscount: input.kind === '정률' ? digits(input.maxDiscount) : 0,
      startAt: input.startAt.trim(),
      endAt: input.endAt.trim(),
      ownerEmail: input.ownerEmail.trim(),
      used: false,
    };

    setCoupons((previous) => [...previous, record]);
    setCreating(false);
    toast.success({
      message: '쿠폰을 등록했습니다.',
      detail: `${record.name} · ${couponAmountText(record)}`,
    });
  };

  return (
    <>
    <ContentListView<CouponRecord>
      title="쿠폰"
      description="발급한 쿠폰과 사용 현황을 확인하세요."
      entityLabel="쿠폰"
      items={coupons}
      onItemsChange={setCoupons}
      idOf={(item) => item.id}
      labelOf={(item) => item.name}
      // 목록 뼈대의 '노출' 은 쿠폰에서 **지금 쓸 수 있는가** 로 읽는다.
      visibleOf={(item) => couponState(item, TODAY) === '사용 가능'}
      searchIn={(item) => `${item.name} ${item.id} ${item.ownerEmail}`}
      columns={COLUMNS}
      searchId="coupon-search"
      searchHint="쿠폰명, 코드, 발급 대상으로 검색"
      actionLabel="쿠폰 등록"
      onAction={() => setCreating(true)}
      /*
        목록은 값을 줄여 보여 준다 — 최소 주문 금액과 최대 할인 한도가 정률 쾠폰의 실제
        할인액을 좀우하는데 좁은 칸에 들어가지 않는다. 화면을 따로 세우지 않는 이유는
        `docs/path.md` §3.2 — 값이 여덟이고 고칠 수 있는 것이 없다.
      */
      onOpen={(item) => setOpenId(item.id)}
      filters={[
        {
          id: 'kind',
          label: '할인 방식',
          options: [
            { value: '정률', label: '정률' },
            { value: '정액', label: '정액' },
          ],
        },
        {
          id: 'owner',
          label: '발급',
          options: [
            { value: 'issued', label: '개인 발급' },
            { value: 'open', label: '누구나' },
          ],
        },
      ]}
      matchesFilters={(item, values) => {
        const kind = values.kind ?? ALL_VALUE;
        if (kind !== ALL_VALUE && item.kind !== kind) return false;

        const owner = values.owner ?? ALL_VALUE;
        if (owner === 'issued' && !item.ownerEmail) return false;
        if (owner === 'open' && item.ownerEmail) return false;
        return true;
      }}
    />

    <CouponDetailModal open={opened !== null} coupon={opened} today={TODAY} onClose={() => setOpenId(null)} />

    <CouponFormModal open={creating} onClose={() => setCreating(false)} onSubmit={create} />
    </>
  );
}
