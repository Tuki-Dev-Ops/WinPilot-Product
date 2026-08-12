'use client';

import { useState } from 'react';
import { Badge, Dropdown, Panel } from '@winpilot/ui';
import { MENU_CATEGORIES, formatPrice, type MenuItem } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbSelect,
  FnbTextArea,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';
import { PickChips } from '@/app/_components/PickChips';

/**
 * 메뉴 상세 — **말과 값은 고치고, 알레르기는 지우지 못한다.**
 *
 * ## 알레르기를 자유 입력으로 두지 않는다
 * 표시 의무가 있는 값이라 문장으로 적게 두면 `우유 조금` 같은 말이 들어가는데, 그것은 **검색도
 * 대조도 되지 않는다.** 정해진 목록에서 골라 켜고 끄게 둔다 — 그래야 목록 화면에서 빠진 줄을
 * 셀 수 있다(그쪽 머리말).
 *
 * 목록에 없는 재료가 필요해지는 날에는 코드에서 늘린다. 화면에서 새 이름을 만들 수 있게 두면
 * 같은 재료가 `대두` 와 `콩` 두 이름으로 쌓인다.
 *
 * ## 값을 숫자로 받는다
 * `10,000원` 을 입력하게 두면 쉼표와 단위가 값에 섞여 들어가고, 그때부터 값을 더할 수 없다.
 * 쉼표를 붙이는 일은 화면이 한다(store 의 `formatPrice`) — 사이트와 어드민이 같은 글자를
 * 찍어야 하기 때문이다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */

/**
 * 표시 의무가 있는 알레르기 유발 재료.
 *
 * 이 목록을 store 에 두지 않은 이유: 값이 아니라 **입력 규칙**이다. 어드민에서 늘릴 수 있게
 * 두면 같은 재료가 두 이름으로 쌓이고, 그러면 목록 화면의 대조가 무의미해진다.
 *
 * ## 목록에 같은 이름이 두 번 들어가 있었다
 * 국밥 브랜드에서 이 브랜드로 옮기면서 `소고기` 를 `오징어` 로 바꿨는데, 목록 아래쪽에 이미
 * `오징어` 가 있었다. React 가 **같은 `key` 두 개**를 만나 콘솔에 경고를 냈고, 화면에서는
 * 알약 하나를 켜면 둘이 같이 켜졌다 — 화면만 봐서는 그것이 버그인지 알기 어렵다.
 *
 * 지금은 해산물을 앞으로 모으고 중복을 없앴다. 새 재료를 더할 때는 **이미 있는지 훑고** 넣는다.
 */
/** 고르개에 세울 묶음 — 값은 코드, 보이는 것은 이름. */
const CATEGORY_OPTIONS = MENU_CATEGORIES.map((one) => ({ value: one.id, label: one.name }));

const ALLERGENS = [
  '문어',
  '오징어',
  '조개류',
  '새우',
  '게',
  '계란',
  '우유',
  '대두',
  '밀',
  '메밀',
  '땅콩',
  '토마토',
  '겨자',
  '아황산류',
] as const;

/**
 * 줄에 붙는 표. 자유 입력으로 두면 `인기`·`베스트`·`추천` 이 한 목록에 쌓인다.
 *
 * `매운맛` 이 빠졌다. 그 말은 맵다는 것만 말하고 얼마나 매운지는 말하지 않아, 아래 **강도**로
 * 옮겼다 — 사이트는 그 값을 불꽃 개수로 그린다.
 */
const TAGS = ['인기', '신메뉴', '계절'] as const;

/** 매운 정도. 안 매운 것은 값을 갖지 않는다(`없음`). */
const SPICY = ['없음', '1단계', '2단계', '3단계'] as const;

export function MenuForm({ item, mode = 'edit' }: { item: MenuItem; mode?: 'edit' | 'create' }) {
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [price, setPrice] = useState(String(item.price));
  const [kcal, setKcal] = useState(String(item.kcal));
  const [description, setDescription] = useState(item.description);
  const [allergens, setAllergens] = useState<string[]>(item.allergens);
  const [tags, setTags] = useState<string[]>(item.tags);
  /* 값(1~3)과 화면에 서는 말(`2단계`)을 잇는다. 목록에서 자리로 잇는 것이 값이 하나뿐인 표보다 안전하다. */
  const [spicy, setSpicy] = useState<string>(item.spicy ? SPICY[item.spicy] : SPICY[0]);
  const [visible, setVisible] = useState(item.visible);
  const [tried, setTried] = useState(false);

  /* 숫자 칸은 비었는지와 숫자인지를 나눠 본다 — `숫자가 아닙니다` 는 빈 칸에 대한 답이 아니다. */
  const priceBroken = !price.trim() || !/^\d+$/.test(price.trim());
  const kcalBroken = !kcal.trim() || !/^\d+$/.test(kcal.trim());

  const broken = [
    ...(name.trim() ? [] : ['메뉴명']),
    ...(description.trim() ? [] : ['한 줄 설명']),
    ...(priceBroken ? ['값'] : []),
    ...(kcalBroken ? ['열량'] : []),
  ];


  return (
    <FnbRecordForm
      resource="메뉴"
      mode={mode}
      detail={`${name.trim() || '(이름 없음)'} — ${priceBroken ? '값 확인 필요' : formatPrice(Number(price))}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="메뉴판에 서는 것" description="이름 · 값 · 설명이 사이트 메뉴판과 상세 화면에 그대로 나갑니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="코드" value={item.id} note="수정 불가" />
          ) : (
            /* 코드는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 코드가 생긴다. */
            <FnbReadonly label="코드" value="저장할 때 매겨집니다" note="자동" />
          )}

          <FnbField
            label="메뉴명"
            htmlFor="menu-name"
            required
            {...(tried && !name.trim() ? { error: '메뉴명을 입력해 주세요.' } : {})}
          >
            <FnbTextInput id="menu-name" value={name} onChange={setName} invalid={tried && !name.trim()} />
          </FnbField>

          {/*
            묶음은 값(`sukhoe`)과 이름(`문어숙회`)이 다르다. 그래서 `Dropdown` 을 쓴다 —
            `FnbSelect` 는 값이 곧 이름인 자리의 것이라, 이 칸에 쓰면 **고르개에 코드가 그대로
            선다.** 한때 그랬고, 그때는 아래에 `지금 고른 것 — 문어숙회` 한 줄을 덧붙여 메웠다.
            고르는 자리에서 고른 것이 무엇인지 아래 줄을 읽어야 아는 것은 메운 것이 아니다.

            이름을 값으로 저장하는 방법도 있었다. 그러면 묶음 이름을 바꾸는 날 **메뉴가 전부
            묶음을 잃는다.**
          */}
          <FnbField label="묶음" htmlFor="menu-category" hint="메뉴판에서 이 묶음 아래에 섭니다.">
            <Dropdown
              id="menu-category"
              label="묶음을 고르세요"
              value={categoryId}
              onChange={setCategoryId}
              options={CATEGORY_OPTIONS}
            />
          </FnbField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FnbField
              label="값"
              htmlFor="menu-price"
              required
              {...(tried && priceBroken
                ? { error: '숫자만 입력해 주세요. 쉼표와 원은 화면이 붙입니다.' }
                : { hint: `사이트에는 ${priceBroken ? '—' : formatPrice(Number(price))} 로 섭니다.` })}
            >
              <FnbTextInput id="menu-price" value={price} onChange={setPrice} invalid={tried && priceBroken} />
            </FnbField>

            <FnbField
              label="열량 (kcal)"
              htmlFor="menu-kcal"
              required
              {...(tried && kcalBroken ? { error: '숫자만 입력해 주세요.' } : { hint: '1인분 기준입니다.' })}
            >
              <FnbTextInput id="menu-kcal" value={kcal} onChange={setKcal} invalid={tried && kcalBroken} />
            </FnbField>
          </div>

          <FnbField
            label="한 줄 설명"
            htmlFor="menu-description"
            required
            {...(tried && !description.trim()
              ? { error: '설명을 입력해 주세요.' }
              : { hint: '무엇이 들었는지가 아니라 어떤 맛인지를 적으세요 — 재료는 아래 알레르기가 말합니다.' })}
          >
            <FnbTextArea
              id="menu-description"
              rows={3}
              value={description}
              onChange={setDescription}
              invalid={tried && !description.trim()}
            />
          </FnbField>

          <FnbToggle
            id="menu-visible"
            label="메뉴판에 노출"
            description="끄면 사이트 메뉴판에서 사라집니다. 상세 화면은 주소를 직접 치면 열리되 지금 팔지 않는다고 적힙니다 — 품절과 계절 메뉴에 쓰는 자리입니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </Panel>

      <Panel
        title="알레르기 유발 재료"
        description="표시 의무가 있는 값입니다. 목록에서 골라 주세요."
        aside={
          <Badge tone={allergens.length > 0 ? 'neutral' : 'wait'}>
            {allergens.length > 0 ? `${allergens.length}개` : '없음'}
          </Badge>
        }
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          <PickChips options={ALLERGENS} picked={allergens} onChange={setAllergens} />

          {/*
            하나도 안 고른 것과 아직 안 본 것을 화면이 구분하지 못한다. 그래서 비었을 때 **그것이
            의도인지 묻는** 한 줄을 둔다 — 저장을 막지는 않는다. 실제로 없는 메뉴가 있다(소주).
          */}
          {allergens.length === 0 && (
            <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
              하나도 고르지 않았습니다. 정말 해당 없는 메뉴라면 그대로 저장하셔도 됩니다 — 사이트에는
              `해당 없음` 으로 섭니다.
            </p>
          )}
        </div>
      </Panel>

      <Panel title="표 · 매운 정도" description="사이트 카드의 사진 위 왼쪽에 얹히는 것들입니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField label="표" hint="없어도 됩니다. `인기` 만 붉게 서고 나머지는 검은 딱지입니다.">
            <PickChips options={TAGS} picked={tags} onChange={setTags} />
          </FnbField>

          <FnbField
            label="매운 정도"
            htmlFor="menu-spicy"
            hint="사이트에는 불꽃 개수로 섭니다 — 3단계면 불꽃 셋. 안 매운 것은 `없음` 으로 두세요."
          >
            <FnbSelect id="menu-spicy" value={spicy} onChange={setSpicy} options={SPICY} />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}

