import { TAG_TONE, type ProductTag } from '@/lib/data/product-tags';

export type ProductTagBadgesProps = {
  tags: readonly ProductTag[];
  size?: 'sm' | 'md';
};

/** NEW·BEST 뱃지. 목록·폼·고객 미리보기가 같은 모양을 써야 규칙이 같아 보인다. */
export function ProductTagBadges({ tags, size = 'md' }: ProductTagBadgesProps) {
  if (tags.length === 0) return null;

  const scale = size === 'sm' ? 'px-1.5 py-0.5 text-3xs' : 'px-2 py-0.5 text-xs';

  return (
    <>
      {tags.map((tag) => (
        <span key={tag} className={`shrink-0 rounded-full font-semibold tracking-wide ${scale} ${TAG_TONE[tag]}`}>
          {tag}
        </span>
      ))}
    </>
  );
}
