import type { Metadata } from 'next';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { MenuBoard } from './_components/MenuBoard';

/**
 * Feature: `menu.list` · F&B Client (템플릿 A) · route `/menu`
 *
 * 화면이 하는 일은 제목과 알레르기 한 줄을 세우는 것뿐이다 — 묶음을 어떻게 고르고 왜 갈랐는지는
 * `MenuBoard` 머리말에 있다.
 *
 * ## 어드민 연동
 * - 메뉴 ← `@winpilot/store` 의 `MENU_ITEMS` (F&B 어드민 메뉴 > 목록)
 * - 묶음 ← 같은 곳의 `MENU_CATEGORIES` (메뉴 > 설정)
 */
export const metadata: Metadata = { title: '메뉴' };

export default function MenuListPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Menu"
        title={
          <>
            그날 들어온 <Accent>문어</Accent>만 씁니다
          </>
        }
        description="문어는 새벽 경매에서 받아 그날 다 씁니다. 값은 부가세가 포함된 금액입니다."
      />

      <MenuBoard />

      {/*
        알레르기 안내를 메뉴판 아래에 한 번 둔다. 줄마다 적으면 스무 줄이 같은 문장을 이고
        서게 되고, 정작 필요한 사람은 **상세 화면**에서 자기 것만 확인한다.
      */}
      <p className="rounded-xl bg-surface px-6 py-5 text-sm leading-relaxed text-ink-muted">
        알레르기 유발 재료는 메뉴를 눌러 확인하실 수 있습니다. 조리 기구를 함께 쓰므로 미량이
        섞일 수 있습니다 — 심한 알레르기가 있으시면 주문 전에 매장에 말씀해 주세요.
      </p>
    </FnbSiteShell>
  );
}
