import type { Metadata } from 'next';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { FranchiseTabs } from '@/app/franchise/_components/FranchiseTabs';
import { FranchiseApplyForm } from './_components/FranchiseApplyForm';

/**
 * Feature: `franchise.apply` · F&B Client (템플릿 A) · route `/franchise/apply`
 *
 * 화면이 하는 일은 양식을 세우는 것뿐이다 — 무엇을 왜 묻는지는 `FranchiseApplyForm` 머리말에 있다.
 *
 * ## 돌아가는 길 대신 탭이다
 * 한때 위에 `창업 안내` 로 돌아가는 링크를 뒀다. 창업 아래에 화면이 셋이 되면서 탭이 그 일을
 * 대신한다 — 돌아가는 것뿐 아니라 **어디가 더 있는지**까지 한 줄이 말한다.
 */
export const metadata: Metadata = { title: '창업 상담 신청' };

export default function InquiryListPage() {
  return (
    <FnbSiteShell applyBar={false}>
      <FnbPageTitle
        label="Franchise"
        title={
          <>
            번호만 남겨 주시면 <Accent>하루 안에</Accent>
          </>
        }
        description="첫 통화에서는 아무것도 정하지 않습니다 — 무엇이 궁금한지 먼저 듣습니다."
      />
      <FranchiseTabs />
      <FranchiseApplyForm />
    </FnbSiteShell>
  );
}
