/**
 * 저장된 값은 @winpilot/store 한 곳에만 있다.
 * 어드민과 고객 화면이 각자 시드를 들면 두 화면이 서로 다른 것을 보여주게 된다.
 */
import type { BadgeTone } from '@winpilot/ui';
import type { ProductTag } from '@winpilot/store';

export {
  BEST_MIN_SALES,
  NEW_WITHIN_DAYS,
  TAG_RULE_TEXT,
  daysBetween,
  isBestProduct,
  isNewProduct,
  productTags,
  todayStamp,
  type ProductTag,
} from '@winpilot/store';

/**
 * NEW·BEST 를 무슨 색으로 그릴지. 어드민만 쓴다 — 경위는 `@winpilot/store` 의
 * `product-tags.ts` 에 있다.
 *
 * BEST 가 `danger` 인 것은 위험하다는 뜻이 아니라 **붉은색을 쓴다**는 뜻이다. 잘 팔리는
 * 상품을 눈에 띄게 하려고 고른 색인데, 톤 이름이 뜻을 담고 있어 이 자리에서만 어긋난다.
 * 이름을 `danger` 대신 색으로 부르면(`red`) 이 문제는 없어지지만 나머지 스무 곳이
 * 전부 뜻을 잃는다 — 한 자리의 어색함이 낫다고 보고 이렇게 둔다.
 */
export const TAG_TONE: Record<ProductTag, BadgeTone> = {
  NEW: 'brand',
  BEST: 'danger',
};
