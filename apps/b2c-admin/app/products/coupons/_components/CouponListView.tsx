'use client';

import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { useToast } from '@winpilot/ui';
import { COUPONS, COUPON_STATE_TONE, couponAmountText, couponState, type CouponRecord } from '@/lib/data/coupons';
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
    span: 4,
    render: (coupon) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{coupon.name}</p>
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
        <p className="truncate text-xs text-ink-faint">
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
    span: 2,
    render: (coupon) => (
      <span className="truncate text-xs text-ink-muted">{coupon.ownerEmail || '누구나 (받기 가능)'}</span>
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
        <span
          className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${COUPON_STATE_TONE[state] ?? 'bg-surface text-ink-muted'}`}
        >
          {state}
        </span>
      );
    },
  },
];

export function CouponListView() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<CouponRecord[]>(COUPONS);

  return (
    <ContentListView<CouponRecord>
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
      onAction={() => toast.info('쿠폰 등록 화면은 준비 중입니다.')}
      onOpen={(item) => toast.info(`${item.name} — 상세 화면은 준비 중입니다.`)}
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
  );
}
