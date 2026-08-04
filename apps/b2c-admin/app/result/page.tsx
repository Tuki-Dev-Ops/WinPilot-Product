import type { Metadata } from 'next';
import { StatusScreen } from '@winpilot/ui';

/**
 * Feature: `status.result` · B2C Admin · route `/result`
 *
 * 고객 화면과 **같은 컴포넌트**를 쓴다(`StatusScreen`). 운영자가 보는 결과 화면이라 돌아갈
 * 곳만 다르다 — 문구와 배치가 갈라지면 같은 회사의 두 화면이 다른 제품처럼 보인다.
 *
 * 완료와 실패를 한 화면에 둔 까닭은 고객 화면 쪽 주석에 적어 두었다.
 */
export const metadata: Metadata = { title: '처리 결과 — WinPilot Admin' };

type Search = { state?: string; kind?: string; id?: string };

const KIND = {
  save: { done: '저장했습니다.', failed: '저장하지 못했습니다.', back: { href: '/', label: '대시보드로' } },
  upload: {
    done: '업로드가 끝났습니다.',
    failed: '업로드하지 못했습니다.',
    back: { href: '/contents/notices', label: '콘텐츠 목록' },
  },
  order: {
    done: '처리했습니다.',
    failed: '처리하지 못했습니다.',
    back: { href: '/products/sales', label: '판매 목록' },
  },
} as const;

export default async function AdminStatusResultPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { state, kind, id } = await searchParams;

  const failed = state === 'failed';
  const shape = KIND[(kind as keyof typeof KIND) ?? 'save'] ?? KIND.save;

  return (
    <StatusScreen
      title={failed ? shape.failed : shape.done}
      description={
        failed
          ? ['처리 중 문제가 발생해 반영되지 않았습니다.', '입력값을 확인하고 다시 시도해 주세요.']
          : ['변경 내용이 반영되었습니다.', '고객 화면에는 노출 설정에 따라 나타납니다.']
      }
      tone={failed ? 'danger' : 'success'}
      actions={[
        { href: shape.back.href, label: shape.back.label, primary: true },
        { href: '/', label: '대시보드로' },
      ]}
    >
      {id && (
        <p className="w-fit rounded-lg bg-canvas px-4 py-2 font-mono text-xs tabular-nums text-ink-muted">
          처리 번호 {id}
        </p>
      )}
    </StatusScreen>
  );
}
