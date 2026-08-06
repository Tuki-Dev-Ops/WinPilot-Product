import type { ReactNode } from 'react';
import { BackLink } from '@winpilot/ui';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { SiteHeader } from './SiteHeader';

/**
 * 템플릿 A 의 껍데기 — **가로 상단 내비(SiteHeader) + 넓은 본문 + 정보형 푸터**.
 *
 * 이 배치가 A 를 A 답게 만드는 부분이다. B~F 는 여기를 다르게 짠다(사이드 내비, 분할 화면 등).
 * 반면 **문구와 경로, 슬롯 이름은 손대지 않는다** — `@winpilot/client-content` 의 COPY·ROUTES·SLOT
 * 을 그대로 쓴다. 템플릿이 자기 문구를 갖기 시작하면 어드민에서 바꾼 값이 일부 템플릿에만 반영된다.
 *
 * ## 어드민 연동
 * - 푸터의 사업자 정보 · 대표자 · 통신판매업신고 ← `b2c-admin` 설정 > 공급자 정보 (`/settings/supplier`)
 * - 약관 · 개인정보 링크 ← 설정 > 약관 정보
 */

export function SiteShell({ children }: { children: ReactNode }) {
  const { supplier } = CONTENT;

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-320 flex-1 flex-col gap-12 px-6 py-10">{children}</main>

      <footer
        id={SLOT.footer}
        data-ssot-cid={cid('site.home', 'SiteFooter')}
        className="border-t border-border bg-surface"
      >
        <div className="mx-auto flex w-full max-w-320 flex-col gap-4 px-6 py-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={ROUTES.terms} className="text-sm font-medium">
              {COPY.footer.terms}
            </a>
            <a href={ROUTES.privacy} className="text-sm font-medium">
              {COPY.footer.privacy}
            </a>
          </div>

          {/*
            전자상거래법상 표시 의무 항목이다. 어드민의 공급자 정보에서 온 값을 그대로 쓴다 —
            템플릿이 임의로 항목을 빼면 법적으로 문제가 된다.
          */}
          <p className="text-xs leading-relaxed text-ink-muted">
            {supplier.companyName} · {COPY.footer.ceoLabel} {supplier.ceo} ·{' '}
            {COPY.footer.businessNumberLabel} {supplier.businessNumber} · {COPY.footer.mailOrderLabel}{' '}
            {supplier.mailOrderNumber}
          </p>
          <p className="text-xs leading-relaxed text-ink-muted">
            ({supplier.postalCode}) {supplier.address} {supplier.addressDetail} · {COPY.footer.phoneLabel}{' '}
            {supplier.phone}
            {supplier.fax && ` · ${COPY.footer.faxLabel} ${supplier.fax}`} · {supplier.email}
          </p>
          <p className="text-xs leading-relaxed text-ink-faint">
            {COPY.footer.privacyOfficerLabel} {supplier.privacyOfficer}
            {supplier.hostingProvider && ` · ${COPY.footer.hostingLabel} ${supplier.hostingProvider}`}
          </p>
        </div>
      </footer>
    </div>
  );
}

/** 화면 제목 — 템플릿마다 크기·정렬은 달라도 위치(본문 맨 위)는 같다. */
export function PageTitle({
  title,
  description,
  back,
}: {
  title: string;
  description?: string;
  /**
   * 상세 화면에서 **돌아갈 목록**. 제목 위에 선다.
   *
   * 브라우저 뒤로가기에 맡기지 않는 이유: 검색 결과나 공유받은 링크로 바로 들어온 사람에게는
   * 돌아갈 곳이 없다. 그 경우 뒤로가기는 사이트 밖으로 나간다.
   */
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-2">
      {back && <BackLink href={back.href} label={back.label} />}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
    </div>
  );
}

/**
 * 어드민 에디터가 만든 HTML 을 그린다.
 *
 * 값의 출처는 어드민이며 외부 입력이 아니다 — 편집기에 넣은 것과 같은 신뢰 수준으로 다룬다.
 */
export function RichBody({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`text-sm leading-relaxed [&_a]:text-brand-700 [&_a]:underline [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
