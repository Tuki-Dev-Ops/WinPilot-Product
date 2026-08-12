import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionListView } from './_components/SolutionListView';

/**
 * Feature: `solution.list` · IR Admin · route `/solutions`
 *
 * 사이트의 제품 상세(`/solutions/*`)가 이 값을 읽는다.
 *
 * ## 갈래 이름과 주소가 어긋나 보인다
 * 메뉴에는 `문제 · 해법` 으로 서는데 주소는 `/solutions` 다. 이름만 바꾸고 주소는 두었다 —
 * 밖에서 들어오는 화면이 아니라 운영자가 메뉴로만 여는 자리라 주소를 바꿔 얻는 것이 없고,
 * 바꾸면 즐겨찾기와 캡처 명세가 함께 끊긴다.
 */
export const metadata: Metadata = {
  title: '문제 · 해법 | 목록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function IrSolutionListPage() {
  return (
    <IrShell sectionId="solution" trail={['문제 · 해법', '목록']} activeChildId="solution-list">
      <SolutionListView />
    </IrShell>
  );
}
