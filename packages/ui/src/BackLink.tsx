import { ChevronLeft } from 'lucide-react';

/**
 * 상세 화면 맨 위의 **되돌아가는 길**.
 *
 * ## 왜 위쪽인가
 * 아래에도 `목록으로` 단추가 있는 화면이 있었다. 그런데 상세는 내용이 길어 아래줄이 첫 화면에
 * 보이지 않고, **돌아가려면 끝까지 스크롤해야** 했다. 브라우저 뒤로가기는 목록의 탭·검색어를
 * 되살리지만 그것을 아는 사람만 쓰고, 어드민을 종일 쓰는 사람도 화면 안의 길을 먼저 찾는다.
 *
 * ## 왜 `<a>` 인가 (뒤로가기가 아니라)
 * `history.back()` 은 **어디로 가는지 미리 알 수 없다.** 다른 화면에서 링크로 바로 들어왔거나
 * 새 탭으로 열었으면 엉뚱한 곳으로 가거나 아무 데도 가지 못한다. 목록 주소를 못 박아 두면
 * 어떤 경로로 들어왔든 같은 곳으로 간다 — 그리고 마우스를 얹으면 어디로 갈지 상태 표시줄에
 * 미리 보인다.
 *
 * ## 화살표는 SVG 다
 * 글꼴 글리프(←)로 두면 Figma 에서 모양이 달라진다(`docs/spec/05-component.md`).
 */
export type BackLinkProps = {
  href: string;
  /** 어디로 돌아가는지. `목록` 이 아니라 `공지사항 목록` 처럼 무엇의 목록인지 적는다 */
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <a
      href={href}
      className="group -ml-1 flex w-fit shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <ChevronLeft aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 truncate">{label}</span>
    </a>
  );
}
