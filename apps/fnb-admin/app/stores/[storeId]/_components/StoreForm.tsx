'use client';

import { useState } from 'react';
import { Panel } from '@winpilot/ui';
import { STORE_REGIONS, type Store } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbSelect,
  FnbTextInput,
} from '@/app/_components/FnbForm';
import { PickChips } from '@/app/_components/PickChips';

/** 상태 셋은 코드가 정한 값이라 목록에서 뽑지 않는다 — 뽑으면 쓰이지 않는 상태가 사라진다. */
const STATES = ['영업중', '준비중', '휴점'] as const;

/**
 * 매장에서 되는 것.
 *
 * 자유 입력으로 두지 않는 이유: 손님이 사이트에서 이 표를 보고 찾아간다. 매장마다 `주차가능` ·
 * `주차 O` · `발렛` 으로 적히면 **거르지도 견주지도 못한다.**
 */
const FEATURES = ['포장', '배달', '주차', '단체석', '반려동물'] as const;

/**
 * 매장 상세 — **상태가 다른 칸을 좌우한다.**
 *
 * ## 준비중 매장에는 번호를 요구하지 않는다
 * 아직 없는 번호를 필수로 두면 담당자가 아무 번호나 적는다. 그러면 그리로 전화가 가고, 받는
 * 사람은 무슨 매장인지도 모른다. 그래서 `준비중` 일 때는 번호 칸이 선택이 되고, 대신 **여는
 * 달**을 묻는다.
 *
 * 이것이 이 화면에서 유일하게 상태에 매인 규칙이다. 규칙을 더 늘리지 않는 이유: 어느 칸이
 * 언제 필수인지가 셋을 넘으면 화면을 보고는 알 수 없게 된다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function StoreForm({ store, mode = 'edit' }: { store: Store; mode?: 'edit' | 'create' }) {
  const [name, setName] = useState(store.name);
  const [region, setRegion] = useState(store.region);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);
  const [hours, setHours] = useState(store.hours);
  const [state, setState] = useState<string>(store.state);
  const [openedOn, setOpenedOn] = useState(store.openedOn);
  const [features, setFeatures] = useState<string[]>(store.features);
  const [tried, setTried] = useState(false);

  /** 준비중 매장에는 아직 번호가 없다 — 없는 것을 요구하면 지어낸 번호가 들어온다. */
  const phoneRequired = state !== '준비중';

  const broken = [
    ...(name.trim() ? [] : ['매장명']),
    ...(address.trim() ? [] : ['주소']),
    ...(phoneRequired && !phone.trim() ? ['전화'] : []),
    ...(hours.trim() ? [] : ['영업시간']),
    ...(/^\d{4}-\d{2}$/.test(openedOn.trim()) ? [] : ['개점 연월']),
  ];

  return (
    <FnbRecordForm
      resource="가맹점"
      mode={mode}
      detail={`${name.trim() || '(이름 없음)'} — ${state} · ${address.trim()}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="매장 정보" description="사이트 매장 찾기에 이 값이 그대로 나갑니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="코드" value={store.id} note="수정 불가" />
          ) : (
            /* 코드는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 코드가 생긴다. */
            <FnbReadonly label="코드" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField
            label="매장명"
            htmlFor="store-name"
            required
            {...(tried && !name.trim() ? { error: '매장명을 입력해 주세요.' } : {})}
          >
            <FnbTextInput id="store-name" value={name} onChange={setName} invalid={tried && !name.trim()} />
          </FnbField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FnbField label="지역" htmlFor="store-region" hint="매장 찾기의 거르개가 이 값으로 나뉩니다.">
              <FnbSelect id="store-region" value={region} onChange={setRegion} options={STORE_REGIONS} />
            </FnbField>

            <FnbField
              label="상태"
              htmlFor="store-state"
              hint="휴점으로 두면 사이트에서만 사라지고 이 목록에는 남습니다."
            >
              <FnbSelect id="store-state" value={state} onChange={setState} options={STATES} />
            </FnbField>
          </div>

          <FnbField
            label="주소"
            htmlFor="store-address"
            required
            {...(tried && !address.trim()
              ? { error: '주소를 입력해 주세요.' }
              : { hint: '지도앱에서 그대로 검색되는 형태로 적어 주세요 — 길 찾기는 지도앱이 합니다.' })}
          >
            <FnbTextInput
              id="store-address"
              value={address}
              onChange={setAddress}
              invalid={tried && !address.trim()}
            />
          </FnbField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FnbField
              label="전화"
              htmlFor="store-phone"
              required={phoneRequired}
              {...(tried && phoneRequired && !phone.trim()
                ? { error: '전화번호를 입력해 주세요.' }
                : {
                    hint: phoneRequired
                      ? '손님이 예약과 포장을 이 번호로 겁니다.'
                      : '준비중 매장은 비워 두세요. 없는 번호를 적으면 그리로 전화가 갑니다.',
                  })}
            >
              <FnbTextInput
                id="store-phone"
                value={phone}
                onChange={setPhone}
                invalid={tried && phoneRequired && !phone.trim()}
              />
            </FnbField>

            <FnbField
              label="개점 연월"
              htmlFor="store-opened"
              required
              {...(tried && !/^\d{4}-\d{2}$/.test(openedOn.trim())
                ? { error: '`2026-09` 처럼 연-월로 적어 주세요.' }
                : { hint: '준비중 매장은 이 값이 사이트에 여는 달로 섭니다.' })}
            >
              <FnbTextInput
                id="store-opened"
                value={openedOn}
                onChange={setOpenedOn}
                invalid={tried && !/^\d{4}-\d{2}$/.test(openedOn.trim())}
              />
            </FnbField>
          </div>

          <FnbField
            label="영업시간"
            htmlFor="store-hours"
            required
            {...(tried && !hours.trim()
              ? { error: '영업시간을 입력해 주세요.' }
              : { hint: '`10:30 – 22:00` 처럼. 매장마다 달라 글로 받습니다.' })}
          >
            <FnbTextInput id="store-hours" value={hours} onChange={setHours} invalid={tried && !hours.trim()} />
          </FnbField>
        </div>
      </Panel>

      <Panel
        title="되는 것"
        description="손님이 가시기 전에 확인하는 것들입니다. 목록에서 골라 주세요."
      >
        <div className="px-6 py-5">
          <PickChips options={FEATURES} picked={features} onChange={setFeatures} />
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
