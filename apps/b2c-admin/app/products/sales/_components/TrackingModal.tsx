'use client';

import { useEffect, useState } from 'react';
import { Button, Dropdown, HintInput, Modal } from '@winpilot/ui';
import { COURIERS } from '@/lib/data/orders';

export type TrackingInput = { courier: string; trackingNumber: string };

export type TrackingModalProps = {
  open: boolean;
  /** 운송장을 등록할 주문 건수 */
  count: number;
  onClose: () => void;
  onSubmit: (input: TrackingInput) => void;
};

/**
 * 운송장 번호 등록.
 *
 * 여러 건을 한 번에 고른 경우에도 택배사·번호는 하나만 받는다 — 건별로 다른 번호를
 * 넣어야 한다면 그건 목록에서 한 건씩 처리할 일이다.
 */
export function TrackingModal({ open, count, onClose, onSubmit }: TrackingModalProps) {
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCourier('');
    setTrackingNumber('');
    setTouched(false);
  }, [open]);

  const digits = trackingNumber.replace(/[\s-]/g, '');
  const courierError = touched && !courier ? '택배사를 선택해 주세요.' : '';
  const numberError = touched
    ? !digits
      ? '운송장 번호를 입력해 주세요.'
      : !/^\d{9,15}$/.test(digits)
        ? '운송장 번호는 숫자 9 ~ 15 자리입니다.'
        : ''
    : '';

  const submit = () => {
    setTouched(true);
    if (!courier || !/^\d{9,15}$/.test(digits)) return;
    onSubmit({ courier, trackingNumber: digits });
  };

  return (
    <Modal
      open={open}
      title="운송장 번호 등록"
      description={`선택한 ${count}건에 같은 운송장 정보를 등록합니다.`}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={submit}>
            등록
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">택배사</span>
          <Dropdown
            id="tracking-courier"
            label="택배사 선택"
            options={COURIERS.map((name) => ({ value: name, label: name }))}
            value={courier}
            onChange={setCourier}
            invalid={Boolean(courierError)}
          />
          {courierError && <p className="text-sm text-signal-danger">{courierError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tracking-number" className="text-sm font-medium">
            운송장 번호
          </label>
          <HintInput
            id="tracking-number"
            type="text"
            inputMode="numeric"
            hint="숫자만 입력해 주세요"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            invalid={Boolean(numberError)}
          />
          {numberError && <p className="text-sm text-signal-danger">{numberError}</p>}
        </div>

        <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
          등록하면 배송 상태가 &lsquo;배송중&rsquo; 으로 바뀝니다.
        </p>
      </div>
    </Modal>
  );
}
