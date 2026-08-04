import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `faq.list` · B2C Client (템플릿 A) · route `/faqs`
 *
 * 접었다 펴는 아코디언 대신 **목록 → 상세**로 간다. 공지·뉴스와 같은 동작이어야 갈래를
 * 옮겨도 조작이 달라지지 않고, 답변 하나를 그대로 공유할 주소도 생긴다.
 *
 * ## 어드민 연동
 * - 문답 · 분류 ← `b2c-admin` 콘텐츠 > FAQ (`/contents/faqs`)
 * - 분류 이름 ← 같은 화면의 FAQ 카테고리 (store `FAQ_CATEGORIES`)
 */
export const metadata: Metadata = { title: `${COPY.faq.listTitle} — ${CONTENT.seo.title}` };

export default function FaqListPage() {
  return (
    <SiteShell>
      <SupportShell>
        <SupportHeading title={COPY.faq.listTitle} />

        {CONTENT.faqs.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.faq.empty}</p>
        ) : (
          <div className="flex flex-col">
            {CONTENT.faqs.map((faq) => (
              <a
                key={faq.id}
                href={ROUTES.faqDetail(faq.id)}
                className="flex items-center gap-3 border-b border-border px-1 py-4 hover:bg-surface"
              >
                <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                  {faq.categoryName}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{faq.question}</span>
              </a>
            ))}
          </div>
        )}
      </SupportShell>
    </SiteShell>
  );
}
