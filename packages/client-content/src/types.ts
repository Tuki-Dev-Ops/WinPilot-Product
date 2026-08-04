import type { ProductArtKind } from '@winpilot/store';

export type { ProductArtKind };

/**
 * 고객 화면 콘텐츠 계약 (SSOT).
 *
 * **템플릿 A~F 는 레이아웃만 다르고 값은 전부 여기서 온다.**
 * 어드민이 설정한 것이 이 모양으로 흘러들어오고, 템플릿은 배치만 정한다.
 * 템플릿이 자기 문구나 자기 데이터를 갖기 시작하면 "어드민에서 바꿨는데 A 는 바뀌고
 * C 는 안 바뀐다" 가 되고, 그 순간 템플릿을 6개 두는 의미가 사라진다.
 *
 * 그래서 이 패키지에는 **표시할 값**과 **표준 식별자**만 있고, 스타일이나 컴포넌트는 없다.
 */

export type Money = number;

export type SupplierInfo = {
  companyName: string;
  /** 어드민 공급자 정보에서 올린 로고. 없으면 회사명을 글자로 쓴다 */
  logoUrl: string;
  ceo: string;
  businessNumber: string;
  mailOrderNumber: string;
  section: string;
  industry: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  phone: string;
  fax: string;
  email: string;
  privacyOfficer: string;
  hostingProvider: string;
};

export type SeoInfo = {
  title: string;
  description: string;
  canonicalUrl: string;
  indexable: boolean;
  ogTitle: string;
  ogDescription: string;
};

export type BannerItem = {
  id: string;
  title: string;
  /** 제목 아래 한 줄 — 무엇을 파는지 · 얼마나 싼지 */
  subtitle: string;
  /** 제목 위 작은 딱지 (예: Promotion). 비우면 그리지 않는다 */
  badge: string;
  linkUrl: string;
  order: number;
  /** 배너 이미지. 없으면 자리표시자를 그린다 */
  imageUrl?: string;
};

export type CategoryNode = {
  id: string;
  name: string;
  parentId: string;
};

export type ProductOptionItem = {
  id: string;
  color: string;
  size: string;
  stock: number;
};

export type ProductItem = {
  id: string;
  name: string;
  categoryRootId: string;
  categoryChildId: string;
  price: Money;
  listPrice: Money;
  stock: number;
  saleState: string;
  /** HTML — 어드민의 에디터가 만든 값 */
  description: string;
  /** 계산된 값 — 템플릿이 다시 계산하지 않는다 */
  tags: Array<'NEW' | 'BEST'>;
  reward: Money;
  shippingText: string;
  /** 쿠폰까지 적용했을 때의 값. 0 이면 표시하지 않는다 */
  benefitPrice: Money;
  /** 배송 조건 옆에 붙는 짧은 안내 (예: 설치비 별도) */
  shippingNote: string;
  options: ProductOptionItem[];
  visible: boolean;
  /** 어드민이 올린 대표 이미지. 비어 있으면 아래 `art` 로 그린다 */
  imageUrl: string;
  /** 사진이 없을 때 그 자리에 그릴 벡터 그림 — store 가 카테고리로 정한다 */
  art: { kind: ProductArtKind; from: string; to: string; ink: string };
};

export type ArticleItem = {
  id: string;
  title: string;
  /** HTML 또는 요약 글 */
  body: string;
  publishedAt: string;
  /** 뉴스처럼 원문으로 보내는 항목 */
  linkUrl?: string;
  /** 공지 상단 고정 */
  pinned?: boolean;
};

export type FaqItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  question: string;
  /** HTML */
  answer: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  client: string;
  period: string;
  /** HTML */
  body: string;
};

export type CompanyInfo = {
  name: string;
  ceo: string;
  foundedAt: string;
  /** HTML */
  intro: string;
  milestones: Array<{ id: string; date: string; title: string; description: string }>;
};

export type PolicyDoc = {
  label: string;
  version: string;
  effectiveAt: string;
  /** HTML */
  body: string;
};

export type InquiryFormConfig = {
  categories: string[];
  /** 어드민에서 켠 항목만 온다 — 템플릿이 다시 거르지 않는다 */
  fields: Array<{ key: string; label: string; required: boolean }>;
  /** 첨부 가능한 형식·크기. 안내 문구가 어드민과 같아야 한다 */
  attachment: { accept: string; acceptText: string; maxMb: number; maxCount: number };
  guideText: string;
  doneText: string;
};

/** 템플릿이 받는 전부. 이 밖의 값을 템플릿이 만들어 쓰면 안 된다. */
export type SiteContent = {
  supplier: SupplierInfo;
  seo: SeoInfo;
  banners: BannerItem[];
  categories: CategoryNode[];
  products: ProductItem[];
  notices: ArticleItem[];
  news: ArticleItem[];
  faqs: FaqItem[];
  portfolios: PortfolioItem[];
  company: CompanyInfo;
  terms: PolicyDoc;
  privacy: PolicyDoc;
  inquiryForm: InquiryFormConfig;
};
