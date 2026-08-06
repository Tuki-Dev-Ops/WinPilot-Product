'use client';

import { Badge, Button, Modal } from '@winpilot/ui';
import { COUPON_STATE_TONE, couponAmountText, couponState, type CouponRecord } from '@/lib/data/coupons';

export type CouponDetailModalProps = {
  open: boolean;
  coupon: CouponRecord | null;
  /** 오늘 날짜 — 상태는 기간과 오늘을 견주어 정해진다 */
  today: string;
  onClose: () => void;
};

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`;

/**
 * 쿠폰 한 장의 값을 읽는 창.
 *
 * ## 왜 화면이 아니라 모달인가
 * `docs/path.md` §3.2 가 쿠폰을 **목록 한 장으로 끝나는 자원**으로 적어 두었다. 값이
 * 여덟 개뿐이고 그중 운영자가 고칠 수 있는 것은 아직 없다 — 발급된 쿠폰의 금액과 기간을
 * 나중에 바꾸면 이미 받은 고객이 받은 것과 다른 쿠폰을 갖게 되기 때문이다.
 *
 * 그런데도 여는 자리가 필요한 이유는 **목록이 값을 줄여 보여주기 때문**이다. 최소 주문 금액과
 * 최대 할인 한도는 정률 쿠폰에서 실제 할인액을 좌우하는데 목록의 좁은 칸에는 들어가지 않는다.
 * 전에는 행을 눌러도 `상세 화면은 준비 중입니다` 토스트만 떴다 — 없는 화면을 약속하는 말이라
 * §3.2 와도 어긋났다.
 *
 * ## 고칠 수 없다는 것을 화면에 적는다
 * 저장 단추 없이 닫기만 두면 "왜 못 고치지" 를 찾게 된다. 아래에 그 이유를 한 줄로 적어 둔다 —
 * **막는 것보다 왜 막는지를 적는 편이 묻는 횟수를 줄인다.**
 */
export function CouponDetailModal({ open, coupon, today, onClose }: CouponDetailModalProps) {
  const state = coupon ? couponState(coupon, today) : null;

  return (
    <Modal
      open={open && coupon !== null}
      title="쿠폰"
      description="발급된 쿠폰의 값입니다. 이미 나간 쿠폰이라 금액과 기간은 고치지 않습니다."
      onClose={onClose}
      footer={
        <Button tone="secondary" onClick={onClose}>
          닫기
        </Button>
      }
    >
      {coupon && state && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="min-w-0 text-sm font-medium">{coupon.name}</p>
            <Badge tone={COUPON_STATE_TONE[state] ?? 'neutral'}>{state}</Badge>
          </div>

          <p className="rounded-lg bg-surface px-4 py-3 text-center text-lg font-semibold tabular-nums">
            {couponAmountText(coupon)}
          </p>

          <dl className="flex flex-col gap-2">
            {[
              { label: '쿠폰 코드', value: coupon.id },
              { label: '할인 방식', value: coupon.kind },
              {
                label: '최소 주문 금액',
                value: coupon.minAmount > 0 ? `${won(coupon.minAmount)} 이상` : '제한 없음',
              },
              {
                /* 정액 쿠폰에는 한도라는 개념이 없다 — 없는 칸을 '제한 없음' 으로 적으면 있는 줄 안다. */
                label: '최대 할인 한도',
                value:
                  coupon.kind === '정액'
                    ? '해당 없음 (정액 쿠폰)'
                    : coupon.maxDiscount > 0
                      ? `${won(coupon.maxDiscount)}까지`
                      : '제한 없음',
              },
              { label: '사용 기간', value: `${coupon.startAt} ~ ${coupon.endAt}` },
              { label: '발급 대상', value: coupon.ownerEmail || '누구나 (쿠폰 받기 탭에 노출)' },
              { label: '사용 여부', value: coupon.used ? '사용함' : '사용 안 함' },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{row.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-xs leading-relaxed text-ink-muted">
            상태는 기간과 사용 여부로 저절로 정해집니다. 운영자가 직접 바꾸지 않습니다 —
            이미 고객이 받은 쿠폰의 조건을 나중에 바꾸면 받을 때 본 것과 다른 쿠폰이 됩니다.
          </p>
        </div>
      )}
    </Modal>
  );
}
