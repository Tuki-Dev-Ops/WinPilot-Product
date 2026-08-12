'use client';

import { useState } from 'react';
import { PageHeading, Panel } from '@winpilot/ui';
import { FNB_BRAND } from '@winpilot/store';
import { FnbField, FnbReadonly, FnbRecordForm, FnbTextInput } from '@/app/_components/FnbForm';

/**
 * 설정 > 브랜드 정보.
 *
 * ## 창구 번호가 둘인 것이 요점이다
 * 손님 문의와 창업 상담을 나눠 받는다. 하나로 두면 창업 전화가 매장 번호로 가고, 그 전화를 받는
 * 사람은 답할 수 없는 것을 묻는 사람과 통화하게 된다 — 양쪽 다 손해다. 그래서 여기서도 두 칸을
 * 붙여 세워, 같은 번호를 두 번 적는 실수가 눈에 띄게 한다.
 *
 * ## 브랜드명을 고칠 수 있게 두지 않는다
 * 이름이 바뀌면 로고 · 간판 · 사업자등록증이 함께 바뀌는 일이다. 여기서 글자만 고칠 수 있게 두면
 * **사이트에만 새 이름이 서고** 나머지가 옛 이름으로 남는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function BrandSettingsView() {
  const [tagline, setTagline] = useState(FNB_BRAND.tagline);
  const [phone, setPhone] = useState(FNB_BRAND.phone);
  const [franchisePhone, setFranchisePhone] = useState(FNB_BRAND.franchisePhone);
  const [email, setEmail] = useState(FNB_BRAND.email);
  const [address, setAddress] = useState(FNB_BRAND.address);
  const [tried, setTried] = useState(false);

  /* 두 창구가 같은 번호면 나눠 둔 뜻이 사라진다. 막지는 않고 알린다 — 실제로 같을 수도 있다. */
  const sameDesk = phone.trim() !== '' && phone.trim() === franchisePhone.trim();

  const broken = [
    ...(tagline.trim() ? [] : ['한 줄 소개']),
    ...(phone.trim() ? [] : ['손님 문의']),
    ...(franchisePhone.trim() ? [] : ['창업 상담']),
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? [] : ['이메일']),
    ...(address.trim() ? [] : ['주소']),
  ];

  return (
    <>
      <PageHeading title="브랜드 정보" description="사이트 첫 화면과 푸터가 이 값을 읽습니다." />

      <FnbRecordForm
        resource="브랜드 정보"
        detail={`${FNB_BRAND.name} — ${tagline.trim()}`}
        validate={() => {
          setTried(true);
          return broken;
        }}
      >
        <Panel title="이름과 한 줄" description="첫 화면의 큰 글씨가 한 줄 소개입니다.">
          <div className="flex flex-col gap-5 px-6 py-5">
            <FnbReadonly label="브랜드명" value={`${FNB_BRAND.name} (${FNB_BRAND.nameEn})`} note="수정 불가" />
            <FnbReadonly label="대표이사" value={FNB_BRAND.ceo} note="등기 사항" />
            <FnbReadonly label="사업자등록번호" value={FNB_BRAND.businessNumber} note="등기 사항" />

            <FnbField
              label="한 줄 소개"
              htmlFor="brand-tagline"
              required
              {...(tried && !tagline.trim()
                ? { error: '한 줄 소개를 입력해 주세요.' }
                : { hint: '첫 화면에 가장 큰 글씨로 섭니다. 무엇을 파는 집인지가 여기서 드러나야 합니다.' })}
            >
              <FnbTextInput
                id="brand-tagline"
                value={tagline}
                onChange={setTagline}
                invalid={tried && !tagline.trim()}
              />
            </FnbField>
          </div>
        </Panel>

        <Panel title="창구" description="푸터에 나란히 섭니다. 받는 사람이 달라 나눠 둡니다.">
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FnbField
                label="손님 문의"
                htmlFor="brand-phone"
                required
                {...(tried && !phone.trim()
                  ? { error: '번호를 입력해 주세요.' }
                  : { hint: '메뉴 · 매장 · 예약 문의를 받습니다.' })}
              >
                <FnbTextInput id="brand-phone" value={phone} onChange={setPhone} invalid={tried && !phone.trim()} />
              </FnbField>

              <FnbField
                label="창업 상담"
                htmlFor="brand-franchise-phone"
                required
                {...(tried && !franchisePhone.trim()
                  ? { error: '번호를 입력해 주세요.' }
                  : { hint: '이 번호로 오는 전화는 전부 점주 후보입니다.' })}
              >
                <FnbTextInput
                  id="brand-franchise-phone"
                  value={franchisePhone}
                  onChange={setFranchisePhone}
                  invalid={tried && !franchisePhone.trim()}
                />
              </FnbField>
            </div>

            {sameDesk && (
              <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
                두 창구가 같은 번호입니다. 나눠 둔 뜻이 사라지므로, 받는 사람이 다르다면 번호도 나누시길
                권합니다 — 같은 번호가 맞다면 그대로 저장하셔도 됩니다.
              </p>
            )}

            <FnbField
              label="이메일"
              htmlFor="brand-email"
              required
              {...(tried && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                ? { error: '메일 주소를 정확히 적어 주세요.' }
                : { hint: '개인정보 처리방침의 문의처로도 함께 나갑니다.' })}
            >
              <FnbTextInput
                id="brand-email"
                value={email}
                onChange={setEmail}
                invalid={tried && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
              />
            </FnbField>

            <FnbField
              label="주소"
              htmlFor="brand-address"
              required
              {...(tried && !address.trim()
                ? { error: '주소를 입력해 주세요.' }
                : { hint: '본사 주소입니다. 매장 주소는 매장 갈래에서 따로 관리합니다.' })}
            >
              <FnbTextInput
                id="brand-address"
                value={address}
                onChange={setAddress}
                invalid={tried && !address.trim()}
              />
            </FnbField>
          </div>
        </Panel>
      </FnbRecordForm>
    </>
  );
}
