import { formatPrice, type MenuItem } from '@winpilot/store';
import { FNB_ROUTES } from '@/lib/navigation';
import { PhotoSlot } from './PhotoSlot';
import { SpicyMark } from './SpicyMark';

/**
 * 메뉴 한 줄 — **메뉴판과 상세와 홈이 같은 것을 쓴다.**
 *
 * 세 화면에 같은 줄이 선다. 화면마다 그리면 세 벌이 되고, 그러다 한 곳에만 `인기` 표가 빠지거나
 * 값에 쉼표가 안 붙는다 — 나란히 열어 놓기 전에는 드러나지 않는 어긋남이다.
 *
 * ## 사진 자리는 `PhotoSlot` 이 맡는다
 * 아직 사진이 없다. 왜 빈 상자를 두지 않고 첫 글자를 세우는지는 그쪽 머리말에 있다 — 마케팅
 * 화면의 글 카드도 같은 것을 쓰므로, 사진이 들어오는 날 한 군데만 고치면 둘 다 바뀐다.
 */
/**
 * 표의 색.
 *
 * `인기` 만 브랜드색이다. 나머지를 다른 색으로 칠하면 사진 칸 위에 색 딱지가 여럿 떠서 **어느
 * 것이 눈에 들어야 하는지**가 사라진다 — 표를 붙이는 까닭이 그것 하나인데.
 *
 * 한때 `signal-danger`(검증 오류에 쓰는 붉은색)였다. 브랜드색으로 옮긴 이유: 그 색은 **잘못됐다**
 * 는 뜻으로 온 사이트에서 쓰이고 있어, 잘 나가는 메뉴에 붙이면 뜻이 흐려진다. 지금 사이트에서
 * 붉은 것은 다 브랜드색이고, 경고색은 경고에만 남는다.
 *
 * 나머지는 검은 딱지다. 흰 글씨를 얹으려면 바탕이 어두워야 하고, 사진 칸이 밝든 어둡든 검은
 * 딱지는 그 위에서 읽힌다(지금은 회색 칸이지만 사진이 들어오면 그때가 진짜다).
 */
const TAG_CLASS: Record<string, string> = {
  인기: 'bg-octo-600 text-white',
};
const TAG_CLASS_DEFAULT = 'bg-night/80 text-white';

/*
  가는 곳을 밖에서 받지 않는다. 메뉴 한 줄이 가는 자리는 그 메뉴의 상세 하나뿐이고, 세 화면이
  저마다 `/menu/${id}` 를 엮고 있었다 — 한 곳만 앞자리를 다르게 적어도 그 화면에서만 링크가
  어긋나고, 세 화면을 나란히 눌러 보기 전에는 모른다.
*/
export function MenuCard({ item }: { item: MenuItem }) {
  return (
    <a
      href={FNB_ROUTES.menuItem(item.id)}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-150 hover:border-ink-faint"
    >
      {/*
        표를 사진 칸 **왼쪽 위에 얹는다.**

        아래 값 옆에 두었을 때는 값과 표가 같은 줄에서 경쟁했고, 무엇보다 훑는 사람의 눈이
        **사진 → 이름 → 값** 으로 내려간 다음에야 표를 만났다. 인기 표는 그 눈길이 카드에
        닿는 첫 순간에 있어야 고르는 데 쓰인다.
      */}
      <span className="relative block">
        <PhotoSlot name={item.name} />

        {(item.tags.length > 0 || item.spicy) && (
          <span className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${TAG_CLASS[tag] ?? TAG_CLASS_DEFAULT}`}
              >
                {tag}
              </span>
            ))}
            {/* 매운 정도는 표가 아니라 불꽃이다 — 그쪽 머리말에 이유가 있다. */}
            {item.spicy && <SpicyMark level={item.spicy} />}
          </span>
        )}
      </span>

      {/*
        차례는 이름 → 설명 → 값이다.

        한때 이름과 값이 **한 줄에** 마주 보고 섰다. 그러면 이름이 긴 것(`손만두 (6개)`)에서
        값이 밀리고, 무엇보다 카드마다 설명 길이가 달라 **값이 저마다 다른 높이**에 선다 —
        셋을 나란히 놓고 견주는 자리에서 값이 지그재그로 보인다.

        값을 아래로 내리고 `mt-auto` 로 바닥에 붙이면 카드 높이가 달라도 값이 한 줄에 선다.
        이름도 줄 전체를 쓰게 되어 잘리지 않는다.
      */}
      <span className="flex flex-1 flex-col gap-2 px-5 py-4">
        <span className="text-base font-semibold">{item.name}</span>

        <span className="text-sm leading-relaxed text-ink-muted">{item.description}</span>

        <span className="mt-auto pt-2 font-mono text-base font-semibold tabular-nums">
          {formatPrice(item.price)}
        </span>
      </span>
    </a>
  );
}
