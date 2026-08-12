import type { Metadata } from 'next';
import { FNB_BRAND } from '@winpilot/store';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { StoreFinder } from './_components/StoreFinder';

/**
 * Feature: `store.list` · F&B Client (템플릿 A) · route `/stores`
 *
 * ## 지도를 직접 그리지 않는다
 * 한때 통계청 경계선(`@winpilot/geo`)으로 시 · 도 → 시 · 군 · 구 → 읍 · 면 · 동 세 층을 그렸다.
 * 동네까지 당겨 볼 수는 있었지만 **길과 건물이 없었다** — 매장 찾기에 온 사람이 결국 하는 일은
 * "여기서 어떻게 가지" 이고, 그 답은 행정 경계가 아니라 길에 있다.
 *
 * 지도를 직접 그리는 값어치는 **지도가 답이 아닐 때**에 있다(어느 도에서 문의가 많이 오는가 —
 * IR 어드민이 그렇다). 여기서는 지도가 곧 답이라 카카오 지도를 쓴다.
 *
 * 그래서 이 화면은 이제 넘길 값이 없다. 매장은 찾는 자리가 store 에서 바로 읽는다.
 *
 * ## 어드민 연동
 * - 매장 ← `@winpilot/store` 의 `STORES` (F&B 어드민 매장 > 목록)
 */
export const metadata: Metadata = { title: '매장안내' };


export default function StoreListPage() {
  return (
    <FnbSiteShell>
      {/*
        한 줄을 안내가 아니라 **소개**로 적는다. 전에는 `여는 시간과 되는 것이 매장마다 다릅니다`
        였는데, 그것은 화면 쓰는 법이지 이 브랜드에 대한 말이 아니다 — 지도 위에 서는 첫 문장은
        몇 곳에서 무엇을 지키는지를 말해야 하고, 매장마다 다르다는 사실은 줄마다 이미 적혀 있다.
      */}
      <FnbPageTitle
        label="Store"
        title={
          <>
            <Accent>가까운 곳</Accent>을 찾아 드립니다
          </>
        }
        description={`${FNB_BRAND.foundedYear}년 군산 한 곳에서 시작해 지금 여기까지 왔습니다. 어느 매장에서든 그날 들어온 문어만 씁니다.`}
      />
      <StoreFinder />
    </FnbSiteShell>
  );
}
