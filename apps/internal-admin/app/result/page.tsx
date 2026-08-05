import type { Metadata } from "next";
import { StatusScreen } from "@winpilot/ui";
import { InternalShell } from "@/app/_components/InternalShell";

/**
 * Feature: `status.result` · Internal Admin · route `/result`
 *
 * 세 앱 중 마지막 하나. 컴포넌트도 문구 구조도 앞의 둘과 같고, 돌아갈 곳만 사내 어드민의
 * 화면을 가리킨다.
 */
export const metadata: Metadata = { title: "처리 결과 — WinPilot Internal" };

type Search = { state?: string; kind?: string; id?: string };

const KIND = {
  save: {
    done: "저장했습니다.",
    failed: "저장하지 못했습니다.",
    back: { href: "/tenants", label: "고객사 목록" },
  },
  invoice: {
    done: "청구서를 발행했습니다.",
    failed: "청구서를 발행하지 못했습니다.",
    back: { href: "/billing/due", label: "청구 예정" },
  },
} as const;

export default async function InternalStatusResultPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { state, kind, id } = await searchParams;

  const failed = state === "failed";
  const shape = KIND[(kind as keyof typeof KIND) ?? "save"] ?? KIND.save;

  // 메뉴에 없는 화면이라 사이드바에서 켜지는 항목이 없다 — 없는 자리를 켜 두면 어디서 왔는지를 잘못 읽는다.
  return (
    <InternalShell sectionId="result" trail={['처리 결과']}>
      <StatusScreen
        title={failed ? shape.failed : shape.done}
        description={
          failed
            ? [
                "처리 중 문제가 발생해 반영되지 않았습니다.",
                "입력값을 확인하고 다시 시도해 주세요.",
              ]
            : [
                "변경 내용이 반영되었습니다.",
                "고객사 화면에는 설정에 따라 적용됩니다.",
              ]
        }
        tone={failed ? "danger" : "success"}
        layout="center"
        actions={[
          { href: shape.back.href, label: shape.back.label, primary: true },
          { href: "/", label: "홈으로" },
        ]}
      >
        {id && (
          <p className="w-fit rounded-lg bg-canvas px-4 py-2 font-mono text-xs tabular-nums text-ink-muted">
            처리 번호 {id}
          </p>
        )}
      </StatusScreen>
    </InternalShell>
  );
}
