export type CategoryRecord = {
  id: string;
  name: string;
  /** 상위 카테고리 id. 빈 문자열이면 1Depth. */
  parentId: string;
  visible: boolean;
  /** 이 카테고리에 속한 상품 수 — 자동 집계 */
  productCount: number;
};

/**
 * 프론트엔드 전용 시드 데이터.
 *
 * 카테고리 관리 화면과 상품 등록 폼이 **같은 목록**을 본다.
 * 각자 상수를 들고 있으면 한쪽만 고쳐져 서로 다른 카테고리를 보여주게 된다.
 */
export const CATEGORIES: CategoryRecord[] = [
  { id: 'C-01', name: '리빙', parentId: '', visible: true, productCount: 128 },
  { id: 'C-02', name: '주방', parentId: 'C-01', visible: true, productCount: 54 },
  { id: 'C-03', name: '침구', parentId: 'C-01', visible: true, productCount: 31 },
  { id: 'C-04', name: '수납', parentId: 'C-01', visible: false, productCount: 43 },
  { id: 'C-05', name: '패션', parentId: '', visible: true, productCount: 214 },
  { id: 'C-06', name: '아우터', parentId: 'C-05', visible: true, productCount: 88 },
  { id: 'C-07', name: '상의', parentId: 'C-05', visible: true, productCount: 126 },
  { id: 'C-08', name: '아웃도어', parentId: '', visible: false, productCount: 42 },
];

export const rootCategories = (list: CategoryRecord[] = CATEGORIES) => list.filter((item) => !item.parentId);

export const childCategories = (parentId: string, list: CategoryRecord[] = CATEGORIES) =>
  list.filter((item) => item.parentId === parentId);
