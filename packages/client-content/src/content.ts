import {
  BANNERS,
  CATEGORIES,
  COMPANY_PROFILE,
  FAQS,
  FAQ_CATEGORIES,
  INQUIRY_ATTACHMENT,
  INQUIRY_CATEGORIES,
  INQUIRY_DONE_TEXT,
  INQUIRY_FIELDS,
  INQUIRY_GUIDE_TEXT,
  MILESTONES,
  NEWS,
  NOTICES,
  PORTFOLIOS,
  PRIVACY,
  PRODUCTS,
  PRODUCT_OPTIONS,
  productArt,
  TERMS,
  estimateReward,
  formatAmount,
  milestoneDate,
  parseAmount,
  productTags,
  scheduleState,
  sortMilestones,
  todayStamp,
  type ProductRecord,
} from '@winpilot/store';
import { COPY, ROUTES } from './ids';
import type { ProductItem, SiteContent } from './types';

/**
 * 고객 화면이 보는 값 — **어드민이 저장한 것을 옮겨 담은 것**이다.
 *
 * 여기에 값을 직접 적지 않는다. 원본은 `@winpilot/store` 한 곳뿐이고 이 파일은 그것을
 * 고객 화면 모양으로 바꾸기만 한다. 시드를 두 벌 두면 어드민에서 상품을 4개 보는데
 * 고객 화면에는 12개가 나오는 일이 생기고, 그 순간 어느 쪽이 맞는지 알 수 없게 된다.
 *
 * **계산도 여기서 하지 않는다.** 적립금·NEW/BEST 는 store 의 규칙을 그대로 부른다 —
 * 규칙이 두 벌이면 같은 상품이 어드민과 고객 화면에서 다른 적립금으로 보인다.
 */
const TODAY = todayStamp();

/** 배송 문구 — 어드민의 배송 정책을 고객이 읽을 한 줄로 바꾼다. */
function shippingTextOf(product: ProductRecord): string {
  if (product.shippingPolicy === '무료') return '무료배송';
  if (product.shippingPolicy === '조건부 무료') {
    return `${formatAmount(parseAmount(product.freeThreshold))}원 이상 무료배송`;
  }
  return `배송비 ${formatAmount(parseAmount(product.shippingFee))}원`;
}

/** 지역별 추가비가 있으면 배송 문구 옆에 짧게 덧붙인다. */
function shippingNoteOf(product: ProductRecord): string {
  const regions = product.regions.filter((region) => region.name.trim());
  if (regions.length === 0) return '';
  return `${regions[0]?.name} 외 추가비`;
}

function toProductItem(product: ProductRecord): ProductItem {
  const options = PRODUCT_OPTIONS.filter((option) => option.productId === product.id);
  // 옵션이 있으면 재고는 옵션 합계다 — 어드민 폼이 재고를 계산하는 방식과 같아야 한다.
  const stock =
    options.length > 0
      ? options.reduce((sum, option) => sum + option.stock, 0)
      : parseAmount(product.stock);

  return {
    id: product.id,
    name: product.name,
    categoryRootId: product.categoryRootId,
    categoryChildId: product.categoryChildId,
    price: parseAmount(product.price),
    listPrice: parseAmount(product.listPrice),
    stock,
    saleState: product.saleState,
    description: product.description,
    tags: productTags(product, TODAY),
    reward: estimateReward(product),
    shippingText: shippingTextOf(product),
    // 쿠폰 체계는 아직 없다 — 생기면 store 가 계산해 넘긴다.
    benefitPrice: 0,
    shippingNote: shippingNoteOf(product),
    options: options.map((option) => ({
      id: option.id,
      color: option.color,
      size: option.size,
      stock: option.stock,
    })),
    visible: product.visible,
    imageUrl: '',
    art: productArt({
      id: product.id,
      name: product.name,
      categoryName: CATEGORIES.find((category) => category.id === product.categoryChildId)?.name ?? '',
    }),
  };
}

export const CONTENT: SiteContent = {
  supplier: {
    /*
      공급자 정보는 아직 어드민 화면 안에 상수로 있다. 회사 정보와 겹치는 항목은 store 의
      회사 프로필에서 가져오고, 나머지는 여기 남겨 둔다 — 옮기는 순간 이 블록도 store 를 읽는다.
    */
    companyName: COMPANY_PROFILE.name,
    logoUrl: '',
    ceo: COMPANY_PROFILE.ceo,
    businessNumber: COMPANY_PROFILE.businessNumber,
    mailOrderNumber: '제2026-서울성동-0000호',
    section: '정보통신업',
    industry: '소프트웨어 개발 및 공급업',
    postalCode: '04770',
    address: COMPANY_PROFILE.address,
    addressDetail: '',
    phone: COMPANY_PROFILE.phone,
    fax: '',
    email: COMPANY_PROFILE.email,
    privacyOfficer: COMPANY_PROFILE.ceo,
    hostingProvider: '자체 호스팅',
  },

  seo: {
    title: `${COMPANY_PROFILE.name} — 자원 중심 커머스 운영`,
    description: '상품·주문·콘텐츠를 한 화면에서 다루는 커머스 운영 도구입니다.',
    canonicalUrl: 'https://example.com',
    indexable: true,
    ogTitle: COMPANY_PROFILE.name,
    ogDescription: '상품·주문·콘텐츠를 한 화면에서.',
  },

  // 노출 기간이 지난 배너는 고객 화면에 나오지 않는다 — 어드민 목록의 '종료' 와 같은 판정이다.
  banners: BANNERS.filter((banner) => scheduleState(banner, TODAY) === '노출 중')
    .sort((a, b) => a.order - b.order)
    .map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      badge: banner.badge,
      linkUrl: banner.linkUrl,
      order: banner.order,
    })),

  categories: CATEGORIES.filter((category) => category.visible).map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parentId,
  })),

  products: PRODUCTS.map(toProductItem),

  notices: NOTICES.filter((notice) => notice.visible).map((notice) => ({
    id: notice.id,
    title: notice.title,
    body: notice.body,
    publishedAt: notice.createdAt,
    pinned: notice.pinned,
  })),

  news: NEWS.filter((item) => item.visible).map((item) => ({
    id: item.id,
    title: item.title,
    body: item.summary,
    publishedAt: item.publishedAt,
    linkUrl: item.url,
  })),

  faqs: FAQS.filter((faq) => faq.visible).map((faq) => ({
    id: faq.id,
    categoryId: faq.categoryId,
    categoryName: FAQ_CATEGORIES.find((category) => category.id === faq.categoryId)?.name ?? '',
    question: faq.question,
    answer: faq.answer,
  })),

  portfolios: PORTFOLIOS.filter((item) => item.visible).map((item) => ({
    id: item.id,
    title: item.title,
    client: item.client,
    period: item.period,
    body: item.body,
  })),

  company: {
    name: COMPANY_PROFILE.name,
    ceo: COMPANY_PROFILE.ceo,
    foundedAt: COMPANY_PROFILE.foundedAt,
    intro: COMPANY_PROFILE.intro,
    milestones: sortMilestones(MILESTONES.filter((milestone) => milestone.visible)).map((milestone) => ({
      id: milestone.id,
      date: milestoneDate(milestone),
      title: milestone.title,
      description: milestone.description,
    })),
  },

  terms: { label: TERMS.label, version: TERMS.version, effectiveAt: TERMS.effectiveAt, body: TERMS.body },
  privacy: {
    label: PRIVACY.label,
    version: PRIVACY.version,
    effectiveAt: PRIVACY.effectiveAt,
    body: PRIVACY.body,
  },

  /*
    폼 항목은 템플릿이 정하지 않는다 — 어드민의 `문의 > 설정` 이 저장한 값을 그대로 그린다.
    꺼 둔 항목(`enabled: false`)은 아예 오지 않는다: 고객 화면이 '보여 줄지' 를 다시 판단하면
    운영자가 끈 항목이 템플릿마다 다르게 나타난다.
  */
  inquiryForm: {
    categories: INQUIRY_CATEGORIES,
    fields: INQUIRY_FIELDS.filter((field) => field.enabled).map((field) => ({
      key: field.key,
      label: field.label,
      required: field.required,
    })),
    attachment: INQUIRY_ATTACHMENT,
    guideText: INQUIRY_GUIDE_TEXT,
    doneText: INQUIRY_DONE_TEXT,
  },
};

/**
 * 헤더 메뉴 구조.
 *
 * **템플릿이 각자 메뉴를 짜지 않는다.** 배치(가로 내비 · 사이드 내비 · 햄버거)는 템플릿 몫이지만,
 * 무엇이 몇 번째에 있고 그 아래 무엇이 걸리는지는 6개가 같아야 한다 —
 * 메뉴가 갈라지면 IA 문서가 템플릿마다 달라지고, 사용자는 같은 브랜드에서 다른 길을 찾게 된다.
 *
 * `상품` 아래는 **어드민에 등록된 1Depth 카테고리**가 그대로 온다.
 */
export type NavChild = { id: string; label: string; href: string };

/**
 * `emphasis` — 눈에 띄게 둘 메뉴. 어느 것을 강조할지는 장사의 판단이라
 * 템플릿이 각자 정하면 6개가 서로 다른 것을 밀게 된다.
 */
export type NavItem = NavChild & { children: NavChild[]; emphasis?: boolean };

export function buildNav(content: SiteContent = CONTENT): NavItem[] {
  const roots = content.categories.filter((category) => !category.parentId);

  return [
    {
      id: 'company',
      label: COPY.nav.company,
      href: ROUTES.company,
      children: [
        { id: 'company-intro', label: COPY.nav.companyIntro, href: ROUTES.company },
        { id: 'company-history', label: COPY.nav.milestones, href: ROUTES.companyHistory },
        { id: 'company-portfolio', label: COPY.nav.portfolios, href: ROUTES.portfolios },
      ],
    },
    { id: 'new', label: COPY.nav.newArrivals, href: ROUTES.productsByTag('NEW'), children: [], emphasis: true },
    { id: 'best', label: COPY.nav.best, href: ROUTES.productsByTag('BEST'), children: [], emphasis: true },
    {
      id: 'products',
      label: COPY.nav.products,
      href: ROUTES.products,
      children: roots.map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
        href: ROUTES.productsByCategory(category.id),
      })),
    },
    {
      id: 'support',
      label: COPY.nav.support,
      href: ROUTES.notices,
      children: [
        { id: 'support-notice', label: COPY.nav.notices, href: ROUTES.notices },
        { id: 'support-faq', label: COPY.nav.faqs, href: ROUTES.faqs },
        { id: 'support-news', label: COPY.nav.news, href: ROUTES.news },
      ],
    },
  ];
}

/** 노출 중인 상품만. 숨김 상품이 고객 화면에 새어 나가면 안 된다. */
export function visibleProducts(content: SiteContent = CONTENT) {
  return content.products.filter((product) => product.visible);
}

export function productsWithTag(tag: 'NEW' | 'BEST', content: SiteContent = CONTENT) {
  return visibleProducts(content).filter((product) => product.tags.includes(tag));
}

export function productsInCategory(categoryId: string, content: SiteContent = CONTENT) {
  // 1Depth 를 고르면 그 아래 2Depth 상품까지 함께 나와야 한다 — 상위만 보고 거르면 늘 비어 보인다.
  const childIds = content.categories
    .filter((category) => category.parentId === categoryId)
    .map((category) => category.id);

  return visibleProducts(content).filter(
    (product) => product.categoryRootId === categoryId || childIds.includes(product.categoryChildId),
  );
}

export function findProduct(id: string) {
  return CONTENT.products.find((product) => product.id === id);
}

export function findNotice(id: string) {
  return CONTENT.notices.find((notice) => notice.id === id);
}

export function findNews(id: string) {
  return CONTENT.news.find((item) => item.id === id);
}

export function findFaq(id: string) {
  return CONTENT.faqs.find((faq) => faq.id === id);
}

export function categoryPath(product: { categoryRootId: string; categoryChildId: string }): string {
  const root = CONTENT.categories.find((item) => item.id === product.categoryRootId)?.name;
  const child = CONTENT.categories.find((item) => item.id === product.categoryChildId)?.name;
  return [root, child].filter(Boolean).join(' · ');
}

export function formatMoney(value: number): string {
  return value.toLocaleString('ko-KR');
}

/** 할인율 — 정가가 판매가보다 클 때만 뜻이 있다. */
export function discountRate(price: number, listPrice: number): number {
  if (listPrice <= price || listPrice <= 0) return 0;
  return Math.round(((listPrice - price) / listPrice) * 100);
}
