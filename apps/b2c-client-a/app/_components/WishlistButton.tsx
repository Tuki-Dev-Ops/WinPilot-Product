'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@winpilot/ui';
import { WISHLIST_EVENT, readWishlist, toggleWishlist } from './wishlist-store';

/**
 * 관심 상품 하트 — **카드 안에 있지만 카드로 이동하지 않는다.**
 *
 * 카드 전체가 상세로 가는 링크라, 하트를 누르면 링크가 먼저 잡아채 상세로 넘어가 버린다.
 * 그래서 기본 동작과 전파를 둘 다 막는다.
 *
 * 담긴 상태는 색과 **채움**으로 함께 알린다. 색만 바꾸면 색각 이상 사용자가 구분하지 못한다.
 *
 * 서버가 그린 것과 어긋나지 않도록 처음에는 **꺼진 모양**으로 그리고, 브라우저에 올라온 뒤
 * 저장된 값으로 맞춘다.
 *
 * ## 어드민 연동
 * - 담기는 것은 상품 아이디뿐 — 이름·가격은 `b2c-admin` 상품 목록에서 읽는다 (store `PRODUCTS`)
 */
export function WishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const sync = () => setLiked(readWishlist().includes(productId));
    sync();
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_EVENT, sync);
  }, [productId]);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`${productName} 관심 상품 ${liked ? '빼기' : '담기'}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const next = toggleWishlist(productId);
        setLiked(next);
        if (next) {
          toast.success({ message: '관심 상품에 담았습니다', detail: productName });
        } else {
          toast.info({ message: '관심 상품에서 뺐습니다', detail: productName });
        }
      }}
      className={`absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full transition-colors duration-150 ${
        liked ? 'text-signal-danger' : 'text-white/90 hover:text-white'
      }`}
    >
      <Heart aria-hidden className={`size-5 ${liked ? 'fill-current' : ''}`} strokeWidth={1.4} />
    </button>
  );
}
