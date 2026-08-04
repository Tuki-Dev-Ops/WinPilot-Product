import type { Metadata } from 'next';
import { StatusScreen } from '@winpilot/ui';
import { CONTENT, ROUTES } from '@winpilot/client-content';

/**
 * Feature: `status.result` · B2C Client (템플릿 A) · route `/result`
 *
 * **완료와 실패가 한 화면**이다. 두 화면은 문구만 다르고 구조가 같아서, 나눠 두면 한쪽만
 * 고쳐 두 화면이 어긋난다. 무엇이 끝났는지(`kind`)와 잘됐는지(`state`)를 주소로 받는다.
 *
 * 주소로 받는 이유는 결제·주문처럼 **되돌아올 수 있어야** 하기 때문이다 — 화면 안의 상태로
 * 두면 새로고침하는 순간 무엇이 끝났는지 알 수 없게 된다.
 *
 * ## 어드민 연동
 * - 주문 결과의 주문번호는 어드민 메뉴의 **'판매'** 목록(`/products/sales`)에 그대로 나타난다
 * - 문의 결과의 안내 문구 ← 문의 > 설정의 **접수 완료 문구** (store `INQUIRY_DONE_TEXT`)
 */
export const metadata: Metadata = { title: `처리 결과 — ${CONTENT.seo.title}` };

type Search = { state?: string; kind?: string; id?: string };

/** 무엇이 끝났는지에 따라 달라지는 것 — 제목과 돌아갈 곳. */
const KIND = {
  signup: {
    done: '가입이 완료되었습니다.',
    failed: '가입하지 못했습니다.',
    back: { href: ROUTES.mypage, label: '마이페이지' },
  },
  order: {
    done: '주문이 접수되었습니다.',
    failed: '주문을 완료하지 못했습니다.',
    back: { href: ROUTES.orders, label: '주문 내역' },
  },
  inquiry: {
    done: '문의가 접수되었습니다.',
    failed: '문의를 보내지 못했습니다.',
    back: { href: ROUTES.contact, label: '문의하기' },
  },
  save: {
    done: '저장했습니다.',
    failed: '저장하지 못했습니다.',
    back: { href: ROUTES.mypage, label: '마이페이지' },
  },
} as const;

export default async function StatusResultPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { state, kind, id } = await searchParams;

  const failed = state === 'failed';
  const shape = KIND[(kind as keyof typeof KIND) ?? 'order'] ?? KIND.order;

  return (
    <StatusScreen
      title={failed ? shape.failed : shape.done}
      description={
        failed
          ? ['처리 중 문제가 발생해 완료되지 않았습니다.', '잠시 후 다시 시도하거나 고객지원으로 문의해 주세요.']
          : kind === 'signup'
            ? ['이제 주문 내역과 쿠폰함을 쓸 수 있습니다.', '첫 구매 쿠폰은 쿠폰함에서 받아 주세요.']
            : ['처리가 정상적으로 끝났습니다.', '진행 상황은 아래 화면에서 확인할 수 있습니다.']
      }
      tone={failed ? 'danger' : 'success'}
      actions={[
        { href: shape.back.href, label: shape.back.label, primary: true },
        { href: ROUTES.home, label: '홈으로' },
      ]}
    >
      {id && (
        <p className="w-fit rounded-lg bg-canvas px-4 py-2 font-mono text-xs tabular-nums text-ink-muted">
          접수 번호 {id}
        </p>
      )}
    </StatusScreen>
  );
}
