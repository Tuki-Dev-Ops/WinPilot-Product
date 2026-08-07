import type { Metadata } from 'next';
import { IR_COMPANY, SITE_NOTICES } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { NoticeListView } from './_components/NoticeListView';

/**
 * Feature: `notice.list` · IR Client (템플릿 A) · route `/support/notices`
 *
 * ## 왜 CS CENTER 아래인가
 * 공지는 **회사가 알리고 싶은 것**이 아니라 **찾아온 사람이 확인해야 하는 것**이다 — 휴무라
 * 답이 늦는다거나, 대표번호가 바뀌었다거나. 그 성격이 문의·FAQ·오시는 길과 같아서 여기 둔다.
 * ABOUT 아래에 두면 회사 소개를 읽으러 온 사람만 보고, 정작 전화가 안 걸려 찾아온 사람은
 * 지나친다.
 *
 * ## 숨긴 것은 아예 내려보내지 않는다
 * `visible` 이 아닌 것을 브라우저로 보내고 거기서 거르면, 아직 알리지 않기로 한 공지가
 * **화면에는 없지만 페이지 소스에는 그대로 있다.** 개편·가격 변경처럼 때를 정해 알리는 것이
 * 공지라, 그 새어 나감이 실제로 문제가 된다. 그래서 서버에서 걸러 보낸다.
 *
 * ## 어드민 연동
 * - 공지 목록 ← `@winpilot/store` 의 `SITE_NOTICES` (IR 어드민 콘텐츠 > 공지사항)
 */
export const metadata: Metadata = { title: `공지사항 — ${IR_COMPANY.name}` };

export default function SiteNoticesPage() {
  const notices = SITE_NOTICES.filter((one) => one.visible);

  return (
    <IrSiteShell>
      <IrPageTitle title="공지사항" description="휴무 · 연락처 · 약관 개정처럼 미리 알려 드릴 것들입니다." />

      <NoticeListView notices={notices} />
    </IrSiteShell>
  );
}
