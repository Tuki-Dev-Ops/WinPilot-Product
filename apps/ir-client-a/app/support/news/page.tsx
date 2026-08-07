import type { Metadata } from 'next';
import { IR_COMPANY, publicMediaClips } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { NewsListView } from './_components/NewsListView';

/**
 * Feature: `news.list` · IR Client (템플릿 A) · route `/support/news`
 *
 * ## 홈의 마지막 칸이 여기로 이어진다
 * 홈 맨 아래 `스마트팩토리 Replay` 는 옆으로 미는 줄이라 **다섯 장 남짓**만 보인다. 그 줄에서
 * 관심이 생긴 사람이 갈 곳이 있어야 하는데, 전에는 그 자리가 IR 자료실(`/library`)이었다 —
 * 거기 있는 것은 사업보고서와 IR 발표자료라, 영상을 보러 간 사람에게는 다른 창고다.
 *
 * ## 왜 CS CENTER 아래인가
 * ABOUT 은 회사를 소개하는 자리, SOLUTION·PRODUCT 는 파는 것을 소개하는 자리다. 뉴스는 그 둘
 * 어디에도 들지 않고 **찾아온 사람이 더 볼 것**에 가깝다 — 문의·FAQ·오시는 길과 같은 갈래다.
 *
 * ## 어드민 연동
 * - 영상 목록 ← `@winpilot/store` 의 `MEDIA_CLIPS` (IR 어드민 홈페이지 > 미디어)
 */
export const metadata: Metadata = { title: `뉴스 — ${IR_COMPANY.name}` };

export default function SiteNewsPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="뉴스" description="방송·행사·제품 소개로 남은 것들입니다." />

      <NewsListView clips={publicMediaClips()} />
    </IrSiteShell>
  );
}
