import type { Metadata } from 'next';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { ChannelFeed } from './_components/ChannelFeed';

/**
 * Feature: `marketing.detail` · F&B Client (템플릿 A) · route `/marketing`
 *
 * ## 하는 말이 아니라 **올린 것**을 보여 준다
 * 여기 있던 것은 `본사 부담 / 분담 / 점주 부담` 표였다. 계약 조건으로는 맞았지만 마케팅을 보러
 * 온 사람이 실제로 묻는 것은 **이 브랜드가 밖에서 어떻게 보이는가**다. 창구를 세우고 거기 올라간
 * 것을 그대로 걸면, 잘 돌고 있다는 말을 하지 않고도 보인다.
 *
 * 부담이 어떻게 갈리는지는 없어지지 않았다 — 창업 안내의 비용 표가 얼마 드는지를 적고, 계약
 * 전에는 정보공개서가 항목마다 답한다. 같은 말을 두 곳에서 다르게 적는 편이 위험하다.
 *
 * ## 상담으로 보내는 판이 없다
 * 인테리어와 같은 판단이다(그쪽 머리말) — 이 화면이 답하는 것은 **밖에서 어떻게 보이는가**
 * 하나이고, 검은 판이 사진 카드 격자 바로 아래 서면 방금 본 카드들의 색을 덮었다.
 *
 * ## 어드민 연동
 * - 창구 · 글 ← `@winpilot/store` 의 `MARKETING_CHANNELS` · `MARKETING_POSTS`
 */
export const metadata: Metadata = { title: '마케팅' };

export default function MarketingListPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Marketing"
        title={
          <>
            본사가 <Accent>하는 것</Accent>을 그대로
          </>
        }
        description="본사가 브랜드를 어떻게 알리고 있는지, 실제로 올린 것으로 보여 드립니다."
      />

      <ChannelFeed />
    </FnbSiteShell>
  );
}
