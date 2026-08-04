/**
 * 아직 디자인이 들어가지 않은 화면의 자리표시자.
 *
 * 껍데기(라우트 · 레지스트리 등록 · 내비게이션 배선)는 완성되어 있고 본문만 비어 있다.
 * 디자인이 들어가면 이 컴포넌트를 지우고 실제 내용을 넣는다.
 */
export type AdminPagePlaceholderProps = {
  title: string;
  featureId: string;
  route: string;
};

export function AdminPagePlaceholder({ title, featureId, route }: AdminPagePlaceholderProps) {
  return (
    <section className="rounded-xl border border-dashed border-border-strong bg-canvas px-6 py-20 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">디자인 작업 예정 — 본문만 비어 있고 배선은 완료되었습니다.</p>
      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="font-mono text-xs text-ink-faint">{featureId}</span>
        <span className="font-mono text-xs text-ink-faint">{route}</span>
      </div>
    </section>
  );
}
