'use client';

import { useState, type FormEvent } from 'react';
import { ACCOUNT, COPY } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';

/**
 * 내 정보 수정 — **보기가 기본이고, 수정은 눌러서 들어간다.**
 *
 * 들어오자마자 전부 고칠 수 있으면 값을 확인하러 온 사람이 실수로 지우게 된다. 잠긴 상태에서는
 * 읽기만 하고, `수정` 을 눌러야 입력이 열린다. `취소` 는 고치던 값을 버리고 원래대로 되돌린다.
 *
 * 고칠 수 없는 항목이 둘 있다.
 *   - **이메일** — 주문·문의 기록이 이메일로 묶여 있어 바꾸는 순간 내 기록이 아니게 된다.
 *   - **이름** — 결제·배송에 쓰이는 실명이라 본인 확인을 거치지 않고 바꿀 수 없다.
 * 대신 화면에 드러나는 이름은 **닉네임**으로 따로 둔다.
 *
 * 저장은 **검사 → 확인 → 저장 → 안내** 의 네 걸음을 지킨다. 프론트엔드 전용이라 서버에
 * 보내지는 않지만, 화면이 어떻게 반응하는지가 이 프로젝트의 결과물이다.
 *
 * ## 어드민 연동
 * - 회원 ID · 이름 · 이메일 · 연락처 ← `b2c-admin` 사용자 > 사용자 목록의 상세 (같은 자원)
 * - 마케팅 동의 ← 사용자 목록의 **수신 동의** 열
 * - 연락처는 문의 기록의 연락처와 같은 사람을 가리킨다 (store `INQUIRIES.phone`)
 */
type Field = 'nickname' | 'phone' | 'address' | 'addressDetail';

/** 국가 코드 — 전화번호 앞자리. 네이티브 select 는 option 글자가 추출되지 않아 쓰지 않는다. */
const COUNTRY_CODES = ['+82', '+1', '+81', '+86', '+65'];

/** 닉네임 재료 — 서버가 없으므로 화면에서 만든다. 가입 시 자동 생성되는 것과 같은 규칙이다. */
const NICK_HEAD = ['푸른', '고요한', '느긋한', '작은', '단단한', '맑은', '따뜻한'];
const NICK_TAIL = ['바람', '숲길', '오후', '항해', '언덕', '물결', '겨울'];

const RULES: Record<Field, (value: string) => string> = {
  nickname: (value) => (value.trim() ? '' : '닉네임을 입력해 주세요.'),
  // 하이픈을 지우고 숫자만 센다 — 사람마다 적는 모양이 달라 그대로 검사하면 멀쩡한 값이 막힌다.
  phone: (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '연락처를 입력해 주세요.';
    return digits.length >= 9 && digits.length <= 11 ? '' : '연락처 형식을 확인해 주세요.';
  },
  address: (value) => (value.trim() ? '' : '주소를 입력해 주세요.'),
  addressDetail: () => '',
};

/** 다음(카카오) 우편번호 서비스 — 필요할 때 한 번만 불러온다. */
const POSTCODE_SRC = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

type PostcodeResult = { zonecode: string; roadAddress: string; jibunAddress: string };

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: PostcodeResult) => void }) => { open: () => void };
    };
  }
}

function loadPostcode(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = POSTCODE_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('주소 서비스를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
}

export function ProfileForm() {
  const toast = useToast();

  const initial = {
    nickname: ACCOUNT.nickname,
    countryCode: ACCOUNT.countryCode,
    phone: ACCOUNT.phone,
    postalCode: ACCOUNT.postalCode,
    address: ACCOUNT.address,
    addressDetail: ACCOUNT.addressDetail,
    marketing: ACCOUNT.marketing,
  };

  const [values, setValues] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const set = (key: keyof typeof initial, value: string | boolean) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    // 고치는 순간 오류 표시를 지운다 — 다 적고 나서도 빨간 줄이 남아 있으면 무엇이 문제인지 흐려진다.
    setErrors((previous) => ({ ...previous, [key]: '' }));
  };

  const shuffleNickname = () => {
    const head = NICK_HEAD[Math.floor(Math.random() * NICK_HEAD.length)];
    const tail = NICK_TAIL[Math.floor(Math.random() * NICK_TAIL.length)];
    const number = 1000 + Math.floor(Math.random() * 9000);
    set('nickname', `${head}${tail}${number}`);
  };

  const findAddress = async () => {
    try {
      await loadPostcode();
      new window.daum!.Postcode({
        oncomplete: (data) => {
          set('postalCode', data.zonecode);
          set('address', data.roadAddress || data.jibunAddress);
          toast.info({ message: '주소를 가져왔습니다', detail: '상세 주소를 이어서 적어 주세요.' });
        },
      }).open();
    } catch {
      // 주소 서비스가 막혀 있어도 입력 자체는 막지 않는다 — 손으로 적을 수 있어야 한다.
      toast.error({ message: '주소 찾기를 열지 못했습니다', detail: '네트워크를 확인하거나 직접 입력해 주세요.' });
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    (Object.keys(RULES) as Field[]).forEach((field) => {
      const message = RULES[field](values[field]);
      if (message) next[field] = message;
    });
    setErrors(next);

    const failed = Object.values(next);
    if (failed.length > 0) {
      toast.error({ message: '저장하지 못했습니다', detail: `${failed.length}개 항목을 확인해 주세요 — ${failed[0]}` });
      return;
    }

    setConfirming(true);
  };

  const save = () => {
    setConfirming(false);
    setEditing(false);
    toast.success({
      message: '내 정보를 저장했습니다',
      detail: `${values.nickname} · ${values.countryCode} ${values.phone}`,
    });
  };

  const cancel = () => {
    setValues(initial);
    setErrors({});
    setEditing(false);
    toast.info({ message: '수정을 취소했습니다', detail: '고치던 내용은 저장되지 않았습니다.' });
  };

  const inputClass = (invalid = false) =>
    `h-11 w-full min-w-0 rounded-lg border px-3 text-sm ${
      invalid ? 'border-signal-danger' : 'border-border-strong'
    } ${editing ? 'bg-surface text-ink' : 'border-border bg-surface text-ink-muted'}`;

  return (
    <>
      <form onSubmit={submit} className="flex w-full flex-col gap-5">
        {/* 잠금 상태를 글로도 알린다 — 입력란 색만으로는 '왜 안 써지는지' 가 전달되지 않는다. */}
        {!editing && (
          <p className="rounded-lg bg-surface px-4 py-3 text-xs text-ink-muted">{COPY.mypage.profileLocked}</p>
        )}

        <Row label={COPY.mypage.memberIdLabel}>
          <input readOnly value={ACCOUNT.memberId} className={`${inputClass()} font-mono`} />
        </Row>

        <Row label={COPY.mypage.emailLabel} note="주문·문의 기록이 이메일로 묶여 있어 변경할 수 없습니다.">
          <input readOnly value={ACCOUNT.email} className={inputClass()} />
        </Row>

        <Row label={COPY.mypage.nameLabel} note="결제·배송에 쓰이는 실명이라 고객센터를 통해서만 바꿀 수 있습니다.">
          <input readOnly value={ACCOUNT.name} className={inputClass()} />
        </Row>

        <Row label={COPY.mypage.nicknameLabel} error={errors.nickname}>
          <div className="flex w-full gap-2">
            <input
              value={values.nickname}
              readOnly={!editing}
              onChange={(event) => set('nickname', event.target.value)}
              aria-invalid={Boolean(errors.nickname)}
              className={inputClass(Boolean(errors.nickname))}
            />
            <button
              type="button"
              onClick={shuffleNickname}
              disabled={!editing}
              className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted disabled:opacity-40"
            >
              {COPY.mypage.nicknameShuffle}
            </button>
          </div>
        </Row>

        <Row label={COPY.mypage.phoneLabel} error={errors.phone}>
          <div className="flex w-full gap-2">
            {/*
              국가 코드는 네이티브 select 를 쓰지 않는다 — option 글자는 DOM 텍스트가 아니라
              추출되지 않고 Figma 에서 빈 상자가 된다 (docs/spec/05-component.md).
            */}
            <div className="flex shrink-0 gap-1">
              {COUNTRY_CODES.map((code) => {
                const active = code === values.countryCode;
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={!editing}
                    aria-pressed={active}
                    onClick={() => set('countryCode', code)}
                    className={`h-11 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm tabular-nums transition-colors duration-150 disabled:opacity-60 ${
                      active
                        ? 'border-ink bg-ink font-medium text-white'
                        : 'border-border-strong text-ink-muted'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            <input
              value={values.phone}
              readOnly={!editing}
              inputMode="numeric"
              onChange={(event) => set('phone', event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-label={COPY.mypage.phoneLabel}
              className={`${inputClass(Boolean(errors.phone))} tabular-nums`}
            />
          </div>
        </Row>

        <Row label={COPY.mypage.addressLabel} error={errors.address}>
          <div className="flex w-full flex-col gap-2">
            <div className="flex gap-2">
              <input
                readOnly
                value={values.postalCode}
                aria-label={COPY.mypage.postalLabel}
                className={`${inputClass()} w-32 shrink-0 tabular-nums`}
              />
              <button
                type="button"
                onClick={findAddress}
                disabled={!editing}
                className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted disabled:opacity-40"
              >
                {COPY.mypage.addressFind}
              </button>
            </div>
            <input
              value={values.address}
              readOnly={!editing}
              onChange={(event) => set('address', event.target.value)}
              aria-invalid={Boolean(errors.address)}
              aria-label={COPY.mypage.addressLabel}
              className={inputClass(Boolean(errors.address))}
            />
          </div>
        </Row>

        <Row label={COPY.mypage.addressDetailLabel}>
          <input
            value={values.addressDetail}
            readOnly={!editing}
            onChange={(event) => set('addressDetail', event.target.value)}
            className={inputClass()}
          />
        </Row>

        <Row label={COPY.mypage.marketingLabel}>
          <label className="flex w-full items-center gap-2.5 rounded-lg bg-surface px-4 py-3">
            {/* 체크박스 그림은 브라우저마다 달라 추출이 어긋나므로 직접 그린다. */}
            <input
              type="checkbox"
              checked={values.marketing}
              disabled={!editing}
              onChange={(event) => set('marketing', event.target.checked)}
              className="size-4 shrink-0 appearance-none rounded border border-border-strong bg-canvas checked:border-brand-500 checked:bg-brand-500 disabled:opacity-60"
            />
            <span className="text-sm text-ink-muted">혜택·기획전 소식을 이메일과 문자로 받습니다.</span>
          </label>
        </Row>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancel}
                className="h-11 flex-1 shrink-0 whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted"
              >
                {COPY.mypage.profileCancel}
              </button>
              <button
                type="submit"
                className="h-11 flex-1 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
              >
                {COPY.mypage.profileSave}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
            >
              {COPY.mypage.profileEdit}
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        title="내 정보를 저장할까요?"
        description="입력하신 내용으로 배송 안내와 답변이 전달됩니다."
        confirmLabel={COPY.mypage.profileSave}
        tone="brand"
        onConfirm={save}
        onClose={() => setConfirming(false)}
        summary={[
          { label: COPY.mypage.nicknameLabel, value: values.nickname },
          { label: COPY.mypage.phoneLabel, value: `${values.countryCode} ${values.phone}` },
          { label: COPY.mypage.addressLabel, value: `${values.address} ${values.addressDetail}`.trim() },
          { label: COPY.mypage.marketingLabel, value: values.marketing ? '동의' : '미동의' },
        ]}
      />
    </>
  );
}

/**
 * 한 줄 = 한 항목. 라벨을 위에 두고 입력을 **가로로 꽉 채운다** — 좁게 두면 주소처럼 긴 값이
 * 잘려 무엇이 적혀 있는지 확인할 수 없다.
 */
function Row({
  label,
  note,
  error,
  children,
}: {
  label: string;
  note?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {note && <p className="text-xs text-ink-faint">{note}</p>}
      {error && <p className="text-xs text-signal-danger">{error}</p>}
    </div>
  );
}
