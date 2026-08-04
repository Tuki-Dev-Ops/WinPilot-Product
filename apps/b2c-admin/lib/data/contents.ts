/**
 * 이 파일은 값을 갖지 않는다 — 저장된 값은 @winpilot/store 한 곳에만 있다.
 * 어드민과 고객 화면이 각자 시드를 들면 두 화면이 서로 다른 것을 보여주게 된다.
 */
export {
  FAQS,
  FAQ_CATEGORIES,
  NEWS,
  NOTICES,
  PORTFOLIOS,
  findNews,
  findNotice,
  findPortfolio,
  nextContentId,
  type FaqCategoryRecord,
  type FaqRecord,
  type NewsRecord,
  type NoticeRecord,
  type PortfolioRecord,
} from '@winpilot/store';
